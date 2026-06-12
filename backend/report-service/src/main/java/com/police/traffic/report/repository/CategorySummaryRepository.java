package com.police.traffic.report.repository;

import com.police.traffic.report.model.CategorySummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategorySummaryRepository extends JpaRepository<CategorySummary, String> {
}
