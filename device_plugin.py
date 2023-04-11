import datetime
import requests


def setup(plugins):
    @plugins.register("powerfox:poweropti")
    def handler(settings):
        device_name = settings["device_name"]
        request_url = "https://backend.powerfox.energy/api/2.0/my/" + settings["ip"] + "/current" # IP ist die device-ID (standart ist "main")
        try: 
            data = requests.get(request_url, auth="username:password", timeout=30).json() # KA wie die auth genau geht, auf jeden fall mit username + passwort (nicht tokens) aber glaube es muss base64 sein...
            return {
                "measurement": "census",
                "tags": {"device": device_name},
                "time": data["Timestamp"],
                "fields": {
                    "power": data["Watt"],
                    "energy_wh": data["Watt"] * settings["update_time"] / 3600,
                    "is_valid": data["Outdated"],
                    "fetch_success": True,
                    "current_value_usage": data["A_Plus"],
                    "current_value_feed": data["A_Minus"]
                }
            }
        except requests.RequestException:
            return {
                "measurement": "census",
                "tags": {"device": device_name},
                "time": datetime.datetime.utcnow(),
                "fields": {
                    "fetch_success": False
                }
            }