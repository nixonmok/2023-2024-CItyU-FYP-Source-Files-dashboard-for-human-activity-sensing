package com.example.MQTTRestful.model;

import java.time.LocalDateTime;

public class PayloadQueried {
    private String topic;
    private String message;
    private LocalDateTime dateTime;

    public PayloadQueried(String topic, String message, LocalDateTime dateTime) {
        this.topic = topic;
        this.message = message;
        this.dateTime = dateTime;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getDateTime() {
        return dateTime;
    }

    public void setDateTime(LocalDateTime dateTime) {
        this.dateTime = dateTime;
    }
}
