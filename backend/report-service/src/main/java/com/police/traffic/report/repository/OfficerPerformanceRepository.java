package com.police.traffic.report.repository;

import com.police.traffic.report.model.OfficerPerformance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OfficerPerformanceRepository extends JpaRepository<OfficerPerformance, String> {
}
