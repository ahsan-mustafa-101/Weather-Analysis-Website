import api_fetch
from database import fetch_locations, insert_forecasts, get_connection

from apscheduler.schedulers.background import BackgroundScheduler

def forecast_locations():
    conn = get_connection()
    if conn is None:
        print("Skipping this run — could not connect to database.")
        return

    locations = fetch_locations(conn)

    if locations is None:
        print("Could not fetch locations.")
        conn.close()
        return

    if not locations:
        print("No locations found. Skipping forecast update.")
        conn.close()
        return

    for location in locations:
        try:
            forecast_data = api_fetch.get_forecast_data(location['latitude'], location['longitude'])
            if forecast_data is None:
                print(f"Skipping - {location['name']} - forecast fetch failed")
                continue

            parsed_forecast_data = api_fetch.parse_forecast(forecast_data)
            if parsed_forecast_data is None:
                print(f"Skipping - {location['name']} - no forecast data to parse")
                continue

            insert_forecasts(conn, location['id'], parsed_forecast_data)
            print(f"Updated forecast for {location['name']}")
        except Exception as e:
            print(f"Error occured for location({location['name']}): {e}")
            continue
    conn.close()

def schedule_job():
    scheduler = BackgroundScheduler()
    scheduler.add_job(forecast_locations, 'interval', minutes = 10)

    scheduler.start()

    return scheduler

