package com.example.MQTTRestful.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "sensors")
public class SensorModel {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int sensorId;

    @Column
    private String name;

    @Column
    private int type;

    @Column
    private LocalDateTime addedTime;

    @OneToMany(mappedBy = "sensor", fetch = FetchType.EAGER)
    private Set<PayloadModel> sensorData = new HashSet<>();

    @OneToMany(mappedBy = "sensor", fetch = FetchType.EAGER)
    private Set<AutomationModel> automationModels = new HashSet<>();

    public SensorModel(String name, int type, LocalDateTime addedTime) {
        this.name = name;
        this.type = type;
        this.addedTime = addedTime;
    }

    public SensorModel() {

    }

    public int getSensorId() {
        return sensorId;
    }

    public void setSensorId(int sensorId) {
        this.sensorId = sensorId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getType() {
        return type;
    }

    public void setType(int type) {
        this.type = type;
    }

    public LocalDateTime getAddedTime() {
        return addedTime;
    }

    public void setAddedTime(LocalDateTime addedTime) {
        this.addedTime = addedTime;
    }

    public Set<PayloadModel> getSensorData() {
        return sensorData;
    }

    public void setSensorData(Set<PayloadModel> sensorData) {
        this.sensorData = sensorData;
    }

    public Set<AutomationModel> getAutomationModels() {
        return automationModels;
    }

    public void setAutomationModels(Set<AutomationModel> automationModels) {
        this.automationModels = automationModels;
    }
}
