import os
import json
from datetime import datetime, timezone, timedelta
import pandas as pd
from google import genai
from google.genai import types
from dotenv import load_dotenv

import database
import api_fetch

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL = "gemini-3-flash-preview"  # using free tier api 

SYSTEM_PROMPT = """You are the assistant embedded in WeatherDrop, a weather website
built by Ahsan Mustafa as a learning project. You help users check current
weather conditions and historical weather trends for any city.

Be warm, brief, and conversational — this is a small chat widget, not a report.
Always use your tools to get real data before answering any question about
actual weather conditions or statistics. Never guess or make up a number.
If a tool returns an error (e.g. location not found), tell the user clearly
and ask them to try a different city name.
"""

get_current_conditions_decl = {
    "name": "get_current_conditions",
    "description": (
        "Get the current weather conditions (temperature, feels like, "
        "humidity, wind, pressure, description) for a named city. Works "
        "for any city, whether or not it's already saved on the site."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "location_name": {
                "type": "string",
                "description": "The city name the user asked about, e.g. 'Tokyo' or 'Lahore'",
            }
        },
        "required": ["location_name"],
    },
}

get_historical_stats_decl = {
    "name": "get_historical_stats",
    "description": (
        "Get the average, minimum, and maximum of a specific weather "
        "metric over the past several days for a named city. Use this "
        "for questions about averages, trends, highs, or lows."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "location_name": {"type": "string", "description": "The city name"},
            "metric": {
                "type": "string",
                "enum": ["temperature", "humidity", "pressure", "wind", "uvindex", "dew_point"],
                "description": "Which weather metric to summarize",
            },
            "days": {
                "type": "integer",
                "description": "How many past days to include (max 3, since that's all we store)",
            },
        },
        "required": ["location_name", "metric"],
    },
}

TOOLS = types.Tool(function_declarations=[get_current_conditions_decl, get_historical_stats_decl])


def find_or_create_location(conn, location_name):
    locations = database.fetch_locations(conn)
    for loc in locations:
        if loc["name"].strip().lower() == location_name.strip().lower():
            return loc["id"], loc["latitude"], loc["longitude"]

    geo_data = api_fetch.get_geo_data(location_name)
    if geo_data is None or "results" not in geo_data or len(geo_data["results"]) == 0:
        return None, None, None

    parsed = api_fetch.parse_geo(geo_data)[0]
    location_id = database.insert_location(
        conn, parsed["name"], parsed["latitude"], parsed["longitude"],
        parsed["country"], parsed["admin1"]
    )
    if location_id is None:
        return None, None, None

    forecast_data = api_fetch.get_forecast_data(parsed["latitude"], parsed["longitude"])
    if forecast_data is None:
        return None, None, None

    offset_seconds = api_fetch.get_utc_offset(forecast_data)
    database.update_location_offset(conn, location_id, offset_seconds)

    parsed_forecast = api_fetch.parse_forecast(forecast_data)
    if parsed_forecast is None:
        return None, None, None

    database.insert_forecasts(conn, location_id, parsed_forecast)
    return location_id, parsed["latitude"], parsed["longitude"]


def execute_get_current_conditions(location_name):
    conn = database.get_connection()
    if conn is None:
        return {"error": "Could not connect to the database."}
    try:
        location_id, lat, lon = find_or_create_location(conn, location_name)
        if location_id is None:
            return {"error": f"Could not find a location matching '{location_name}'."}

        now = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
        with conn.cursor() as cur:
            cur.execute(
                """SELECT temperature, feels_like, weather_code, humidity, wind,
                        pressure, precipitation_probability
                    FROM forecasts WHERE location_id = %s AND timestamp >= %s
                    ORDER BY timestamp ASC LIMIT 1;""",
                (location_id, now),
            )
            row = cur.fetchone()

        if row is None:
            return {"error": "No current data available for that location yet."}

        return {
            "location": location_name,
            "temperature_celsius": float(row[0]),
            "feels_like_celsius": float(row[1]),
            "weather_code": row[2],
            "humidity_percent": row[3],
            "wind_kmh": float(row[4]),
            "pressure_mb": float(row[5]),
            "precipitation_probability_percent": row[6],
        }
    finally:
        conn.close()


def execute_get_historical_stats(location_name, metric, days=3):
    conn = database.get_connection()
    if conn is None:
        return {"error": "Could not connect to the database."}
    try:
        location_id, lat, lon = find_or_create_location(conn, location_name)
        if location_id is None:
            return {"error": f"Could not find a location matching '{location_name}'."}

        days = min(days or 3, 3)
        now = datetime.now(timezone.utc)
        since = now - timedelta(days=days)

        with conn.cursor() as cur:
            cur.execute(
                f"""SELECT timestamp, {metric} FROM forecasts
                    WHERE location_id = %s AND timestamp >= %s AND timestamp <= %s
                    ORDER BY timestamp ASC;""",
                (location_id, since, now),
            )
            rows = cur.fetchall()

        if not rows:
            return {"error": "No historical data available for that location."}

        df = pd.DataFrame(rows, columns=["timestamp", metric])
        return {
            "location": location_name,
            "metric": metric,
            "days": days,
            "average": round(float(df[metric].mean()), 2),
            "minimum": round(float(df[metric].min()), 2),
            "maximum": round(float(df[metric].max()), 2),
        }
    finally:
        conn.close()


TOOL_EXECUTORS = {
    "get_current_conditions": lambda args: execute_get_current_conditions(args["location_name"]),
    "get_historical_stats": lambda args: execute_get_historical_stats(
        args["location_name"], args["metric"], args.get("days", 3)
    ),
}


def handle_chat(messages):
    contents = [
        types.Content(role=m["role"], parts=[types.Part(text=m["content"])])
        for m in messages
    ]

    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        tools=[TOOLS],
    )

    response = client.models.generate_content(model=MODEL, contents=contents, config=config)

    # tool-call loop
    while True:
        function_calls = [
            part.function_call
            for part in response.candidates[0].content.parts
            if part.function_call is not None
        ]
        if not function_calls:
            break

        contents.append(response.candidates[0].content)

        function_response_parts = []
        for call in function_calls:
            executor = TOOL_EXECUTORS.get(call.name)
            result = executor(dict(call.args)) if executor else {"error": "Unknown tool."}
            function_response_parts.append(
                types.Part(function_response=types.FunctionResponse(name=call.name, response=result))
            )

        contents.append(types.Content(role="user", parts=function_response_parts))
        response = client.models.generate_content(model=MODEL, contents=contents, config=config)

    final_text = response.text
    return {"reply": final_text}