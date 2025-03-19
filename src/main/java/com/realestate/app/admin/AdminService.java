package com.realestate.app.admin;

import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.realestate.app.user.Provider;
import com.realestate.app.user.Role;
import com.realestate.app.user.User;
import com.realestate.app.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminService {
    private final UserRepository userRepository;
    @Lazy
    private final PasswordEncoder passwordEncoder;

    public void initializeAdminAccount() {
        // 이미 관리자 계정이 존재하는지 확인
        if (userRepository.findByEmail("admin@realestate.com").isPresent()) {
            return;
        }

        User adminUser = User.builder()
                .email("admin@realestate.com")
                .password(passwordEncoder.encode("admin123!@#"))
                .name("관리자")
                .role(Role.ADMIN)
                .provider(Provider.LOCAL)
                .build();
        
        userRepository.save(adminUser);
    }
}
