package com.example.MQTTRestful.model;


public class AutomationDTO {

    private int automationId;
    private String topic;
    private String expression;
    private String publishValue;
    private int sensorId;

    public AutomationDTO(int automationId, String topic, String expression, String publishValue, int sensorId) {
        this.automationId = automationId;
        this.topic = topic;
        this.expression = expression;
        this.publishValue = publishValue;
        this.sensorId = sensorId;
    }

    public int getAutomationId() {
        return automationId;
    }

    public void setAutomationId(int automationId) {
        this.automationId = automationId;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getExpression() {
        return expression;
    }

    public void setExpression(String expression) {
        this.expression = expression;
    }

    public String getPublishValue() {
        return publishValue;
    }

    public void setPublishValue(String publishValue) {
        this.publishValue = publishValue;
    }

    public int getSensorId() {
        return sensorId;
    }

    public void setSensorId(int sensorId) {
        this.sensorId = sensorId;
    }
}
