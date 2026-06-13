package com.police.traffic.fine.controller;

import com.police.traffic.fine.model.FineCategory;
import com.police.traffic.fine.repository.FineCategoryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {

    private final FineCategoryRepository categoryRepository;

    public CategoryController(FineCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public List<FineCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody FineCategory category) {
        if (categoryRepository.existsById(category.getCategoryId())) {
            return ResponseEntity.badRequest().body("Category ID already exists");
        }
        FineCategory saved = categoryRepository.save(category);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FineCategory> updateCategory(@PathVariable String id, @RequestBody FineCategory updatedDetails) {
        return categoryRepository.findById(id)
                .map(category -> {
                    category.setName(updatedDetails.getName());
                    category.setFineAmount(updatedDetails.getFineAmount());
                    FineCategory saved = categoryRepository.save(category);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable String id) {
        if (categoryRepository.existsById(id)) {
            categoryRepository.deleteById(id);
            return ResponseEntity.ok("Category deleted successfully");
        }
        return ResponseEntity.notFound().build();
    }
}
