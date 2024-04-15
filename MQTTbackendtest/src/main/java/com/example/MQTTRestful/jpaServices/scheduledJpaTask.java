package com.example.MQTTRestful.jpaServices;

import com.example.MQTTRestful.repository.PayloadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import javax.ejb.Schedule;
import java.time.LocalDateTime;

@Service
public class scheduledJpaTask {
    @Autowired
    private PayloadRepository payloadRepository;

    @Scheduled(cron= "0 0 0 * * *") //0 0 0 * * * = 00:00 everyday
    private void deleteRecordDayBefore(){
        payloadRepository.deleteByTimestampBefore(LocalDateTime.now().minusDays(3));
        System.out.println("deleted entries before " + LocalDateTime.now().minusDays(3));
    }
}
