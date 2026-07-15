import psycopg


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
            cur.execute(
            "DELETE FROM forecasts WHERE location_id = %s",
            (location_id,)
            )

            for record in forecast_records:
                cur.execute(query, (location_id, record["time"], record["temperature"]))
        conn.commit()
    except psycopg.Error as e:
        conn.rollback()
        print(f"Error inserting forecasts: {e}")