package com.example.MQTTRestful.model;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "events")
public class eventsModel {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long eventId;

    @Column
    private String descriptions;

    @Column
    private int timestamp;

    @ManyToMany(cascade = {CascadeType.ALL})
    @JoinTable(name = "eventData",
    joinColumns = {@JoinColumn(name = "eventId")},
    inverseJoinColumns = {@JoinColumn(name = "payloadId")})
    private Set<PayloadModel> payloadModels = new HashSet<>();

    public eventsModel(long eventId, String descriptions, int timestamp) {
        this.descriptions = descriptions;
        this.timestamp = timestamp;
    }

    public eventsModel() {

    }

    public long getEventId() {
        return eventId;
    }

    public void setEventId(long eventId) {
        this.eventId = eventId;
    }

    public String getDescriptions() {
        return descriptions;
    }

    public void setDescriptions(String descriptions) {
        this.descriptions = descriptions;
    }

    public int getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(int timestamp) {
        this.timestamp = timestamp;
    }

    public Set<PayloadModel> getPayloadModelModels() {
        return payloadModels;
    }

    public void setPayloadModelModels(Set<PayloadModel> PayloadModels) {
        this.payloadModels = PayloadModels;
    }

    public void addSensorData(PayloadModel payloadData){
        this.payloadModels.add(payloadData);
        payloadData.getEventsModels().add(this);
    }

    public void removeSensorData(PayloadModel payloadData){
        if(this.payloadModels.contains(payloadData))
            this.payloadModels.remove(payloadData);
        payloadData.getEventsModels().remove(this);
    }
}
