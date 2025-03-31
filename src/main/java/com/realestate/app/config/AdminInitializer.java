package com.realestate.app.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.realestate.app.admin.AdminService;
import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class AdminInitializer {
    
    private final AdminService adminService;

    @Bean
    public CommandLineRunner initializeAdmin() {
        return args -> {
            adminService.initializeAdminAccount();
        };
    }
} 