import requests
import sys
import psycopg
from datetime import datetime, timezone


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
    locations = []

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
        time = datetime.fromtimestamp(time, tz= timezone.utc)
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



# ----------- database related functions related

def get_connection():
    try:
        conn = psycopg.connect("postgresql://postgres:meowmeow@localhost:5432/weather-analysis")
        return conn
    except psycopg.OperationalError as e:
        print(f"Could not connect to database: {e}")
        return None


def create_tables(conn):
    """Creates locations and forecasts tables if they don't exist."""
    create_locations = """
    CREATE TABLE IF NOT EXISTS locations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        latitude DECIMAL(9, 6) NOT NULL,
        longitude DECIMAL(9, 6) NOT NULL,
        UNIQUE (name, latitude, longitude)
    );
    """

    create_forecasts = """
    CREATE TABLE IF NOT EXISTS forecasts (
        id SERIAL PRIMARY KEY,
        location_id INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        timestamp TIMESTAMPTZ NOT NULL,
        temperature DECIMAL(5, 2),
        UNIQUE (location_id, timestamp)
    );
    """

    try:
        with conn.cursor() as cur:
            cur.execute(create_locations)
            cur.execute(create_forecasts)
        conn.commit()
    except psycopg.Error as e:
        conn.rollback()
        print(f"Error creating tables: {e}")


def insert_location(conn, name, lat, lon):
    query = """
    INSERT INTO locations (name, latitude, longitude)
    VALUES (%s, %s, %s)
    ON CONFLICT (name, latitude, longitude) DO UPDATE
        SET name = EXCLUDED.name
    RETURNING id;
    """
    try:
        with conn.cursor() as cur:
            cur.execute(query, (name, lat, lon))
            location_id = cur.fetchone()[0]
        conn.commit()
        return location_id
    except psycopg.Error as e:
        conn.rollback()
        print(f"Error inserting location: {e}")
        return None


def insert_forecasts(conn, location_id, forecast_records):
    query = """
    INSERT INTO forecasts (location_id, timestamp, temperature)
    VALUES (%s, %s, %s)
    ON CONFLICT (location_id, timestamp) DO UPDATE
        SET temperature = EXCLUDED.temperature;
    """

    try:
        with conn.cursor() as cur:
            for record in forecast_records:
                cur.execute(query, (location_id, record["time"], record["temperature"]))
        conn.commit()
    except psycopg.Error as e:
        conn.rollback()
        print(f"Error inserting forecasts: {e}")

def main():
    conn = get_connection()
    if conn is None:
        conn.close()
        sys.exit()

    create_tables(conn)

    searched_city = get_city()

    geo_data = get_geo_data(searched_city)
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

    locations = []
    for index in range(len(geo_data["results"])):
        location_id, name, lat , lon = parse_geo(geo_data, index)

        locations.append(
            {
                "location_id" : location_id, "name" : name, "latitude" : lat, "longitude" : lon 
            }
        )
        print(f"{index + 1}: | {location_id} | {name} | {lat} | {lon}")
        print("-" * 50)


    while True:
        required_city = get_input_number()
        if (required_city <= 0) or (required_city > len(locations)):
            print("Enter a valid number to search!!!")
            continue
        break

    chosen = locations[required_city - 1]
    name, latitude, longitude = chosen["name"] ,chosen["latitude"], chosen["longitude"]

    forecast_data = get_forecast_data(latitude, longitude)

    if forecast_data is None:
        conn.close()
        sys.exit()
    
    values = parse_forecast(forecast_data)

    if values is None:
        print("Forecast data is unavailable.")
        conn.close()
        sys.exit()

    print("-" * 25 + " Forecast " + "-" * 25)
    for record in values:
        print(f"{record["time"]} : {record["temperature"]}\n")
    print("-" * 50)


    # saving into database

    db_location_id = insert_location(conn, name, lat, lon)
    if db_location_id is None:
        print("Could not save location to database.")
        conn.close()
        sys.exit()

    insert_forecasts(conn, db_location_id, values)
    print(f"Saved {len(values)} forecast records for {name} to the database.")

    conn.close()

if __name__ == "__main__":
    main()