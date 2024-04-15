package com.example.MQTTRestful.controller;

import com.example.MQTTRestful.MQTTServices.MQTTDataToJpaService;
import com.example.MQTTRestful.MQTTServices.MQTTPublish;
import com.example.MQTTRestful.MQTTServices.MQTTRestService;
import com.example.MQTTRestful.MQTTServices.MQTTSubscribe;
import com.example.MQTTRestful.jpaServices.RestJpaService;
import com.example.MQTTRestful.model.*;
import com.google.gson.Gson;
import jakarta.annotation.Resource;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;


@RestController
@RequestMapping(value = "/testMQTT")
public class MQTTController {
    @Resource
    private MQTTPublish mqttPublish;
    @Resource
    private MQTTSubscribe mqttSubscribe;
    @Resource
    private MQTTRestService mqttRestService;
    @Resource
    private MQTTDataToJpaService mqttDataToJpaService;
    @Resource
    private RestJpaService restJpaService;

    // ^ can all the stuff above be one field: MQTTConnection - refactor later
    private final Gson gson = new Gson();


    @RequestMapping(value = "testPublish")
    public String testPublish( @RequestParam(name="publish") String topic, String msg, int qos) {
        mqttPublish.sendMQTTMessage(topic, msg, qos);
        String data = "topic: ‘"+topic+"’，content: "+msg+"，QOS: "+qos;
        return data;
    }

    //test API, try publish JSON publishing
    @RequestMapping(value= "testJSONPublish")
    public String testJSONPublish(String topic, String msg, int qos){
        String payload = gson.toJson(new testJSONPublish(msg, System.currentTimeMillis()/1000L));
        mqttPublish.testJSONPublishing(new MqttMessage(payload.getBytes()),topic, qos);
        return payload;
    }

    //test parsing JSON from subscribing topic
    @RequestMapping(value = "subscribeToAllAndConnectDatabase")
    public String subscribeToAllAndConnectDatabase(){
        mqttDataToJpaService.subscribeToAll();
        return "...";
    }

    @RequestMapping(value = "listAllSensor", method = RequestMethod.GET)
    @CrossOrigin(origins = "http://localhost:3000")
    public String listAllSensor() throws InterruptedException {
        //under a "directory" subscribe to get all topic's name, then unsubscribe all
        ArrayList<SensorInfoDTO> sensorList = restJpaService.fetchActiveDevices("all_device/sensor_data/");
        String result = gson.toJson(sensorList);
        //mqttRestService.listAllSensor() show return an object arraylist
        System.out.println(result);
        return gson.toJson(result);
    }

    @RequestMapping(value = "listAllControlDevice", method = RequestMethod.GET)
    @CrossOrigin(origins = "http://localhost:3000")
    public String listAllControlDevice() throws InterruptedException {
        //under a "directory" subscribe to get all topic's name, then unsubscribe all
        ArrayList<SensorInfoDTO> sensorList = restJpaService.fetchActiveDevices("all_device/control_device_publish/");
        String result = gson.toJson(sensorList);
        //mqttRestService.listAllSensor() show return an object arraylist
        System.out.println(result);
        return gson.toJson(result);
    }

    @RequestMapping(value= "subscribe")
    @CrossOrigin(origins = "http://localhost:3000")
    public String subscribe(String topic, int qos) throws InterruptedException{
        System.out.println("running subscribe API");
        System.out.println("topic: " + topic + " qos: " + qos);
        mqttSubscribe.subscribeTopic(topic, qos);
        return "subscribe successfully " + "topic: " + topic;
    }

    @RequestMapping(value= "unsubscribe", method = RequestMethod.GET)
    @CrossOrigin(origins = "http://localhost:3000")
    public String unsubscribe(String topic) throws InterruptedException{
        System.out.println("running unsubscribe API");
        mqttSubscribe.unSubscribeTopic(topic);
        return "unsubscribe successfully " + "topic: " + topic;
    }

    @RequestMapping(value = "publish")
    @CrossOrigin(origins = "http://localhost:3000")
    public String publish( String topic, String msg, int qos) {
        mqttPublish.sendMQTTMessage(topic, msg, qos);
        String data = "topic: ‘"+topic+"’，content: "+msg+"，QOS: "+qos;
        return data;
    }

    @RequestMapping(value = "databaseSensor")
    @CrossOrigin(origins = "http://localhost:3000")
    public String fetchAllDatabaseSensor(){
        ArrayList<SensorInfoDTO> sensorList = restJpaService.fetchAllSensor();
        String result = gson.toJson(sensorList);
        System.out.println(result);
        return result;
    }

    @RequestMapping(value = "queryPayload")
    @CrossOrigin(origins = "http://localhost:3000")
    public String queryPayload(String topic, long from, long to){
        //from and to is unix timestamp
        System.out.println("from: " + from + " to: " + to + " topic: " + topic);
        ArrayList<PayloadModel> payloadList = restJpaService.queryPayload(topic, from, to);
        ArrayList<PayloadQueried> payloadQueriedList = new ArrayList<>();
        for (PayloadModel payloadModel : payloadList){
            payloadQueriedList.add(new PayloadQueried(payloadModel.getTopic(),payloadModel.getPayload(), payloadModel.getTimestamp()));
        }
        String result = gson.toJson(payloadQueriedList);
        System.out.println(result);
        return result;
    }

    @RequestMapping(value = "addAutomation")
    @CrossOrigin(origins = "http://localhost:3000")
    public String addAutomation(String topic, String expression, String publishValue, int deviceId){
        System.out.println("topic: " + topic + " expression: " + expression + " publishValue: " + publishValue + " deviceId: " + deviceId);
        //ArrayList<String> expressionBackToArray = gson.fromJson(expression, ArrayList.class);
        //System.out.println(expressionBackToArray);
        //AutomationModel automationModel = new AutomationModel(topic, expression, publishValue, deviceId);
        restJpaService.addAutomation(topic, expression, publishValue, deviceId);
        return "add automation successfully";
    }

    @RequestMapping(value = "fetchAutomation")
    @CrossOrigin(origins = "http://localhost:3000")
    public String fetchAutomation(){
        List<AutomationDTO> automationList = restJpaService.fetchAutomation();
        String result = gson.toJson(automationList);
        System.out.println(result);
        return result;
    }

    @RequestMapping(value = "deleteAutomation")
    @CrossOrigin(origins = "http://localhost:3000")
    public String deleteAutomation(int id, String expression){
        //use device id and expression to delete
        restJpaService.deleteAutomation(id,expression);
        return "delete automation successfully";
    }

    @RequestMapping(value = "subscribeToCSI")
    @CrossOrigin(origins = "http://localhost:3000")
    public String subscribeToCSI(){
        mqttSubscribe.subscribeToCSI();
        return "subscribed to CSI";
    }


}