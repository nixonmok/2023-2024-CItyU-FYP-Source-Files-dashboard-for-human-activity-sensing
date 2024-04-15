package com.example.MQTTRestful.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.NestedConfigurationProperty;
import org.springframework.context.annotation.Configuration;


@Configuration

/*
The @ConfigurationProperties annotation is used to bind external configuration properties in Spring Boot.
The MQTTConfig.PREFIX part indicates that this binding will apply to properties prefixed with a certain value.
*/
@ConfigurationProperties(MQTTConfig.PREFIX)
public class MQTTConfig {
    public static final String PREFIX = "mqtt";
    private String host;
    private boolean cleanSession;
    private String default_topic;
    private int timeout;
    private int keepalive;
    private int connectionTimeout;

    @NestedConfigurationProperty
    private MQTTClientConfig dbClient;
    @NestedConfigurationProperty
    private MQTTClientConfig publishClient;
    @NestedConfigurationProperty
    private MQTTClientConfig subscribeClient;
    @NestedConfigurationProperty
    private MQTTClientConfig restClient;



    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public String getDefault_topic() {
        return default_topic;
    }

    public void setDefault_topic(String default_topic) {
        this.default_topic = default_topic;
    }

    public int getTimeout() {
        return timeout;
    }

    public void setTimeout(int timeout) {
        this.timeout = timeout;
    }

    public int getKeepalive() {
        return keepalive;
    }

    public void setKeepalive(int keepalive) {
        this.keepalive = keepalive;
    }

    public int getConnectionTimeout() {
        return connectionTimeout;
    }

    public void setConnectionTimeout(int connectionTimeout) {
        this.connectionTimeout = connectionTimeout;
    }

    public boolean isCleanSession() {
        return cleanSession;
    }

    public void setCleanSession(boolean cleanSession) {
        this.cleanSession = cleanSession;
    }

    public MQTTClientConfig getPublishClient() {
        return publishClient;
    }

    public void setPublishClient(MQTTClientConfig publishClient) {
        this.publishClient = publishClient;
    }

    public MQTTClientConfig getSubscribeClient() {
        return subscribeClient;
    }

    public void setSubscribeClient(MQTTClientConfig subscribeClient) {
        this.subscribeClient = subscribeClient;
    }

    public MQTTClientConfig getRestClient() {
        return restClient;
    }

    public void setRestClient(MQTTClientConfig restClient) {
        this.restClient = restClient;
    }

    public MQTTClientConfig getDbClient() {
        return dbClient;
    }

    public void setDbClient(MQTTClientConfig dbClient) {
        this.dbClient = dbClient;
    }
}