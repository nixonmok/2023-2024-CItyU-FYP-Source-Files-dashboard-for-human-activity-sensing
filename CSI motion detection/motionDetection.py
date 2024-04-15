
import json
from subprocess import PIPE, run
import joblib
import numpy as np
from scipy.signal import butter, filtfilt
import paho.mqtt.client as mqtt
import time

model = joblib.load('rbm_logistic_pipeline.joblib')
scaler = joblib.load('scaler.joblib')

time_processed = 0

# https://www.math-only-math.com/amplitude-or-argument-of-a-complex-number.html
def calculate_amplitude_phase(pair):
    real_part = pair[0]
    imaginary_part = pair[1]
    amplitude = np.sqrt(real_part ** 2 + imaginary_part ** 2)
    return amplitude

def butter_lowpass_filter(data, cutoff, fs, order):
    nyq = 0.5 * fs  # Nyquist Frequency
    normal_cutoff = cutoff / nyq
    # Get the filter coefficients
    b, a = butter(order, normal_cutoff, btype='low', analog=False)
    y = filtfilt(b, a, data)
    return y

def on_connect(client, userdata, flags, rc):
    print("Connected with result code " + str(rc))
    client.subscribe(MQTT_TOPIC)

def on_message(client, userdata, message):
    global time_processed
    current_time = time.time()
    if current_time - time_processed < 1: # Process only one message per second
        return
    time_processed = current_time
    payload = message.payload.decode("utf-8")
    print("Received message '" + payload + "' on topic '" + message.topic + "'")
    print("type(payload): ", type(payload))
    # Convert the string to a list of numbers
    payload = payload[1:-1]
    payload = payload.split(',')
    payload = list(map(float, payload))
    payload = np.array(payload)
    pairs = [payload[i:i+2] for i in range(0, len(payload), 2)][:num_subcarriers]
    amplitudes = [calculate_amplitude_phase(pair) for pair in pairs]
    filtered_amplitude = butter_lowpass_filter(amplitudes,cutoff,fs,order)
    prediction_proba = model.predict_proba(scaler.transform([filtered_amplitude]))
    prediction = model.predict(scaler.transform([filtered_amplitude]))
    print(model.classes_)
    print(prediction_proba)
    print( "result before checking probability: "+prediction)
    
    if(max(prediction_proba[0]) > 0.8):
        print("someone is ", prediction[0])
        mqtt_client.publish("MotionDetection/Result", prediction[0])
    else:
        prediction[0] = "/"
        mqtt_client.publish("MotionDetection/Result", prediction[0])
    
    prediction_data = {
        'classes': model.classes_.tolist(),  # Convert numpy array to list for JSON serialization
        'prediction_proba': prediction_proba.tolist(),  # Convert numpy array to list
        'prediction': prediction.tolist()  # Convert numpy array to list
    }
    mqtt_client.publish("MotionDetection/predictions", json.dumps(prediction_data))
    

num_subcarriers = 52
fs = 100       # Sample rate in Hz, you need to determine this from your timestamps
cutoff = 20     # Desired cutoff frequency of the filter in Hz
order = 8         # Filter order

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

