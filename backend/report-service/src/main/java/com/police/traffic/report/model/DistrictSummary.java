package com.police.traffic.report.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "district_summary")
public class DistrictSummary {

    @Id
    private String district; // e.g. Colombo, Kandy

    @Column(nullable = false)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(nullable = false)
    private Integer totalFinesPaid = 0;

    public DistrictSummary() {}

    public DistrictSummary(String district, BigDecimal totalAmount, Integer totalFinesPaid) {
        this.district = district;
        this.totalAmount = totalAmount;
        this.totalFinesPaid = totalFinesPaid;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
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
