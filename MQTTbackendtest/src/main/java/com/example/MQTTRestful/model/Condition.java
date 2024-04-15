package com.example.MQTTRestful.model;

import com.example.MQTTRestful.jpaServices.MQTTDataJpaService;
import com.example.MQTTRestful.repository.PayloadRepository;
import com.example.MQTTRestful.repository.SensorRepository;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import jakarta.annotation.Resource;

//condition from expression in automation
//e.g: {"sensorId":153,"key":"msg","operator":"=","value":"32","conditionId":1}

public class Condition {
    private int sensorId;
    private String key;
    private String operator;
    private String value;
    private int conditionId;


    public Condition(int sensorId, String key, String operator, String value, int conditionId) {
        this.sensorId = sensorId;
        this.key = key;
        this.operator = operator;
        this.value = value;
        this.conditionId = conditionId;
    }

    public boolean evaluate(String msg, String topic, SensorRepository sensorRepository, PayloadRepository payloadRepository, Gson gson){

        //System.out.println("sensor id: "+sensorId);
        SensorModel sensor = sensorRepository.findFirstBySensorId(sensorId);
        String message;
        String valueReceivedOrFromDB;

        if (sensor.getName().equals(topic)){
            //System.out.println("The received sensor message is needed in this condition " + sensor.getName());
            valueReceivedOrFromDB = getCompareValue(msg, gson,false);
        }
        else {
            //System.out.println("The received sensor message is not needed in this condition, received sensor: " + sensor.getName() + "condition sensor: " + topic);
            //fetch newest data from database
            PayloadModel payload = payloadRepository.findFirstBySensorOrderByTimestampDesc(sensor);
            if(payload == null){
                System.out.println("No match data in database, evaluation result: false");
                return false;
            }
            //System.out.println("The newest data from database: " + payload.getPayload());
            valueReceivedOrFromDB = getCompareValue(payload.getPayload(), gson, true);
        }
        try{
            int valueInt = Integer.parseInt(this.value);
            int receivedValue = Integer.parseInt(valueReceivedOrFromDB);

            if(operator.equals("=")){
                return valueReceivedOrFromDB.equals(value);
            }
            else if(operator.equals("≠")){
                return !valueReceivedOrFromDB.equals(value);
            }
            else if(operator.equals(">")){
                return receivedValue > valueInt;
            }
            else if(operator.equals("<")){
                return receivedValue < valueInt;
            }
            else if(operator.equals(">=")){
                return receivedValue >= valueInt;
            }
            else if(operator.equals("<=")){
                return receivedValue <= valueInt;
            }
            else{
                throw new Exception("Invalid operator");
            }

        }
        catch(NumberFormatException  e){

            if(operator.equals("=")){
                return valueReceivedOrFromDB.equals(value);
            }
            else if(operator.equals("≠")){
                return !valueReceivedOrFromDB.equals(value);
            }
            return false;
        }
        catch (Exception e){
            return false;
        }

    }

    private String getCompareValue(String msg, Gson gson, boolean fromDB) {
        String valueReceivedOrFromDB;
        if(MQTTDataJpaService.isJsonFormat(msg)){
            JsonObject jsonObject = gson.fromJson(msg, JsonObject.class);
            System.out.println(jsonObject.toString());
            if(fromDB){
                valueReceivedOrFromDB = jsonObject.get(key).getAsString();
            }
            else if(jsonObject.get("payload").isJsonPrimitive()){
                //payload is a string
                System.out.println("payload is a string");
                valueReceivedOrFromDB = jsonObject.get("payload").getAsString();
            } else{
                //payload is a json object
                JsonObject innerObject = jsonObject.get("payload").getAsJsonObject();
                valueReceivedOrFromDB = innerObject.get(key).getAsString();
            }
        }
        else{
            valueReceivedOrFromDB = msg;
        }
        System.out.println("-------          -------");
        System.out.println("The value to compare: " + valueReceivedOrFromDB);
        System.out.println("-------          -------");

        return valueReceivedOrFromDB;
    }

    public boolean isMessageUsed(String topic, SensorRepository sensorRepository){
        return sensorRepository.findFirstBySensorId(sensorId).getName().equals(topic);
    }

    public int getSensorId() {
        return sensorId;
    }

    public void setSensorId(int sensorId) {
        this.sensorId = sensorId;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getOperator() {
        return operator;
    }

    public void setOperator(String operator) {
        this.operator = operator;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public int getConditionId() {
        return conditionId;
    }

    public void setConditionId(int conditionId) {
        this.conditionId = conditionId;
    }
}
