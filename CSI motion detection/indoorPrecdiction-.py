from subprocess import PIPE, run
import numpy as np
import paho.mqtt.client as mqtt
import time
import json

def on_connect(client, userdata, flags, rc):
    print("Connected with result code " + str(rc))
    client.subscribe(MQTT_TOPIC)

def on_message(client, userdata, message):
    indoorPrediction = run("whereami predict --model_path whereamiModel", shell=True, stdout=PIPE) #reference: https://github.com/DeastinY/wherearehue
    locations = run("whereami locations --model_path whereamiModel", shell=True, stdout=PIPE)
    print("Indoor locations: ", locations.stdout.decode("utf-8"))
    rooms = []
    for room in locations.stdout.decode("utf-8").split("\n"):
        if(room != ""):
            rooms.append(room.split(":")[0])
            print("Rooms: ", rooms)
    mqtt_client.publish("IndoorPrediction/prediction", indoorPrediction.stdout.decode("utf-8").strip())
    mqtt_client.publish("IndoorPrediction/locations", json.dumps(rooms))


MQTT_TOPIC = "MotionDetection/CSI"
MQTT_SERVER = "localhost"
MQTT_PORT = 1883
MQTT_ALIVE = 30

mqtt_client = mqtt.Client()
mqtt_client.on_message = on_message
mqtt_client.on_connect = on_connect
mqtt_client.connect(MQTT_SERVER, MQTT_PORT, MQTT_ALIVE)
mqtt_client.loop_start()
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    mqtt_client.loop_stop()
    mqtt_client.disconnect()
    print("Disconnected from MQTT Broker")