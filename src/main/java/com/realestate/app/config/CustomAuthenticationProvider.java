package com.realestate.app.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;


@RequiredArgsConstructor
@Slf4j
public class CustomAuthenticationProvider implements AuthenticationProvider {
    private final AuthenticationUserDetails userDetailsService;
    private final PasswordEncoder passwordEncoder; // ✅ 주입 받을 수 있도록 설정

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String email = authentication.getName();
        String password = authentication.getCredentials().toString();

        log.info("🟢 [로그인 시도] 이메일: {}", email);

        // ✅ 유저 정보 조회
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);

        if (userDetails == null) {
            log.error("❌ [로그인 실패] 이메일 '{}' 을(를) 찾을 수 없습니다.", email);
            throw new BadCredentialsException("이메일 또는 비밀번호가 잘못되었습니다.");
        }

        // ✅ 비밀번호 검증
        if (!passwordEncoder.matches(password, userDetails.getPassword())) {
            log.error("❌ [로그인 실패] 이메일 '{}' 비밀번호 불일치", email);
            throw new BadCredentialsException("이메일 또는 비밀번호가 잘못되었습니다.");
        }

        log.info("✅ [로그인 성공] 이메일: {}", email);
        return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return authentication.equals(UsernamePasswordAuthenticationToken.class);
    }
}


