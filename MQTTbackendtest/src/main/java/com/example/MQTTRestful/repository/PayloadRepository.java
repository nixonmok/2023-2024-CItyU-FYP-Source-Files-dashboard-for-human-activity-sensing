package com.example.MQTTRestful.repository;

import com.example.MQTTRestful.model.PayloadModel;
import com.example.MQTTRestful.model.SensorModel;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public interface PayloadRepository extends JpaRepository<PayloadModel, Long> {
    List<PayloadModel> findByTimestamp(LocalDateTime timestamp);

    List<PayloadModel> findByTopic(String topic);

    PayloadModel findFirstByPayloadAndTopic(String payload, String Topic);

    @Modifying
    @Transactional
    @Query("DELETE FROM PayloadModel p WHERE p.timestamp < :time")
    void deleteByTimestampBefore(LocalDateTime time);

    ArrayList<PayloadModel> findByTopicAndTimestampBetween(String topic, LocalDateTime from, LocalDateTime to);

    PayloadModel findFirstBySensorOrderByTimestampDesc(SensorModel sensor);

}
