package com.example.MQTTRestful.MQTTServices;

import com.example.MQTTRestful.config.MQTTConfig;
import com.example.MQTTRestful.factory.MQTTConnectOptionFactory;
import org.eclipse.paho.client.mqttv3.*;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MQTTConnection {
    private static final Logger LOGGER = LoggerFactory.getLogger(MQTTConnection.class);

    //setting
    private MqttClient mqttClient;

    private MqttConnectOptions options;

    private String clientId;
    //configs
    private MQTTConfig config;
    private MQTTConnectOptionFactory connectFactory;

    @Autowired
    public void setConnectOptionFactory(MQTTConnectOptionFactory connectFactory) {
        this.connectFactory = connectFactory;
    }

    @Autowired
    public void setMQTTConfig(MQTTConfig config) {
        this.config = config;
    }


    public MqttClient connect() {
        try {
            if (mqttClient == null) {
                mqttClient = new MqttClient(config.getHost(), clientId, new MemoryPersistence());
                System.out.println("client id: "+ mqttClient.getClientId());
            }

            if (mqttClient.isConnected()) {
                LOGGER.info("client originally connected");
                mqttClient.disconnect();
            }

            mqttClient.connect(this.options);
            LOGGER.info("MQTT connected");
        }
        catch (MqttException e) {
            LOGGER.info("something wrong in MQTTConnection.connect");
            LOGGER.info(e.toString());
        }
        return mqttClient;
    }

    public void setOptions(MqttConnectOptions options) {
        this.options = options;
    }

    public MQTTConnectOptionFactory getConnectFactory() {
        return connectFactory;
    }

    public MQTTConfig getConfig() {
        return config;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public MqttClient getMqttClient() {
        return mqttClient;
    }
}
