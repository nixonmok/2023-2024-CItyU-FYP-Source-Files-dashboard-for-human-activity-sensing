package com.example.MQTTRestful.model;

public class testJSONPublish {
    private String payload;
    private long timestamp;

    public testJSONPublish(String payload, long timestamp) {
        this.payload = payload;
        this.timestamp = timestamp;
    }

    public String getPayload() {
        return payload;
    }

    public void setPayload(String payload) {
        this.payload = payload;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}
