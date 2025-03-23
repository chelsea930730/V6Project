package com.realestate.app.user;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    private final UserRepository userRepository;
    @Lazy
    private final PasswordEncoder passwordEncoder;

    public User getUserByEmail(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        return user;
    }
    // 회원 가입 기능
    public void save(UserRegisterDto userRegisterDto) {
        User user = new User();
        user.setEmail(userRegisterDto.getEmail());
        user.setPassword(passwordEncoder.encode(userRegisterDto.getPassword()));
        user.setName(userRegisterDto.getName());
        user.setRole(Role.USER);
        user.setProvider(Provider.LOCAL);
        userRepository.save(user);
    }

    // 모든 사용자 반환 메서드 추가
    public List<User> getAllUsers() {
        return userRepository.findAll(); // UserRepository에서 모든 사용자 반환
    }
}

