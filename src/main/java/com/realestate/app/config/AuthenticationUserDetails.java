package com.realestate.app.config;


import com.realestate.app.user.User;
import com.realestate.app.user.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/*
 * 1. 로그인 페이지에서 로그인 시도를 하면
 * 2. UserDetailsService 에서 로그인 시도를 가로챈다.
 * 3. loadUserByUsername 메서드를 실행한다.
 * 4. 파라미터로 받은 username 에 해당하는 유저를 찾아서 UserDetails 타입의 객체를 리턴한다.
 * */
@Slf4j
@RequiredArgsConstructor
@Service
public class AuthenticationUserDetails implements UserDetailsService {
    private final UserRepository userRepository;
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        log.info("로그인 시도: {}", email);
        User user = userRepository.findByEmail(email).orElseThrow(() ->
                new UsernameNotFoundException("사용자를 찾을 수 없습니다."));
        return new AuthenticatedUser(user);
    }
}
