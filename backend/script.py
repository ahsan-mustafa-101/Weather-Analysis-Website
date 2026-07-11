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
        return None



def get_forecast_data(lat, lon):
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&hourly=temperature_2m&forecast_days=1&format=json&timeformat=unixtime"
    

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()

        data_forecast = response.json()
        return data_forecast

    except requests.exceptions.RequestException as e:
            print(f"Request not proceeded, issue: {e}")
            return None




def parse_geo(geo_data, index):
    loaction_id = geo_data["results"][index]["id"]
    name = geo_data["results"][index]["name"]
    lat = geo_data["results"][index]["latitude"]
    lon = geo_data["results"][index]["longitude"]
    
    return loaction_id, name, lat, lon


def parse_forecast(data):
    if ("hourly" not in data) or ("temperature_2m" not in data["hourly"]):
        return None

    values = []
    for time, temp in zip(
        data["hourly"]["time"],
        data["hourly"]["temperature_2m"]
    ):
        values.append(
        {
            "time" : time,
            "temperature" : temp
        }
        )
    return values


def get_city() -> str:
    while True:
        inp = input("Enter the city to search weather forecast: ").strip()

        if inp == "":
            print("Please enter a city name.")
            continue

        if any(char.isalpha() for char in inp):
            return inp

        print("Please enter a valid city name.")
            


def get_input_number() -> int:
    while True:
        inp = input("Enter the number of city to get forecast: ").strip()

        if inp == "":
            print("Input cannot be empty!")
            continue

        try:
            return int(inp)
        except ValueError:
            print("Please enter a valid integer!")


def main():
    searched_city = get_city()

    geo_data = get_geo_data(searched_city)
    if geo_data is None:
        sys.exit()

    if "results" not in geo_data:
        print("No result found for searched city!")
        sys.exit()

    if len(geo_data["results"]) == 0:
        print("No city found!")
        sys.exit()

    info = []
    for index in range(len(geo_data["results"])):
        location_id, name, lat , lon = parse_geo(geo_data, index)

        info.append(
            {
                "location_id" : location_id, "name" : name, "latitude" : lat, "longitude" : lon 
            }
        )
        print(f"{index + 1}: | {location_id} | {name} | {lat} | {lon}")
        print("-" * 50)


    while True:
        required_city = get_input_number()
        if (required_city <= 0) or (required_city > len(info)):
            print("Enter a valid number to search!!!")
            continue
        break

    latitude, longitude = info[required_city - 1]["latitude"], info[required_city - 1]["longitude"]

    forecast_data = get_forecast_data(latitude, longitude)

    if forecast_data is None:
        sys.exit()
    
    values = parse_forecast(forecast_data)

    if values is None:
        print("Forecast data is unavailable.")
        sys.exit()

    print("-" * 25 + " Forecast " + "-" * 25)
    for record in values:
        print(f"{record["time"]} : {record["temperature"]}\n")
    print("-" * 50)

if __name__ == "__main__":
    main()

