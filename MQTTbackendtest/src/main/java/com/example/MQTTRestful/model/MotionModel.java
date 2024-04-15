package com.example.MQTTRestful.model;

import jakarta.persistence.*;


@Entity
@Table(name = "motion")
public class MotionModel {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    @Column
    private String motion;

    @Column
    private int timestamp;

    @Column
    private String csiData; //or array or int


}
