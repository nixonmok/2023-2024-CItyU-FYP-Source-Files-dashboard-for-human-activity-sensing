package com.example.MQTTRestful.controller;

import com.example.MQTTRestful.model.SensorModel;
import com.example.MQTTRestful.repository.SensorRepository;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping(value = "testDB")
public class TestDbController {
    @Resource
    private SensorRepository sensorRepository;

    @RequestMapping(value = "addSensor")
    public String sensor(String name, int type, LocalDateTime addedTime){
        SensorModel sensor = new SensorModel(name, type, addedTime);
        sensorRepository.save(sensor);
        return name + type + addedTime;
    }
}
