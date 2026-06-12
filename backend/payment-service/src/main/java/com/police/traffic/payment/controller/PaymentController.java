package com.police.traffic.payment.controller;

import com.police.traffic.payment.model.Payment;
import com.police.traffic.payment.model.Transaction;
import com.police.traffic.payment.repository.PaymentRepository;
import com.police.traffic.payment.repository.TransactionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentRepository paymentRepository;
    private final TransactionRepository transactionRepository;
    private final RestTemplate restTemplate;

    public PaymentController(PaymentRepository paymentRepository,
                             TransactionRepository transactionRepository,
                             RestTemplate restTemplate) {
        this.paymentRepository = paymentRepository;
        this.transactionRepository = transactionRepository;
        this.restTemplate = restTemplate;
    }

    public record PayRequest(
            String referenceNumber,
            BigDecimal amount,
            String cardNumber,
            String expiryDate,
            String cvv,
            String paymentMethod
    ) {}

    // Simple DTO to map response from fine-service
    public record FineCategoryDto(String categoryId, String name, BigDecimal fineAmount) {}
    public record FineDto(
            String referenceNumber,
            FineCategoryDto category,
            String driverName,
            String driverPhone,
            String licenseNumber,
            String vehicleNumber,
            String officerId,
            String district,
            BigDecimal amount,
            String status
    ) {}

    @PostMapping("/pay")
    @Transactional
    public ResponseEntity<?> processPayment(@RequestBody PayRequest req) {
        // 1. Check if payment already exists
        if (paymentRepository.findByFineReferenceNumber(req.referenceNumber()).isPresent()) {
            return ResponseEntity.badRequest().body("Fine reference has already been paid or processed");
        }

        // 2. Fetch Fine details from fine-service using dynamic service routing
        FineDto fine;
        try {
            String fineServiceUrl = "http://fine-service/api/v1/fines/" + req.referenceNumber();
            fine = restTemplate.getForObject(fineServiceUrl, FineDto.class);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Fine service is currently unavailable. Please try again later.");
        }

        if (fine == null) {
            return ResponseEntity.notFound().build();
        }

        if (!"UNPAID".equals(fine.status())) {
            return ResponseEntity.badRequest().body("Fine is already marked as " + fine.status());
        }

        // Check if amount is correct
        if (fine.amount().compareTo(req.amount()) != 0) {
            return ResponseEntity.badRequest().body("Incorrect payment amount. Required: Rs. " + fine.amount());
        }

        // 3. Process mock credit card payment
        String cardNo = req.cardNumber();
        if (cardNo == null || cardNo.length() < 16) {
            return ResponseEntity.badRequest().body("Invalid card number. Must be 16 digits.");
        }

        String paymentId = "PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String transactionId = "TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();

        Payment payment = new Payment();
        payment.setPaymentId(paymentId);
        payment.setFineReferenceNumber(req.referenceNumber());
        payment.setAmountPaid(req.amount());
        payment.setPaymentMethod(req.paymentMethod());
        payment.setStatus("SUCCESS");
        paymentRepository.save(payment);

        Transaction transaction = new Transaction();
        transaction.setTransactionId(transactionId);
        transaction.setPayment(payment);
        // Mask the card number (e.g. 411122******1111)
        transaction.setCardMask(cardNo.substring(0, 6) + "******" + cardNo.substring(cardNo.length() - 4));
        transaction.setResponseCode("00"); // 00 indicates success in standard ISO 8583 banking
        transactionRepository.save(transaction);

        // 4. Update Fine status to PAID in fine-service
        try {
            String updateStatusUrl = "http://fine-service/api/v1/fines/" + req.referenceNumber() + "/status";
            restTemplate.put(updateStatusUrl, Map.of("status", "PAID"));
        } catch (Exception e) {
            // Rollback database transaction if fine status cannot be updated
            throw new RuntimeException("Failed to update fine status downstream. Rolling back transaction.", e);
        }

        // 5. Asynchronous-like triggers via RestTemplate to Notification Service
        try {
            String notificationUrl = "http://notification-service/api/v1/notifications/send";
            
            // Send to Driver
            String driverMsg = String.format("Sri Lanka Police: Payment for Fine Ref %s was successful. Amount Paid: Rs. %s. Thank you.", 
                    fine.referenceNumber(), fine.amount());
            restTemplate.postForObject(notificationUrl, Map.of("phoneNumber", fine.driverPhone(), "message", driverMsg), String.class);

            // Send to Officer
            String officerMsg = String.format("Sri Lanka Police Alert: Fine Ref %s has been PAID. License for driver %s (%s) can be released.",
                    fine.referenceNumber(), fine.driverName(), fine.licenseNumber());
            // In a real system, we would retrieve officer phone number. Let's mock a fixed contact or use the driver's for simplicity.
            restTemplate.postForObject(notificationUrl, Map.of("phoneNumber", "0777999888", "message", officerMsg), String.class);
            
        } catch (Exception e) {
            System.err.println("Notification alert failed: " + e.getMessage());
            // Non-blocking: payment is completed, we don't roll back for notification failure
        }

        // 6. Asynchronous-like trigger to Report Service to log analytical events
        try {
            String reportUrl = "http://report-service/api/v1/reports/events/fine-paid";
            Map<String, Object> eventData = Map.of(
                    "referenceNumber", fine.referenceNumber(),
                    "amount", fine.amount(),
                    "district", fine.district(),
                    "categoryId", fine.category().categoryId(),
                    "officerId", fine.officerId()
            );
            restTemplate.postForObject(reportUrl, eventData, String.class);
        } catch (Exception e) {
            System.err.println("Reporting logging failed: " + e.getMessage());
            // Non-blocking
        }

        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "paymentId", paymentId,
                "transactionId", transactionId,
                "fineReference", req.referenceNumber(),
                "amount", req.amount()
        ));
    }

    @GetMapping("/history")
    public List<Payment> getPaymentHistory() {
        return paymentRepository.findAll();
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable String paymentId) {
        return paymentRepository.findById(paymentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
