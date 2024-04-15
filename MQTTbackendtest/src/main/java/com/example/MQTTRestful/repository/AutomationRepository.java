package com.example.MQTTRestful.repository;

import com.example.MQTTRestful.model.AutomationModel;
import com.example.MQTTRestful.model.PayloadModel;
import com.example.MQTTRestful.model.SensorModel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AutomationRepository extends JpaRepository<AutomationModel, Long> {

    AutomationModel findFirstBySensorAndExpression(SensorModel device, String expression);
}
