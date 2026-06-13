package com.police.traffic.auth.repository;

import com.police.traffic.auth.model.PoliceOfficer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PoliceOfficerRepository extends JpaRepository<PoliceOfficer, String> {
}
