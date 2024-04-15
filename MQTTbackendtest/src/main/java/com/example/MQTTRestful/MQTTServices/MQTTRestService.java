package com.example.MQTTRestful.MQTTServices;

import com.example.MQTTRestful.WebSocketService.WebSocketService;
import com.example.MQTTRestful.model.PayloadModel;
import com.example.MQTTRestful.model.SensorInfoDTO;
import com.example.MQTTRestful.repository.PayloadRepository;
import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import jakarta.annotation.Resource;
import org.eclipse.paho.client.mqttv3.*;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

@Service
public class MQTTRestService extends MQTTConnection implements MqttCallback {
    private CountDownLatch latch;

    private static final Logger LOGGER = LoggerFactory.getLogger(MQTTRestService.class);

    private Boolean isListingSensor;

    @Resource
    private PayloadRepository payloadRepository;

    @Resource
    private Gson gson;

    @Autowired
    private WebSocketService webSocketService;

    private final ArrayList<SensorInfoDTO> sensorList;

    public MQTTRestService() {
        isListingSensor = false;
        sensorList =new ArrayList<SensorInfoDTO>();
        LOGGER.info("REST Service is on.");
        latch = new CountDownLatch(1);
    }

    public Boolean restConnect(){
        setOptions(getConnectFactory().restOption());
        setClientId(getConfig().getRestClient().getClientId());
        MqttClient client = connect();
        client.setCallback(this);
        LOGGER.info("restConnect()");
        return true;
    }

    public void addNewSensorToList(SensorInfoDTO sensor){
        if(!sensorList.contains(sensor)){
            this.sensorList.add(sensor);
        }
    }

    public void clearSensorList(){
        this.sensorList.clear();
    }

    //should be ArrayList<Object>
    public ArrayList<SensorInfoDTO> listAllSensor() throws InterruptedException {
        this.restConnect();
        isListingSensor = true;
        String wildcardTopic = "all_device/sensor_data/#"; // test --> "$SYS/#"
        //all topic in this project will not have any subtopic
        //usually will use JSON to cover everything
        subscribeTopic(wildcardTopic, 2);
        try {
            LOGGER.info("Waiting for messages, in listAllSensor...");
            latch.await(1, TimeUnit.SECONDS); // Wait for messages for up to 1 seconds
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt(); // Restore the interrupted status
            LOGGER.error("Interrupted while waiting for messages", e);
        }

        LOGGER.info("all sensor: " + this.sensorList);

        ArrayList<SensorInfoDTO> allSensor = (ArrayList<SensorInfoDTO>) this.sensorList.clone();
        unSubscribeTopic(wildcardTopic);
        System.out.println("all sensor: " + allSensor);
        return allSensor;
    }

    //should be ArrayList<Object>
    public ArrayList<SensorInfoDTO> listAllControlDevice() throws InterruptedException {
        this.restConnect();
        isListingSensor = true;
        String wildcardTopic = "all_device/control_device_publish/#"; // test --> "$SYS/#"
        //all topic in this project will not have any subtopic
        //usually will use JSON to cover everything
        subscribeTopic(wildcardTopic, 2);
        try {
            latch.await(1, TimeUnit.SECONDS); // Wait for messages for up to 10 seconds
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt(); // Restore the interrupted status
            LOGGER.error("Interrupted while waiting for messages", e);
        }

        ArrayList<SensorInfoDTO> allSensor = (ArrayList<SensorInfoDTO>) this.sensorList.clone();
        unSubscribeTopic(wildcardTopic);
        System.out.println("all sensor: " + allSensor);
        return allSensor;
    }

    public void subscribe(String topic, int qos) {

        try {
            getMqttClient().subscribe(topic, qos);
        } catch (MqttException e) {
            LOGGER.info(e.getMessage(), e);
            LOGGER.info("fail to subscribe");
        }
    }

    public void unSubscribe(String topic) {

        try {
            getMqttClient().unsubscribe(topic);
        } catch (MqttException e) {
            LOGGER.info(e.getMessage(), e);
        }
    }

    public void subscribeTopic(String topic, int qos) {
        super.connect();
        subscribe(topic, qos);
    }

    public void unSubscribeTopic(String topic) {
        System.out.println("now unsubscribeTopic");
        super.connect();
        unSubscribe(topic);
        this.clearSensorList();
        isListingSensor = false;
    }

    @Override
    public void connectionLost(Throwable throwable) {
        LOGGER.info("connection lost, trying to reconnect... cause: " + throwable.getMessage());
        super.connect(); //need to change -> should rely on context

        while (true){
            try {
                LOGGER.info("looping...");
                Thread.sleep(1000);
                break;
            }catch (Exception e){
                LOGGER.info(e.toString());
                continue;
            }
        }
    }

    private boolean isJsonFormat(String s){
        try{
            new JSONObject(s);
            return true;
        }
        catch (Exception e){
            return false;
        }
    }

    private String payloadProcessing(String payload){
        if(this.isJsonFormat(payload)){
            LOGGER.info(payload + " is JSON string");
            //result is a JSON, e.g: {"payload":"testmsg","timestamp":1706865442}
            JsonObject jsonObject = gson.fromJson(payload, JsonObject.class);
            LOGGER.info("jsonObject: " + jsonObject);
            String result;

            JsonElement resultJsonElement = jsonObject.get("payload");
            LOGGER.info("resultJsonElement: " + resultJsonElement);
            if(resultJsonElement.isJsonPrimitive()){
                result = resultJsonElement.getAsString();
            }
            else{
                result = resultJsonElement.toString();
            }
            System.out.println("result: " + result);
            return result;
        }
        else{
            return payload;
        }
    }

    @Override
    public void messageArrived(String s, MqttMessage mqttMessage) throws Exception {
        if(isListingSensor) {
            System.out.println("payload: " + new String(mqttMessage.getPayload(), StandardCharsets.UTF_8));
            System.out.println("Topic: " + s);
            String result = this.payloadProcessing(new String(mqttMessage.getPayload(), StandardCharsets.UTF_8));
            PayloadModel payloadModel = payloadRepository.findFirstByPayloadAndTopic(result, s);
            if(payloadModel == null){
                LOGGER.info("payloadModel is null, will not list");
                return;
            }
            SensorInfoDTO newSensor = new SensorInfoDTO(payloadModel.getSensor().getSensorId(), payloadModel.getSensor().getName(), payloadModel.getPayload(),payloadModel.getTimestamp().toString());
            //there is chance that the payload include other stuff -> payload: {"payload":"testmsg","timestamp":1709630453}
            System.out.println("sensorInfo created");
            addNewSensorToList(newSensor);
        }
    }

    @Override
    public void deliveryComplete(IMqttDeliveryToken iMqttDeliveryToken) {
        System.out.println("delivery complete from rest service " + iMqttDeliveryToken.isComplete());
    }
}
