from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from datetime import datetime, timezone
from scheduler import schedule_job
from database import get_connection, fetch_locations, insert_location, insert_forecasts, create_tables, get_location_by_id
import api_fetch



@asynccontextmanager
async def lifespan(app: FastAPI):
    conn = get_connection()
    if conn:
        try:
            create_tables(conn)
        finally:
            conn.close()
    scheduler_instance = schedule_job()

    yield

    scheduler_instance.shutdown()



app = FastAPI(lifespan= lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://weatherdrop.vercel.app"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
    allow_credentials=False,
)


@app.get("/locations")
def get_locations():
    conn = get_connection()
    if conn is None:
        raise HTTPException(status_code=503, detail="Could not connect to database.")

    try:
        return fetch_locations(conn)

    except HTTPException:
        raise

    except Exception as e:
        print(f"Unexpected Error: {e}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred."
        )

    finally:
        conn.close()


@app.get("/locations/search")
def get_searched_locations(city: str = Query(alias="location")):
    try:
        data = api_fetch.get_geo_data(city)

        if data is None:
            raise HTTPException(
                status_code=502,
                detail="Failed to reach geocoding service."
            )

        if "results" not in data or len(data["results"]) == 0:
            raise HTTPException(
                status_code=404,
                detail="No matching locations found."
            )

        locations = api_fetch.parse_geo(data)
        return locations

    except HTTPException:
        raise

    except Exception as e:
        print(f"API Error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve location data."
        )


@app.post("/locations/save")
def save_location(
    name: str = Query(...),
    latitude: float = Query(...),
    longitude: float = Query(...),
    country: str = Query(None),
    admin1 : str = Query(None),
):
    conn = get_connection()
    if conn is None:
        raise HTTPException(status_code=503, detail="Could not connect to database.")

    try:
        location_id = insert_location(conn, name, latitude, longitude, country, admin1)
        if location_id is None:
            raise HTTPException(
                status_code=500,
                detail="Failed to save location."
            )

        forecast_data = api_fetch.get_forecast_data(latitude, longitude)
        if forecast_data is None:
            raise HTTPException(
                status_code=502,
                detail="Location saved, but failed to fetch forecast."
            )

        parsed_forecast = api_fetch.parse_forecast(forecast_data)
        if parsed_forecast is None:
            raise HTTPException(
                status_code=502,
                detail="Location saved, but forecast data was unavailable."
            )

        insert_forecasts(conn, location_id, parsed_forecast)

        return {"location_id": location_id, "name": name, "saved": True}

    except HTTPException:
        raise

    except Exception as e:
        print(f"Unexpected Error: {e}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred."
        )

    finally:
        conn.close()


@app.get("/forecasts/{location_id}")
def get_forecasts(location_id: int):
    return get_forecast_from_database(location_id)


def get_forecast_from_database(location_id):
    conn = get_connection()
    if conn is None:
        raise HTTPException(status_code=503, detail="Could not connect to database.")

    try:
        def fetch_rows():
            with conn.cursor() as cur:
                query = """
                        SELECT timestamp, temperature, feels_like, weather_code, precipitation_probability, is_day
                        FROM forecasts WHERE location_id = %s ORDER BY timestamp ASC;
                """
                cur.execute(query, (location_id,))
                column_names = [desc[0] for desc in cur.description]
                rows = cur.fetchall()
                return [dict(zip(column_names, row)) for row in rows]

        forecasts = fetch_rows()

        is_stale = (
            not forecasts
            or forecasts[0]["timestamp"] < datetime.now(timezone.utc)
        )

        if is_stale:
            location = get_location_by_id(conn, location_id)
            if location is None:
                raise HTTPException(status_code=404, detail="Location not found.")

            forecast_data = api_fetch.get_forecast_data(location["latitude"], location["longitude"])
            if forecast_data is None:
                raise HTTPException(status_code=502, detail="Failed to refresh forecast data.")

            parsed_forecast = api_fetch.parse_forecast(forecast_data)
            if parsed_forecast is None:
                raise HTTPException(status_code=502, detail="Forecast data was unavailable.")

            insert_forecasts(conn, location_id, parsed_forecast)
            forecasts = fetch_rows()

        if not forecasts:
            raise HTTPException(status_code=404, detail="No forecasts found for this location.")

        return forecasts

    except HTTPException:
        raise

    except Exception as e:
        print(f"Unexpected Error: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")

    finally:
        conn.close()


