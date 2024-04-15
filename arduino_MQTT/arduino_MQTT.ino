#include <PubSubClient.h>
#include <WiFi.h>
#include <Arduino.h>

#define LED_PIN 17
#define BUTTON_PIN 22

WiFiClient wifiClient;
PubSubClient client(wifiClient);
const char ssid[] = "ssid";
const char password[] = "password";
int prevValue = 999; 

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.println("received some message");

  char message[length + 1];
  for (unsigned int i = 0; i < length; ++i) {
    message[i] = (char)payload[i];
  }
  message[length] = '\0';
  Serial.println("Received message: " + String(message));

  if (strcmp(topic, "all_device/control_device_subscribe/LED1") == 0) {
    if (String(message) == "1") {
      digitalWrite(LED_PIN, HIGH);
      delay(5000);
      digitalWrite(LED_PIN, LOW);
    } else if (String(message) == "ping") {
      client.publish("all_device/control_device_publish/LED1", "Response", true);
    }
  }
}

void setup() {
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT);

  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }

  client.setServer("192.168.1.133", 1883);
  client.setCallback(callback);

  while (!client.connected()) {
    if (client.connect("ESP32")) {
      Serial.println("Connected to MQTT broker");
      client.subscribe("all_device/control_device_subscribe/LED1");
      client.publish("all_device/control_device_publish/LED1", "online", true);
    } else {
      Serial.println("Failed to connect to MQTT broker, retrying...");
      delay(2000);
    }
  }
}

void loop() {
  if (!client.connected()) {
    if (client.connect("ESP32")) {
      Serial.println("Reconnected to MQTT broker");
      client.subscribe("all_device/control_device_subscribe/LED1");
    }
  }
  client.loop();

  int buttonValue = digitalRead(BUTTON_PIN);
  if (buttonValue != prevValue || buttonValue == HIGH) {
    char stringValue[10];
    sprintf(stringValue, "%d", buttonValue);
    client.publish("all_device/sensor_data/shock_sensor1", stringValue, true);
    Serial.println("button value changed, publish the status");
  }
  prevValue = buttonValue;

  delay(2000);
}
