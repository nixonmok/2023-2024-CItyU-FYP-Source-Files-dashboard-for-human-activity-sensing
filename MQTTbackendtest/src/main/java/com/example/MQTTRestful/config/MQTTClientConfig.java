package com.example.MQTTRestful.config;

import org.springframework.context.annotation.Configuration;

@Configuration
public class MQTTClientConfig {
    private String clientId;
    private String username;
    private String password;

    public String getClientId() {
        return clientId;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
