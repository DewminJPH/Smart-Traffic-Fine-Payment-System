package com.police.traffic.notification.controller;

import com.police.traffic.notification.model.SmsLog;
import com.police.traffic.notification.repository.SmsLogRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final SmsLogRepository logRepository;

    public NotificationController(SmsLogRepository logRepository) {
        this.logRepository = logRepository;
    }

    public record SmsRequest(String phoneNumber, String message) {}

    @PostMapping("/send")
    public ResponseEntity<String> sendSms(@RequestBody SmsRequest request) {
        // Log to console (simulating real SMS gateway like Notify.lk)
        System.out.println("==================================================");
        System.out.println("SMS SENT SUCCESSFUL");
        System.out.println("TO: " + request.phoneNumber());
        System.out.println("MESSAGE: " + request.message());
        System.out.println("==================================================");

        // Save to Database
        SmsLog log = new SmsLog();
        log.setRecipientPhone(request.phoneNumber());
        log.setMessage(request.message());
        log.setStatus("SENT");
        logRepository.save(log);

        return ResponseEntity.ok("SMS sent successfully (Mocked)");
    }

    @GetMapping("/logs")
    public List<SmsLog> getLogs() {
        return logRepository.findAll();
    }
}
