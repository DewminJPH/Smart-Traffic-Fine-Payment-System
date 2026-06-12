package com.police.traffic.fine.controller;

import com.police.traffic.fine.model.Fine;
import com.police.traffic.fine.model.FineCategory;
import com.police.traffic.fine.repository.FineCategoryRepository;
import com.police.traffic.fine.repository.FineRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Random;

@RestController
@RequestMapping("/api/v1/fines")
public class FineController {

    private final FineRepository fineRepository;
    private final FineCategoryRepository categoryRepository;

    public FineController(FineRepository fineRepository, FineCategoryRepository categoryRepository) {
        this.fineRepository = fineRepository;
        this.categoryRepository = categoryRepository;
    }

    public record IssueFineRequest(
            String categoryId,
            String driverName,
            String driverPhone,
            String licenseNumber,
            String vehicleNumber,
            String officerId,
            String district
    ) {}

    public record StatusUpdateRequest(String status) {}

    @PostMapping
    public ResponseEntity<?> issueFine(@RequestBody IssueFineRequest req) {
        FineCategory category = categoryRepository.findById(req.categoryId())
                .orElse(null);
        if (category == null) {
            return ResponseEntity.badRequest().body("Invalid fine category ID");
        }

        // Generate fine reference number (F + 5 digits)
        String referenceNumber = "F" + (10000 + new Random().nextInt(90000));
        while (fineRepository.existsById(referenceNumber)) {
            referenceNumber = "F" + (10000 + new Random().nextInt(90000));
        }

        Fine fine = new Fine();
        fine.setReferenceNumber(referenceNumber);
        fine.setCategory(category);
        fine.setDriverName(req.driverName());
        fine.setDriverPhone(req.driverPhone());
        fine.setLicenseNumber(req.licenseNumber());
        fine.setVehicleNumber(req.vehicleNumber());
        fine.setOfficerId(req.officerId());
        fine.setDistrict(req.district());
        fine.setAmount(category.getFineAmount()); // Set amount from category to ensure consistency
        fine.setStatus("UNPAID");

        fineRepository.save(fine);
        return ResponseEntity.status(HttpStatus.CREATED).body(fine);
    }

    @GetMapping("/{reference}")
    public ResponseEntity<Fine> getFineByReference(@PathVariable String reference) {
        return fineRepository.findById(reference)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public List<Fine> searchFines(@RequestParam String licenseNumber,
                                  @RequestParam(required = false) String status) {
        if (status != null && !status.isEmpty()) {
            return fineRepository.findByLicenseNumberAndStatus(licenseNumber, status);
        }
        return fineRepository.findByLicenseNumber(licenseNumber);
    }

    @PutMapping("/{reference}/status")
    public ResponseEntity<?> updateFineStatus(@PathVariable String reference,
                                              @RequestBody StatusUpdateRequest req) {
        return fineRepository.findById(reference)
                .map(fine -> {
                    fine.setStatus(req.status());
                    fineRepository.save(fine);
                    return ResponseEntity.ok(fine);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
