import sys
import database
import api_fetch

BASE_URL = "https://geocoding-api.open-meteo.com/v1/"


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
    conn = database.get_connection()
    if conn is None:
        conn.close()
        sys.exit()

    database.create_tables(conn)

    searched_city = get_city()

    geo_data = api_fetch.get_geo_data(searched_city)
    if geo_data is None:
        conn.close()
        sys.exit()

    if "results" not in geo_data:
        print("No result found for searched city!")
        conn.close()
        sys.exit()

    if len(geo_data["results"]) == 0:
        print("No city found!")
        conn.close()
        sys.exit()

    locations = api_fetch.parse_geo(geo_data)

    count = 0
    for location in locations:
        print(f"{count + 1}: | {location["location_id"]} | {location["name"]} | {location["latitude"]} | {location["longitude"]}")
        print("-" * 50)
        count += 1


    while True:
        required_city = get_input_number()
        if (required_city <= 0) or (required_city > len(locations)):
            print("Enter a valid number to search!!!")
            continue
        break

    chosen = locations[required_city - 1]
    name, latitude, longitude = chosen["name"] ,chosen["latitude"], chosen["longitude"]

    forecast_data = api_fetch.get_forecast_data(latitude, longitude)

    if forecast_data is None:
        conn.close()
        sys.exit()
    
    values = api_fetch.parse_forecast(forecast_data)

    if values is None:
        print("Forecast data is unavailable.")
        conn.close()
        sys.exit()

    print("-" * 25 + " Forecast " + "-" * 25)
    for record in values:
        print(f"{record["time"]} : {record["temperature"]}\n")
    print("-" * 50)


    # saving into database
    db_location_id = database.insert_location(conn, name, latitude, longitude)
    if db_location_id is None:
        print("Could not save location to database.")
        conn.close()
        sys.exit()

    database.insert_forecasts(conn, db_location_id, values)
    print(f"Saved {len(values)} forecast records for {name} to the database.")

    conn.close()

if __name__ == "__main__":
    main()