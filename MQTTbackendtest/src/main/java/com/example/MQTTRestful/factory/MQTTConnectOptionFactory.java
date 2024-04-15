package com.example.MQTTRestful.factory;

import com.example.MQTTRestful.config.MQTTClientConfig;
import com.example.MQTTRestful.config.MQTTConfig;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class MQTTConnectOptionFactory {
    private final MQTTConfig config;

    @Autowired
    public MQTTConnectOptionFactory(MQTTConfig config) {
        this.config = config;
    }
    private MqttConnectOptions createOption(MQTTClientConfig clientConfig){
        MqttConnectOptions options = new MqttConnectOptions();
        options.setCleanSession(config.isCleanSession());
        options.setUserName(clientConfig.getUsername());
        options.setPassword(clientConfig.getPassword().toCharArray());
        options.setConnectionTimeout(config.getConnectionTimeout());
        options.setKeepAliveInterval(config.getKeepalive());
        return options;
    }

    public MqttConnectOptions subscribeOption(){
        return createOption(config.getSubscribeClient());
    }

    public MqttConnectOptions dbOptions(){return createOption(config.getDbClient());}

    public MqttConnectOptions publishOption(){
        return createOption(config.getPublishClient());
    }

    public MqttConnectOptions restOption(){
        return createOption(config.getRestClient());
    }
}
