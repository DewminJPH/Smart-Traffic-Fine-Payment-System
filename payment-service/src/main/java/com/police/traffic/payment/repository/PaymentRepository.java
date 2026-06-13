package com.police.traffic.payment.repository;

import com.police.traffic.payment.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {
    Optional<Payment> findByFineReferenceNumber(String fineReferenceNumber);
}
