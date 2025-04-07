package com.realestate.app.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
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

    /**
     * 사용자 정보를 업데이트합니다.
     */
    @Transactional
    public void updateUser(User user) {
        userRepository.save(user);
    }

    /**
     * 이메일로 사용자를 찾습니다.
     */
    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    /**
     * 이메일로 사용자를 찾고, 없으면 새로 생성합니다 (OAuth2 로그인용)
     */
    @Transactional
    public User saveOrFindByEmail(String email, String name, String subject) {
        log.info("🔍 이메일 '{}' 사용자 조회/생성 시작", email);

        try {
            Optional<User> existingUser = userRepository.findByEmail(email);

            if (existingUser.isPresent()) {
                User user = existingUser.get();
                log.info("✅ 기존 사용자 발견: ID={}, 이름={}, 제공자={}", user.getUserId(), user.getName(), user.getProvider());
                return user;
            } else {
                log.info("🆕 새 사용자 생성 시작: 이메일={}, 이름={}", email, name);

                // 사용자 정보가 없으면 새로 생성
                User newUser = User.builder()
                        .email(email)
                        .name(name != null ? name : "사용자") // 이름이 없으면 기본값 설정
                        .password("oauth2_" + subject) // OAuth2 사용자용 비밀번호
                        .role(Role.USER) // 기본 권한
                        .provider(Provider.GOOGLE) // 기본 제공자
                        .createdAt(LocalDateTime.now())
                        .lastLoginTime(LocalDateTime.now())
                        .build();

                try {
                    User savedUser = userRepository.save(newUser);
                    log.info("✅ 새 사용자 저장 완료: ID={}, 이메일={}", savedUser.getUserId(), email);
                    return savedUser;
                } catch (Exception e) {
                    log.error("❌ 새 사용자 저장 중 오류: {}", e.getMessage(), e);
                    throw e;
                }
            }
        } catch (Exception e) {
            log.error("❌ saveOrFindByEmail 실행 중 오류: {}", e.getMessage(), e);
            throw e;
        }
    }
}