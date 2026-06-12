package com.police.traffic.fine.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "fine_categories")
public class FineCategory {

    @Id
    private String categoryId; // e.g. V001

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private BigDecimal fineAmount;

    public FineCategory() {}

    public FineCategory(String categoryId, String name, BigDecimal fineAmount) {
        this.categoryId = categoryId;
        this.name = name;
        this.fineAmount = fineAmount;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getFineAmount() {
        return fineAmount;
    }

    public void setFineAmount(BigDecimal fineAmount) {
        this.fineAmount = fineAmount;
    }
}
