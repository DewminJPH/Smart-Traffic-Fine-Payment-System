package com.police.traffic.report.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "officer_performance")
public class OfficerPerformance {

    @Id
    private String officerId; // References auth user ID (logical reference)

    @Column(nullable = false)
    private Integer finesIssued = 0;

    @Column(nullable = false)
    private BigDecimal amountIssued = BigDecimal.ZERO;

    public OfficerPerformance() {}

    public OfficerPerformance(String officerId, Integer finesIssued, BigDecimal amountIssued) {
        this.officerId = officerId;
        this.finesIssued = finesIssued;
        this.amountIssued = amountIssued;
    }

    public String getOfficerId() {
        return officerId;
    }

    public void setOfficerId(String officerId) {
        this.officerId = officerId;
    }

    public Integer getFinesIssued() {
        return finesIssued;
    }

    public void setFinesIssued(Integer finesIssued) {
        this.finesIssued = finesIssued;
    }

    public BigDecimal getAmountIssued() {
        return amountIssued;
    }

    public void setAmountIssued(BigDecimal amountIssued) {
        this.amountIssued = amountIssued;
    }
}
