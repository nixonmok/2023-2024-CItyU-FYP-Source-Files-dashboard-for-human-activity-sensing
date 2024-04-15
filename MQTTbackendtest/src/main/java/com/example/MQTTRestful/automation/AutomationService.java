package com.example.MQTTRestful.automation;

import com.example.MQTTRestful.MQTTServices.MQTTPublish;
import com.example.MQTTRestful.model.Condition;
import com.example.MQTTRestful.model.SensorModel;
import com.example.MQTTRestful.repository.AutomationRepository;
import com.example.MQTTRestful.repository.PayloadRepository;
import com.example.MQTTRestful.repository.SensorRepository;
import com.google.gson.Gson;
import jakarta.annotation.Resource;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Stack;

@Service
public class AutomationService {

    @Resource
    private AutomationRepository automationRepository;

    @Resource
    private PayloadRepository payloadRepository;

    @Resource
    private SensorRepository sensorRepository;

    @Resource
    private MQTTPublish mqttPublish;

    private final Gson gson = new Gson();

    public void automationService() {
        System.out.println("Automation Service is running");
    }



    public void checkAutomation(String topic, MqttMessage message) {
        System.out.println("----------------------Checking Automation-------------------");
        System.out.println("Topic: " + topic);
        System.out.println("Message: " + message.toString());
        automationRepository.findAll().forEach(automation -> {
            //check if the automation's condition contain received sensor data
            //System.out.println("Automation: " + automation.getAutomationId() + " " + automation.getExpression() + " " + automation.getPublishValue() + " " + automation.getTopic());
            ArrayList<String> expressionBackToArray = gson.fromJson(automation.getExpression(), ArrayList.class);


            Stack<String> postfixExpression = postfixEvaluatorHelper.infixToPostfix(expressionBackToArray);
            System.out.println(postfixExpression);
            if(postfixEvaluatorHelper.evaluatePostfix(postfixExpression, message.toString(), topic, sensorRepository, payloadRepository)){
                System.out.println("Automation is true");
                String automationTopic = automation.getTopic();
                //delete all_device/control_device_publish from the topic
                String deviceName = automationTopic.split("/")[2];
                //publish to all_device/control_device_subscribe/{deviceName}
                String topicToPublish = "all_device/control_device_subscribe/" + deviceName;
                mqttPublish.sendMQTTMessage(topicToPublish, automation.getPublishValue(), 2);
                //publish to the topic

            }
            else{
                System.out.println("Automation is false");
                //do nothing
            }
            System.out.println("-----------------------------------------------------------");

        });

    }


}
