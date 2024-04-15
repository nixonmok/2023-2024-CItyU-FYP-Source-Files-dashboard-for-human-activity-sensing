package com.example.MQTTRestful.repository;

import com.example.MQTTRestful.model.SensorModel;
import org.hibernate.annotations.SQLInsert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.ArrayList;
import java.util.List;

public interface SensorRepository extends JpaRepository<SensorModel, Integer> {
    public SensorModel findFirstByName(String name);

    public SensorModel findFirstBySensorId(int sensorId);

    @SQLInsert(sql = "INSERT IGNORE INTO sensors")
    public boolean existsByName(String name);

    public ArrayList<SensorModel> findByType(int i);

    ArrayList<SensorModel> findByNameContaining(String topicInclude);
}
