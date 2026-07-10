import requests
import sys


BASE_URL = "https://geocoding-api.open-meteo.com/v1/"

def get_geo_data(searched_city):
    url = f"{BASE_URL}search?name={searched_city}&count=10&language=en&format=json"    

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()

        geo_data = response.json()
        return geo_data

    except requests.exceptions.RequestException as e:
        print(f"Request not proceeded, issue: {e}")
        sys.exit()



def get_forecast_data(lat, lon):
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&hourly=temperature_2m&format=json&timeformat=unixtime"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36'
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        data_forecast = response.json()
        return data_forecast

    except requests.exceptions.RequestException as e:
            print(f"Request not proceeded, issue: {e}")
            sys.exit()




def parse_geo(geo_data, index):
    loaction_id = geo_data["results"][index]["id"]
    name = geo_data["results"][index]["name"]
    lat = geo_data["results"][index]["latitude"]
    lon = geo_data["results"][index]["longitude"]
    
    return loaction_id, name, lat, lon


def parse_forecast(data):
    if ("hourly" not in data) or ("temperature_2m" not in data["hourly"]):
        return None
    return list(data["hourly"]["temperature_2m"])


def main():
    searched_city = input("Enter the city to search weather forecast: ").strip()

    while searched_city == "":
        print("Please enter a city name.")
        searched_city = input("Enter the city to search weather forecast: ").strip()


    geo_data = get_geo_data(searched_city)

    if "results" not in geo_data:
        print("No result found for searched city!")
        sys.exit()

    if len(geo_data["results"]) == 0:
                print("No city found!")
                sys.exit()

    for index in range(len(geo_data["results"])):
        location_id, name, lat , lon = parse_geo(geo_data, index)

        print(f"{location_id} | {name} | {lat} | {lon}")
        print("-" * 50)

        forecast_data = get_forecast_data(lat, lon)
        temperatures = parse_forecast(forecast_data)

        if temperatures is None:
            print("Forecast data is unavailable.")
            continue

        print(temperatures)


if __name__ == "__main__":
    main()

