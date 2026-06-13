package com.police.traffic.auth.config;

import com.police.traffic.auth.model.Role;
import com.police.traffic.auth.model.User;
import com.police.traffic.auth.repository.RoleRepository;
import com.police.traffic.auth.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(RoleRepository roleRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. Create ADMIN role if not exists
        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseGet(() -> roleRepository.save(new Role("ADMIN")));

        // 2. Create OFFICER role if not exists
        roleRepository.findByName("OFFICER")
                .orElseGet(() -> roleRepository.save(new Role("OFFICER")));

        // 3. Create default admin if not exists
        if (!userRepository.existsById("admin")) {
            User adminUser = new User();
            adminUser.setId("admin");
            adminUser.setPassword(passwordEncoder.encode("admin123"));
            adminUser.setRole(adminRole);
            userRepository.save(adminUser);
            System.out.println("Default administrator created: username=admin, password=admin123");
        }
    }
}
