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
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&hourly=temperature_2m,weather_code,is_day,precipitation_probability,apparent_temperature&timezone=auto&forecast_days=3&timeformat=unixtime&format=json"

    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()

        data_forecast = response.json()
        return data_forecast

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
    ]

    missing_fields = [
        field for field in required_fields
        if field not in data["hourly"]
    ]

    if missing_fields:
        raise ValueError(
            f"Missing required hourly fields: {', '.join(missing_fields)}"
        )

    now = datetime.now(timezone.utc)

    values = []
    for time, temp, app_temp, weather_code, is_day, pp in zip(
        data["hourly"]["time"],
        data["hourly"]["temperature_2m"],
        data["hourly"]["apparent_temperature"],
        data["hourly"]["weather_code"],
        data["hourly"]["is_day"],
        data["hourly"]["precipitation_probability"]
    ):
    
        time = datetime.fromtimestamp(time, tz= timezone.utc)
        if time <= now:
            continue


        values.append(
        {
            "time" : time,
            "temperature" : temp,
            "apparent_temperature" : app_temp,
            "weather_code" : weather_code,
            "is_day" : bool(is_day),
            "precipitation_probability" : pp
        }
        )

        

    return values[:24]
