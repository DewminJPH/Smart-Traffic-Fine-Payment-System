package com.police.traffic.report.controller;

import com.police.traffic.report.model.CategorySummary;
import com.police.traffic.report.model.DistrictSummary;
import com.police.traffic.report.model.OfficerPerformance;
import com.police.traffic.report.repository.CategorySummaryRepository;
import com.police.traffic.report.repository.DistrictSummaryRepository;
import com.police.traffic.report.repository.OfficerPerformanceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {

    private final DistrictSummaryRepository districtRepository;
    private final CategorySummaryRepository categoryRepository;
    private final OfficerPerformanceRepository officerRepository;

    // Static mapping of offense names for university viva simplicity
    private static final Map<String, String> CATEGORY_NAMES = new HashMap<>();
    static {
        CATEGORY_NAMES.put("V001", "Speeding Above Limit");
        CATEGORY_NAMES.put("V002", "Reckless Driving");
        CATEGORY_NAMES.put("V003", "Drunk Driving");
        CATEGORY_NAMES.put("V004", "Driving Without License");
        CATEGORY_NAMES.put("V005", "No Helmet / Seatbelt");
        CATEGORY_NAMES.put("V006", "Traffic Light Violation");
    }

    public ReportController(DistrictSummaryRepository districtRepository,
                            CategorySummaryRepository categoryRepository,
                            OfficerPerformanceRepository officerRepository) {
        this.districtRepository = districtRepository;
        this.categoryRepository = categoryRepository;
        this.officerRepository = officerRepository;
    }

    public record FinePaidEvent(
            String referenceNumber,
            BigDecimal amount,
            String district,
            String categoryId,
            String officerId
    ) {}

    @PostMapping("/events/fine-paid")
    @Transactional
    public ResponseEntity<String> recordFinePaid(@RequestBody FinePaidEvent event) {
        // 1. Update District Summary
        DistrictSummary districtSummary = districtRepository.findById(event.district())
                .orElse(new DistrictSummary(event.district(), BigDecimal.ZERO, 0));
        districtSummary.setTotalAmount(districtSummary.getTotalAmount().add(event.amount()));
        districtSummary.setTotalFinesPaid(districtSummary.getTotalFinesPaid() + 1);
        districtRepository.save(districtSummary);

        // 2. Update Category Summary
        String catName = CATEGORY_NAMES.getOrDefault(event.categoryId(), "General Offense");
        CategorySummary categorySummary = categoryRepository.findById(event.categoryId())
                .orElse(new CategorySummary(event.categoryId(), catName, BigDecimal.ZERO, 0));
        categorySummary.setTotalAmount(categorySummary.getTotalAmount().add(event.amount()));
        categorySummary.setTotalFinesPaid(categorySummary.getTotalFinesPaid() + 1);
        categoryRepository.save(categorySummary);

        // 3. Update Officer Performance
        OfficerPerformance officerPerf = officerRepository.findById(event.officerId())
                .orElse(new OfficerPerformance(event.officerId(), 0, BigDecimal.ZERO));
        officerPerf.setFinesIssued(officerPerf.getFinesIssued() + 1);
        officerPerf.setAmountIssued(officerPerf.getAmountIssued().add(event.amount()));
        officerRepository.save(officerPerf);

        return ResponseEntity.ok("Event processed and analytics updated successfully");
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardMetrics() {
        List<DistrictSummary> districtSummaries = districtRepository.findAll();
        List<CategorySummary> categorySummaries = categoryRepository.findAll();
        List<OfficerPerformance> officerPerformances = officerRepository.findAll();

        BigDecimal totalRevenue = districtSummaries.stream()
                .map(DistrictSummary::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalFinesPaid = districtSummaries.stream()
                .mapToInt(DistrictSummary::getTotalFinesPaid)
                .sum();

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalRevenue", totalRevenue);
        metrics.put("totalFinesPaid", totalFinesPaid);
        metrics.put("districtSummaries", districtSummaries);
        metrics.put("categorySummaries", categorySummaries);
        metrics.put("officerPerformances", officerPerformances);

        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/district")
    public List<DistrictSummary> getDistrictReport() {
        return districtRepository.findAll();
    }

    @GetMapping("/category")
    public List<CategorySummary> getCategoryReport() {
        return categoryRepository.findAll();
    }

    @GetMapping("/officer-performance")
    public List<OfficerPerformance> getOfficerReport() {
        return officerRepository.findAll();
    }
}
