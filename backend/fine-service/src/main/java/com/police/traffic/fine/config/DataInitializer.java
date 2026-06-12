package com.police.traffic.fine.config;

import com.police.traffic.fine.model.FineCategory;
import com.police.traffic.fine.repository.FineCategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final FineCategoryRepository categoryRepository;

    public DataInitializer(FineCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (categoryRepository.count() == 0) {
            List<FineCategory> categories = List.of(
                new FineCategory("V001", "Speeding Above Limit", new BigDecimal("3000.00")),
                new FineCategory("V002", "Reckless Driving", new BigDecimal("5000.00")),
                new FineCategory("V003", "Drunk Driving", new BigDecimal("10000.00")),
                new FineCategory("V004", "Driving Without License", new BigDecimal("6000.00")),
                new FineCategory("V005", "No Helmet / Seatbelt", new BigDecimal("2000.00")),
                new FineCategory("V006", "Traffic Light Violation", new BigDecimal("3000.00"))
            );
            categoryRepository.saveAll(categories);
            System.out.println("Default Sri Lanka Police traffic fine categories seeded successfully.");
        }
    }
}
