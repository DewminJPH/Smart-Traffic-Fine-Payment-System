package com.police.traffic.fine.repository;

import com.police.traffic.fine.model.FineCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FineCategoryRepository extends JpaRepository<FineCategory, String> {
}
