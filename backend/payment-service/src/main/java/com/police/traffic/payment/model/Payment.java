package com.police.traffic.payment.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    private String paymentId; // Unique payment ID (UUID or custom string)

    @Column(nullable = false, unique = true)
    private String fineReferenceNumber; // Logical reference to fine_db.fines

    @Column(nullable = false)
    private BigDecimal amountPaid;

    @Column(nullable = false)
    private String paymentMethod; // CARD, MOBILE_WALLET

    @Column(nullable = false)
    private LocalDateTime paidAt = LocalDateTime.now();

    @Column(nullable = false)
    private String status; // SUCCESS, FAILED

    public Payment() {}

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public String getFineReferenceNumber() {
        return fineReferenceNumber;
    }

    public void setFineReferenceNumber(String fineReferenceNumber) {
        this.fineReferenceNumber = fineReferenceNumber;
    }

    public BigDecimal getAmountPaid() {
        return amountPaid;
    }

    public void setAmountPaid(BigDecimal amountPaid) {
        this.amountPaid = amountPaid;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
