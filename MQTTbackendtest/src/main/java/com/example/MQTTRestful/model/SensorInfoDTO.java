package com.example.MQTTRestful.model;

public class SensorInfoDTO {
    private int sensorId;
    private String sensorTopic;
    private String retainedMessage;
    private String dateTimeRegistered;

    public SensorInfoDTO(int sensorId, String sensorTopic, String retainedMessage, String dateTimeRegistered) {
        this.sensorId = sensorId;
        this.sensorTopic = sensorTopic;
        this.retainedMessage = retainedMessage;
        this.dateTimeRegistered = dateTimeRegistered;
    }

    public int getSensorId() {
        return sensorId;
    }

    public void setSensorId(int sensorId) {
        this.sensorId = sensorId;
    }

    public String getRetainedMessage() {
        return retainedMessage;
    }

    public void setRetainedMessage(String retainedMessage) {
        this.retainedMessage = retainedMessage;
    }

    public String getDateTimeRegistered() {
        return dateTimeRegistered;
    }

    public void setDateTimeRegistered(String dateTimeRegistered) {
        this.dateTimeRegistered = dateTimeRegistered;
    }
}
