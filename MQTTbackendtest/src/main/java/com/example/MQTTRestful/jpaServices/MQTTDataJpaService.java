package com.example.MQTTRestful.jpaServices;

import com.example.MQTTRestful.MQTTServices.MQTTRestService;
import com.example.MQTTRestful.model.PayloadModel;
import com.example.MQTTRestful.model.SensorModel;
import com.example.MQTTRestful.repository.PayloadRepository;
import com.example.MQTTRestful.repository.SensorRepository;
import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.TimeZone;

@Service
public class MQTTDataJpaService {
    private static final Logger LOGGER = LoggerFactory.getLogger(MQTTDataJpaService.class);
    @Autowired
    private PayloadRepository payloadRepository;

    @Autowired
    private SensorRepository sensorRepository;

    private final Gson gson;

    public MQTTDataJpaService() {
        gson = new Gson();
    }

    public void sensorDataToDb(String topic, MqttMessage mqttMessage){
        //search if the sensor exist in db

        String jsonString = new String(mqttMessage.getPayload(), StandardCharsets.UTF_8);
        SensorModel sensor;
        JsonObject jsonObject;
        LocalDateTime timestamp;
        String payload;

        System.out.println(jsonString);
        if(isJsonFormat(jsonString)){
            LOGGER.info(jsonString + " is JSON string");
            //result is a JSON, e.g: {"payload":"testmsg","timestamp":1706865442}
            jsonObject = gson.fromJson(jsonString, JsonObject.class);
            timestamp = LocalDateTime.now();
            JsonElement payloadJsonElement = jsonObject.get("payload");
            if(payloadJsonElement.isJsonPrimitive()){
                payload = payloadJsonElement.getAsString();
            }
            else{
                payload = payloadJsonElement.toString();
            }
        }
        else{
            LOGGER.info(jsonString + " is not a JSON string");

            payload = jsonString; //result is not a JSON, e.g: 2
            timestamp = LocalDateTime.now();
        }

        if (!sensorRepository.existsByName(topic)){
            sensor = getAndAddNewSensor(topic, jsonString, timestamp);
            //add sensor to db
        }
        else{
            sensor = sensorRepository.findFirstByName(topic);
            //just get the sensor info
        }

        PayloadModel newPayload = new PayloadModel(sensor, timestamp, topic, payload, 2);
        payloadRepository.save(newPayload); //think need to change to 'INSERT IGNORE INTO payload'
    }

    private SensorModel getAndAddNewSensor(String topic, String jsonString, LocalDateTime timestamp) {
        SensorModel sensor;
        LOGGER.info(jsonString);
        SensorModel newSensor = new SensorModel(topic, 0, timestamp);
        sensorRepository.save(newSensor);
        sensor = newSensor;
        return sensor;
    }

    public static boolean isJsonFormat(String s){
        try{
            new JSONObject(s);
            return true;
        }
        catch (Exception e){
            return false;
        }
    }
}
