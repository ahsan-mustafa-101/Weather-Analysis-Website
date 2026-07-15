import requests
import math
from datetime import datetime, timezone
from main import BASE_URL

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
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&hourly=temperature_2m&forecast_days=1&format=json&timeformat=unixtime"
    

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

    values = []
    for time, temp in zip(
        data["hourly"]["time"],
        data["hourly"]["temperature_2m"]
    ):
        time = datetime.fromtimestamp(time, tz= timezone.utc)
        temp = math.ceil(temp)
        values.append(
        {
            "time" : time,
            "temperature" : temp
        }
        )
    return values
