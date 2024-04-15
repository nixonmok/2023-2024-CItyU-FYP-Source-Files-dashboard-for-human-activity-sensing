package com.example.MQTTRestful.MQTTServices;

import com.example.MQTTRestful.automation.AutomationService;
import com.example.MQTTRestful.jpaServices.MQTTDataJpaService;
import org.eclipse.paho.client.mqttv3.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MQTTDataToJpaService extends MQTTConnection implements MqttCallback {
    private static final Logger LOGGER = LoggerFactory.getLogger(MQTTDataToJpaService.class);

    @Autowired
    private MQTTDataJpaService mqttDataJpaService;

    @Autowired
    private AutomationService automationService;

    public MQTTDataToJpaService() {
        LOGGER.info("data to db service is on.");
    }

    public Boolean subscribeToAllConnect(){
        setOptions(getConnectFactory().dbOptions());
        setClientId(getConfig().getDbClient().getClientId());
        MqttClient client = connect();
        client.setCallback(this);
        System.out.println("subscribeToAllConnect()");
        return true;
    }

    public void subscribeToAll() {
        subscribeToAllConnect();
        try {
            //getMqttClient().unsubscribe("$SYS/broker/#");
            getMqttClient().subscribe("all_device/#", 2); //should be "sensor_data/#" in final
        } catch (MqttException e) {
            LOGGER.info(e.getMessage(), e);
            LOGGER.info("fail to subscribe all topic");
        }
    }

    @Override
    public void connectionLost(Throwable throwable) {
        LOGGER.info("connection lost(MQTTDataToDbService), trying to reconnect... cause: " + throwable.getMessage() +throwable.getCause());
        connect(); //need to change -> should rely on context

        while (true){
            try {
                //如果没有发生异常说明连接成功，如果发生异常，则死循环
                LOGGER.info("looping...");
                Thread.sleep(1000);
                break;
            }catch (Exception e){
                LOGGER.info(e.toString());
                continue;
            }
        }
    }

    @Override
    public void messageArrived(String s, MqttMessage mqttMessage) throws Exception {
        //maybe add a compare logic to block duplicate data update(timestamp=same)
        //System.out.println(s);
        System.out.println("message ready to be saved to db");
        mqttDataJpaService.sensorDataToDb(s, mqttMessage);

        if(s.contains("all_device/sensor_data")){
            //get every automation in database and check if the sensor data triggers any automation
            System.out.println("sensor data arrived");
            automationService.checkAutomation(s, mqttMessage);
        }
    }

    @Override
    public void deliveryComplete(IMqttDeliveryToken iMqttDeliveryToken) {

    }
}
