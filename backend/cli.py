import sys
import database
import api_fetch






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
    # connecting python to postgres database
    conn = database.get_connection()
    if conn is None:
        sys.exit()

    # creating tables if not exists
    database.create_tables(conn)

    # getting the searched city from user
    searched_city = get_city()

    # requesting api to get data
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

    # parsing data to get required data 
    locations = api_fetch.parse_geo(geo_data)

    count = 0
    for location in locations:
        print(f"{count + 1}: | {location["location_id"]} | {location["name"]} | {location["latitude"]} | {location["longitude"]}")
        print("-" * 50)
        count += 1

    # asking user for required city
    while True:
        required_city = get_input_number()
        if (required_city <= 0) or (required_city > len(locations)):
            print("Enter a valid number to search!!!")
            continue
        break

    # selected city data
    chosen = locations[required_city - 1]
    name, latitude, longitude = chosen["name"] ,chosen["latitude"], chosen["longitude"]

    # requesting forecast api to get forecast data
    forecast_data = api_fetch.get_forecast_data(latitude, longitude)

    if forecast_data is None:
        conn.close()
        sys.exit()

    # parsing the forecast data
    values = api_fetch.parse_forecast(forecast_data)

    if values is None:
        print("Forecast data is unavailable.")
        conn.close()
        sys.exit()

    print("-" * 25 + " Forecast " + "-" * 25)
    for record in values:
        print(f"{record["time"]} : {record["temperature"]} : {record["apparent_temperature"]} : {record["weather_code"]} : {record["precipitation_probability"]} : {record["is_day"]}\n")
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