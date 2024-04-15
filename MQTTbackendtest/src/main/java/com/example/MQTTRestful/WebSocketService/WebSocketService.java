package com.example.MQTTRestful.WebSocketService;

import com.example.MQTTRestful.MQTTServices.MQTTRestService;
import com.google.gson.Gson;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
public class WebSocketService {
    private static final Logger LOGGER = LoggerFactory.getLogger(WebSocketService.class);

    @Autowired
    private SimpMessagingTemplate template;
    private final Gson gson;

    public WebSocketService() {
        this.gson = new Gson();
    }

    public void sendMessage(String messageTopic, MqttMessage mqttMessage){
        try {
            Map<String, String> mapToJSON = new HashMap<>(); //suppose to be Object, Object -> now just for testing
            mapToJSON.put("title", "testWebSocket");
            mapToJSON.put("id", String.valueOf(mqttMessage.getId()));
            mapToJSON.put("sensor", messageTopic);
            mapToJSON.put("QoS", String.valueOf(mqttMessage.getQos()));
            mapToJSON.put("message", new String(mqttMessage.getPayload(), StandardCharsets.UTF_8));

            template.convertAndSend("/topic/sensorData", gson.toJson(mapToJSON));
            LOGGER.info("sent message: " + mapToJSON);

        } catch (Exception e) {
            System.err.println(e);
        }
    }
}
