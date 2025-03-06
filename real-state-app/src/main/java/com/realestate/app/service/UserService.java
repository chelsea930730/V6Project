package com.realestate.app.service;

import com.realestate.app.model.user.UserRegisterDto;
import com.realestate.app.model.user.User;
import com.realestate.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    private final UserRepository userRepository;
    // 회원 가입 기능
    public void save(UserRegisterDto userRegisterDto) {
        User user = new User();
        user.setEmail(userRegisterDto.getEmail());
        user.setPassword(userRegisterDto.getPassword());
        user.setName(userRegisterDto.getName());
        userRepository.save(user);
    }
}
