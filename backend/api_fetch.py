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
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&hourly=temperature_2m&forecast_days=2&format=json&timeformat=unixtime"
    

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
    
        locations.append(
            {
                "location_id" : location_id, "name" : name, "latitude" : lat, "longitude" : lon 
            }
        )
    return locations    


def parse_forecast(data):
    if ("hourly" not in data) or ("temperature_2m" not in data["hourly"]):
        return None

    now = datetime.now(timezone.utc)

    values = []
    for time, temp in zip(
        data["hourly"]["time"],
        data["hourly"]["temperature_2m"]
    ):
        time = datetime.fromtimestamp(time, tz= timezone.utc)
        if time <= now:
            continue

        temp = round(temp, 1)

        values.append(
        {
            "time" : time,
            "temperature" : temp
        }
        )

    return values[:24]
