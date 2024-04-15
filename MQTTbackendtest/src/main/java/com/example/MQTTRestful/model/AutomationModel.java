package com.example.MQTTRestful.model;

import jakarta.persistence.*;

@Entity
@Table(name = "automation")
public class AutomationModel {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int automationId;

    @Column
    private String topic;
    @Column
    private String expression;
    @Column
    private String publishValue;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sensorId")
    private SensorModel sensor;

    public AutomationModel( String topic, String expression, String publishValue, SensorModel sensor) {
        this.topic = topic;
        this.expression = expression;
        this.publishValue = publishValue;
        this.sensor = sensor;
    }

    public AutomationModel() {

    }

    public SensorModel getSensor() {
        return sensor;
    }

    public void setSensor(SensorModel sensor) {
        this.sensor = sensor;
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

    public void setTopic(String automationName) {
        this.topic = automationName;
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

}
