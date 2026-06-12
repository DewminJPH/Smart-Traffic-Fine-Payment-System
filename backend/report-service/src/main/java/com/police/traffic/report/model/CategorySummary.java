package com.police.traffic.report.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "category_summary")
public class CategorySummary {

    @Id
    private String categoryId; // e.g. V001

    @Column(nullable = false)
    private String categoryName;

    @Column(nullable = false)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(nullable = false)
    private Integer totalFinesPaid = 0;

    public CategorySummary() {}

    public CategorySummary(String categoryId, String categoryName, BigDecimal totalAmount, Integer totalFinesPaid) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.totalAmount = totalAmount;
        this.totalFinesPaid = totalFinesPaid;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public Integer getTotalFinesPaid() {
        return totalFinesPaid;
    }

    public void setTotalFinesPaid(Integer totalFinesPaid) {
        this.totalFinesPaid = totalFinesPaid;
    }
}
