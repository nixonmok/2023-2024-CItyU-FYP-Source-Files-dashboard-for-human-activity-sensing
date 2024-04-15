package com.example.MQTTRestful.MQTTServices;
import com.example.MQTTRestful.WebSocketService.WebSocketService;
import com.example.MQTTRestful.automation.AutomationService;
import com.example.MQTTRestful.jpaServices.MQTTDataJpaService;
import org.eclipse.paho.client.mqttv3.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
public class MQTTSubscribe extends MQTTConnection implements MqttCallback {
    private static final Logger LOGGER = LoggerFactory.getLogger(MQTTSubscribe.class);

    @Autowired
    private MQTTDataJpaService mqttDataJpaService;

    @Autowired
    private AutomationService automationService;

    @Autowired
    private WebSocketService webSocketService;


    //configs
    public MQTTSubscribe() {
        LOGGER.info("Subscribe Service is on.");
    }

    public Boolean subscribeConnect() {
        setOptions(getConnectFactory().subscribeOption());
        setClientId(getConfig().getSubscribeClient().getClientId());
        MqttClient client = connect();
        client.setCallback(this);
        System.out.println("subscribeConnect()");
        return true;
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
            System.out.println("unsubscribe successfully");
        } catch (MqttException e) {
            LOGGER.info("unsubscribe fail");
            LOGGER.info(e.getMessage(), e);
        }
    }

    //used by controller
    public void subscribeTopic(String topic, int qos) {
        subscribeConnect();
        subscribe(topic, qos);
    }

    //used by controller
    public void subscribeToCSI() {
        subscribeConnect();
        subscribe("MotionDetection/#", 2);
        subscribe("IndoorPrediction/#", 2);
    }


    public void unSubscribeTopic(String topic) {
        subscribeConnect();
        unSubscribe(topic);
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

    @Override
    public void messageArrived(String s, MqttMessage mqttMessage) throws Exception {
        String result = new String(mqttMessage.getPayload(), StandardCharsets.UTF_8);
        System.out.println("topic : " + s);
        System.out.println("Qos : " + mqttMessage.getQos());
        System.out.println("Result : " + result);
        webSocketService.sendMessage(s, mqttMessage); //send to frontend via websocket

    }

    @Override
    public void deliveryComplete(IMqttDeliveryToken iMqttDeliveryToken) {
        System.out.println("deliveryComplete---------" + iMqttDeliveryToken.isComplete());

    }
}
