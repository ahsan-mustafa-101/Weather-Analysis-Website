from fastapi import FastAPI, Query, HTTPException
import psycopg
from database import get_connection
from scheduler import fetch_locations
import api_fetch

app = FastAPI()

@app.get("/locations")
def get_locations():
    conn = get_connection()
    try:
        return fetch_locations(conn)

    except HTTPException:
        raise
    
    except Exception as e:
        print(f"Unexpected Error: {e}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred."
        )
    
    finally:
        conn.close()


@app.get("/locations/search")
def get_searched_locations(city : str = Query(alias = "location")):
    try:
        data = api_fetch.get_geo_data(city)
        locations = api_fetch.parse_geo(data)

        if not locations:
            raise HTTPException(
                status_code=404,
                detail="no matching locations found!"
            )
        return locations

    except HTTPException:
        raise
    
    except Exception as e:
        print(f"API Error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve location data."
        )

@app.get("/forecasts/{location_id}")
def get_forecasts(location_id: int):
    return get_forecast_from_database(location_id)



def get_forecast_from_database(location_id):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            query = """
                    SELECT timestamp, temperature FROM forecasts WHERE location_id = %s;
            """

            cur.execute(query, (location_id,))
            column_names = [desc[0] for desc in cur.description]

            forecasts = cur.fetchall();

            if not forecasts:
                raise HTTPException(
                    status_code=404,
                    detail="No forecasts found for this location."
                )

            # converting tuple into dict
            result = [
                dict(zip(column_names, forecast))
                for forecast in forecasts
            ]
            return result

    except HTTPException:
        raise
    
    except Exception as e:
        print(f"Unexpected Error: {e}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred."
        )
    
    finally:
        conn.close()

