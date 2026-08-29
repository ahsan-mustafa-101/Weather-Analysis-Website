import requests
from datetime import datetime, timezone


BASE_URL = "https://geocoding-api.open-meteo.com/v1/"

def get_geo_data(searched_city):
    url = f"{BASE_URL}search?name={searched_city}&count=10&language=en&format=json"    
    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()

        geo_data = response.json()
        return geo_data

    except requests.exceptions.RequestException as e:
        print(f"Request not proceeded, issue: {e}")
        return None


def get_forecast_data(lat, lon):
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&hourly=temperature_2m,weather_code,is_day,precipitation_probability,apparent_temperature,wind_speed_10m,pressure_msl,visibility,dew_point_2m,uv_index,relative_humidity_2m,wind_direction_10m&timezone=auto&past_days=3&forecast_days=3&timeformat=unixtime&format=json"

    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()

        data_forecast = response.json()
        return data_forecast

    except requests.exceptions.RequestException as e:
            print(f"Request not proceeded, issue: {e}")
            return None


def get_geo_reverse_data(lat, lon):
    url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json&zoom=10&addressdetails=1&accept-language=en"
    headers = {"User-Agent": "WeatherDrop/1.0 (personal weather project)"}

    try:
        response = requests.get(url, headers= headers, timeout=15)
        response.raise_for_status()

        return response.json()

    except requests.exceptions.RequestException as e:
        print(f"Request not proceeded, issue: {e}")
        return None


def parse_geo(geo_data):
    locations = []
    for index in range(len(geo_data["results"])):
        location_id = geo_data["results"][index]["id"]
        name = geo_data["results"][index]["name"]
        lat = geo_data["results"][index]["latitude"]
        lon = geo_data["results"][index]["longitude"]
        country = geo_data["results"][index].get("country")
        admin1 = geo_data["results"][index].get("admin1")
        locations.append(
            {
                "location_id" : location_id, "name" : name, "latitude" : lat, "longitude" : lon, "country" : country, "admin1" : admin1,
            }
        )
    return locations    


def parse_forecast(data):
    if "hourly" not in data:
        return None

    required_fields = [
        "time",
        "temperature_2m",
        "apparent_temperature",
        "weather_code",
        "is_day",
        "precipitation_probability",
        "wind_speed_10m",
        "pressure_msl",
        "visibility",
        "uv_index",
        "dew_point_2m",
        "relative_humidity_2m",
        "wind_direction_10m"
    ]

    missing_fields = [
        field for field in required_fields
        if field not in data["hourly"]
    ]

    if missing_fields:
        raise ValueError(
            f"Missing required hourly fields: {', '.join(missing_fields)}"
        )


    values = []
    for time, temp, app_temp, weather_code, is_day, pp, wind, pressure, visibility, uv_index, dew_point, humidity, wind_direction  in zip(
        data["hourly"]["time"],
        data["hourly"]["temperature_2m"],
        data["hourly"]["apparent_temperature"],
        data["hourly"]["weather_code"],
        data["hourly"]["is_day"],
        data["hourly"]["precipitation_probability"],
        data["hourly"]["wind_speed_10m"],
        data["hourly"]["pressure_msl"],
        data["hourly"]["visibility"],
        data["hourly"]["uv_index"],
        data["hourly"]["dew_point_2m"],
        data["hourly"]["relative_humidity_2m"],
        data["hourly"]["wind_direction_10m"]
    ):
    
        time = datetime.fromtimestamp(time, tz=timezone.utc)
        values.append(
        {
            "time" : time,
            "temperature" : temp,
            "apparent_temperature" : app_temp,
            "weather_code" : weather_code,
            "is_day" : bool(is_day),
            "precipitation_probability" : pp,
            "wind" : wind,
            "pressure" : pressure,
            "visibility" : visibility,
            "uv_index" : uv_index,
            "dew_point" : dew_point,
            "humidity" : humidity,
            "wind_direction" : wind_direction
        }
        )
    return values

def parse_reverse_geo_data(data):
    address = data.get("address", {})

    name = data.get("name")

    if not name:
        display_name = data.get("display_name")
        name = display_name.split(",")[0].strip() if display_name else None

    admin1 = address.get("state")
    country = address.get("country")

    return {
        "name": name,
        "admin1": admin1,
        "country": country,
    }

def get_utc_offset(data):
    return data.get("utc_offset_seconds", 0)