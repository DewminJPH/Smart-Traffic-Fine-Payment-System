package com.police.traffic.auth.controller;

import com.police.traffic.auth.model.PoliceOfficer;
import com.police.traffic.auth.model.Role;
import com.police.traffic.auth.model.User;
import com.police.traffic.auth.repository.PoliceOfficerRepository;
import com.police.traffic.auth.repository.RoleRepository;
import com.police.traffic.auth.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/officers")
public class AdminController {

    private final UserRepository userRepository;
    private final PoliceOfficerRepository officerRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminController(UserRepository userRepository, PoliceOfficerRepository officerRepository,
                           RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.officerRepository = officerRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public record RegisterOfficerRequest(
            String username,
            String firstName,
            String lastName,
            String badgeNumber,
            String phoneNumber,
            String district
    ) {}

    @PostMapping
    @Transactional
    public ResponseEntity<?> registerOfficer(@RequestBody RegisterOfficerRequest req) {
        if (userRepository.existsById(req.username())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        Role officerRole = roleRepository.findByName("OFFICER")
                .orElseThrow(() -> new RuntimeException("Role OFFICER not found"));

        // Create user credentials. Default password is username + "123"
        String defaultPassword = req.username() + "123";
        User user = new User(req.username(), passwordEncoder.encode(defaultPassword), officerRole);
        userRepository.save(user);

        // Create police officer details
        PoliceOfficer officer = new PoliceOfficer();
        officer.setOfficerId(req.username());
        officer.setFirstName(req.firstName());
        officer.setLastName(req.lastName());
        officer.setBadgeNumber(req.badgeNumber());
        officer.setPhoneNumber(req.phoneNumber());
        officer.setDistrict(req.district());
        officer.setStatus("ACTIVE");
        officerRepository.save(officer);

        return ResponseEntity.status(HttpStatus.CREATED).body(officer);
    }

    @GetMapping
    public List<PoliceOfficer> getAllOfficers() {
        return officerRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PoliceOfficer> getOfficerById(@PathVariable String id) {
        return officerRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateOfficer(@PathVariable String id, @RequestBody PoliceOfficer updatedDetails) {
        return officerRepository.findById(id)
                .map(officer -> {
                    officer.setFirstName(updatedDetails.getFirstName());
                    officer.setLastName(updatedDetails.getLastName());
                    officer.setPhoneNumber(updatedDetails.getPhoneNumber());
                    officer.setDistrict(updatedDetails.getDistrict());
                    officer.setStatus(updatedDetails.getStatus());
                    officerRepository.save(officer);
                    return ResponseEntity.ok(officer);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteOfficer(@PathVariable String id) {
        if (officerRepository.existsById(id)) {
            officerRepository.deleteById(id);
            userRepository.deleteById(id);
            return ResponseEntity.ok().body("Officer profile deleted successfully");
        }
        return ResponseEntity.notFound().build();
    }
}
