package com.example.MQTTRestful.MQTTServices;

import org.eclipse.paho.client.mqttv3.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * MQTT logic -> subscribe and publish (business logic)
 * publisher，subscribe is in PushCallback
 * sendMQTTMessage = publish
 */

//service == business logic layer in spring boot

@Service
public class MQTTPublish extends MQTTConnection {
    private static final Logger LOGGER = LoggerFactory.getLogger(MQTTPublish.class);

    public MqttTopic topic;
    public MqttMessage message;

    //configs


    public MQTTPublish() {
        LOGGER.info("Publish Service is on.");
    }

    public Boolean publishConnect() {
        super.setOptions(getConnectFactory().publishOption());
        super.setClientId(getConfig().getPublishClient().getClientId());
        MqttClient client = super.connect();
        return true;
    }

    /**
     * 发布者客户端和服务端建立连接
     */

    public boolean publish(MqttTopic topic , MqttMessage message) {

        MqttDeliveryToken token = null;
        try {

            token = topic.publish(message);
            token.waitForCompletion();

            boolean flag = token.isComplete();

            if (flag) {
                LOGGER.info("message sent");
            } else {
                LOGGER.info("message not sent");
            }
        } catch (MqttException e) {
            LOGGER.info(e.toString());
        }
        return token.isComplete();
    }

    public void sendMQTTMessage(String topic, String data, int qos) {

        try {
            //setting
            this.publishConnect();
            this.topic = getMqttClient().getTopic(topic);
            message = new MqttMessage();
            message.setQos(qos);
            message.setRetained(true);
            message.setPayload(data.getBytes());
            publish(this.topic, message);
        } catch (Exception e) {
            LOGGER.info(e.toString());
            e.printStackTrace();
        }
    }

    //test API, try publish JSON
    public void testJSONPublishing(MqttMessage mqttMessage, String topic, int qos){
        this.publishConnect();
        this.topic = getMqttClient().getTopic(topic);
        mqttMessage.setQos(qos);
        mqttMessage.setRetained(true);
        publish(this.topic, mqttMessage);
    }
}