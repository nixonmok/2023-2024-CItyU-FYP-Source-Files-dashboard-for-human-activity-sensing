package com.example.MQTTRestful;

import com.example.MQTTRestful.MQTTServices.MQTTDataToJpaService;
import com.example.MQTTRestful.MQTTServices.MQTTRestService;
import com.example.MQTTRestful.MQTTServices.MQTTSubscribe;
import com.example.MQTTRestful.repository.PayloadRepository;
import jakarta.annotation.Resource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;

@SpringBootApplication
@EnableScheduling
@EntityScan(basePackages = {"com.example.MQTTRestful.model"})
@EnableJpaRepositories(basePackages = {"com.example.MQTTRestful.repository"})
public class MqtTbackendtestApplication {

    @Resource
    private MQTTSubscribe mqttSubscribe;
    @Resource
    private MQTTRestService mqttRestService;
    @Resource
    private MQTTDataToJpaService mqttDataToJpaService;
    @Resource
    private PayloadRepository payloadRepository;

    public static void main(String[] args) {
        SpringApplication.run(MqtTbackendtestApplication.class, args);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void startSubscriberConnectionAfterStartup(){
        System.out.println("after startup...");
        //after server startup, activate all subscriber client
        mqttSubscribe.subscribeConnect();
        mqttDataToJpaService.subscribeToAllConnect();
        mqttRestService.restConnect();
        mqttDataToJpaService.subscribeToAll();
        //payloadRepository.deleteByTimestampBefore(LocalDateTime.of(LocalDate.now(), LocalTime.MIDNIGHT)); //delete day before payload
    }
}
