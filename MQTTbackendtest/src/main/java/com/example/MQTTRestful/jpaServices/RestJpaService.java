package com.example.MQTTRestful.jpaServices;

import com.example.MQTTRestful.model.*;
import com.example.MQTTRestful.repository.AutomationRepository;
import com.example.MQTTRestful.repository.PayloadRepository;
import com.example.MQTTRestful.repository.SensorRepository;
import com.google.gson.Gson;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.TimeZone;

@Service
public class RestJpaService {
    @Autowired
    private SensorRepository sensorRepository;

    @Autowired
    private PayloadRepository payloadRepository;

    @Autowired
    private AutomationRepository automationRepository;

    private final Gson gson;

    public RestJpaService() {
        gson = new Gson();
    }

    public ArrayList<SensorInfoDTO> fetchAllSensor(){
        //find sensor with type 0
        ArrayList<SensorModel> sensorModels = sensorRepository.findByType(0);
        ArrayList<SensorInfoDTO> sensorInfos = new ArrayList<>();
        for(SensorModel sensorModel : sensorModels){
            sensorInfos.add(new SensorInfoDTO(sensorModel.getSensorId(), sensorModel.getName(),"", sensorModel.getAddedTime().toString()));
        }
        return sensorInfos;
    }

    public List<AutomationDTO> fetchAutomation(){
        List<AutomationDTO> automationModels = new ArrayList<>();
        automationRepository.findAll().forEach(automationModel -> {
                    automationModels.add(new AutomationDTO(automationModel.getAutomationId(), automationModel.getTopic(), automationModel.getExpression(), automationModel.getPublishValue(), automationModel.getSensor().getSensorId()));
                    System.out.println(automationModels);
                }
        );
        return automationModels;
    }

    public ArrayList<SensorInfoDTO> fetchActiveDevices(String topicInclude){
        ArrayList<SensorModel> sensors = sensorRepository.findByNameContaining(topicInclude);
        System.out.println(sensors);
        ArrayList<SensorInfoDTO> sensorInfos = new ArrayList<>();
        if(sensors != null){
            for(SensorModel sensor : sensors){
                PayloadModel payload = payloadRepository.findFirstBySensorOrderByTimestampDesc(sensor);
                if(payload != null) {
                    sensorInfos.add(new SensorInfoDTO(sensor.getSensorId(), sensor.getName(), payload.getPayload(), payload.getTimestamp().toString()));
                }
            }
        }
        return sensorInfos;
    }




    public ArrayList<PayloadModel> queryPayload(String topic, long from, long to) {
        //convert from and to (unix timestamp) to LocalDateTime first
        LocalDateTime fromTime = LocalDateTime.ofInstant(Instant.ofEpochSecond(from), TimeZone.getDefault().toZoneId());
        LocalDateTime toTime = LocalDateTime.ofInstant(Instant.ofEpochSecond(to), TimeZone.getDefault().toZoneId());
        ArrayList<PayloadModel> payloadModels = payloadRepository.findByTopicAndTimestampBetween(topic, fromTime, toTime);
        return payloadModels;
    }

    public void addAutomation(String topic, String expression, String publishValue, int deviceId){
        SensorModel sensor = sensorRepository.findFirstBySensorId(deviceId);
        if(sensor == null){
            System.out.println("Sensor not found");
            throw new IllegalArgumentException("Sensor not found");
        }
        else{
            System.out.println("Sensor found");
            System.out.println(sensor.getSensorId());

            AutomationModel automationModel = new AutomationModel(topic, expression, publishValue, sensor);
            automationRepository.save(automationModel);
        }

    }

    public void deleteAutomation(int deviceId, String expression){
        SensorModel sensor = sensorRepository.findFirstBySensorId(deviceId);
        if(sensor == null){
            System.out.println("sensor not found");
            throw new IllegalArgumentException("Automation not found");
        }
        else{
            System.out.println("Sensor found");
            AutomationModel automationToDelete= automationRepository.findFirstBySensorAndExpression(sensor, expression);
            if(automationRepository.findFirstBySensorAndExpression(sensor, expression) == null){
                System.out.println("Automation not found");
                throw new IllegalArgumentException("Automation not found");
            }
            else {
                System.out.println("Automation found");
                automationRepository.delete(automationToDelete);
            }
        }
    }
}
