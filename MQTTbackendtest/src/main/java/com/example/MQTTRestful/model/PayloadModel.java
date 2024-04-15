package com.example.MQTTRestful.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "payload")
public class PayloadModel {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long payloadId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sensorId")
    private SensorModel sensor;

    @Column
    private LocalDateTime timestamp;

    @Column
    private String topic;

    @Column
    private String payload;

    @Column
    private int Qos;

    @ManyToMany(mappedBy = "payloadModels", fetch = FetchType.EAGER)
    private Set<eventsModel> eventsModels = new HashSet<>();

    public PayloadModel(SensorModel sensor, LocalDateTime timestamp, String topic, String payload, int qos) {
        this.sensor = sensor;
        this.timestamp = timestamp;
        this.topic = topic;
        this.payload = payload;
        Qos = qos;
    }

    public PayloadModel() {

    }

    public long getPayloadId() {
        return payloadId;
    }

    public void setPayloadId(long sensorDataId) {
        this.payloadId = sensorDataId;
    }

    public SensorModel getSensor() {
        return sensor;
    }

    public void setSensor(SensorModel sensor) {
        this.sensor = sensor;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getPayload() {
        return payload;
    }

    public void setPayload(String payload) {
        this.payload = payload;
    }

    public int getQos() {
        return Qos;
    }

    public void setQos(int qos) {
        Qos = qos;
    }

    public Set<eventsModel> getEventsModels() {
        return eventsModels;
    }

    public void setEventsModels(Set<eventsModel> eventsModels) {
        this.eventsModels = eventsModels;
    }
}
