from datetime import datetime, timezone


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
        time = datetime.fromtimestamp(time, tz= timezone.utc)
        values.append(
        {
            "time" : time,
            "temperature" : temp
        }
        )
    return values
