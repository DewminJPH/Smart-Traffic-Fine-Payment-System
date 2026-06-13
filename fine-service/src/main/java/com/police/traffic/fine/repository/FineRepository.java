package com.police.traffic.fine.repository;

import com.police.traffic.fine.model.Fine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FineRepository extends JpaRepository<Fine, String> {
    List<Fine> findByLicenseNumber(String licenseNumber);
    List<Fine> findByLicenseNumberAndStatus(String licenseNumber, String status);
}
