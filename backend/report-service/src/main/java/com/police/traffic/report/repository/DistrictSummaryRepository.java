package com.police.traffic.report.repository;

import com.police.traffic.report.model.DistrictSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DistrictSummaryRepository extends JpaRepository<DistrictSummary, String> {
}
