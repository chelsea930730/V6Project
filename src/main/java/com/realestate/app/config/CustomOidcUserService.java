package com.realestate.app.config;

import com.realestate.app.user.Provider;
import com.realestate.app.user.Role;
import com.realestate.app.user.User;
import com.realestate.app.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOidcUserService extends OidcUserService {
    private final UserRepository userRepository;

    @Override
    @Transactional
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        log.info("🔵 Google OIDC 로그인 시작");
        
        // 기본 OidcUserService의 loadUser 메서드 호출하여 기본 OidcUser 객체 얻기
        OidcUser oidcUser = super.loadUser(userRequest);
        
        // OidcUser에서 속성 정보 가져오기
        Map<String, Object> attributes = oidcUser.getAttributes();
        log.info("🔵 OidcUser 속성: {}", attributes);
        
        // 필요한 정보 추출
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        
        log.info("🔍 추출된 정보 - 이메일: {}, 이름: {}", email, name);
        
        if (email == null) {
            log.error("🚨 이메일을 가져올 수 없습니다");
            throw new OAuth2AuthenticationException("이메일 정보가 없습니다");
        }
        
        // DB에서 사용자 조회 또는 새로 생성
        User user = processUser(email, name);
        
        // AuthenticatedUser 반환 (OidcUser 인터페이스 구현)
        return new AuthenticatedUser(user, attributes, oidcUser.getIdToken(), oidcUser.getUserInfo());
    }
    
    @Transactional
    private User processUser(String email, String name) {
        try {
            Optional<User> existingUser = userRepository.findByEmail(email);
            
            if (existingUser.isPresent()) {
                User user = existingUser.get();
                log.info("✅ 기존 사용자 로그인: {} (ID: {})", email, user.getUserId());
                
                // 기존 사용자 정보 업데이트
                if (user.getProvider() == Provider.LOCAL) {
                    user.setProvider(Provider.GOOGLE);
                    userRepository.save(user);
                    log.info("🔄 로컬 사용자를 OAuth2 사용자로 업데이트: {}", email);
                }
                
                // 마지막 로그인 시간 업데이트
                user.setLastLoginTime(LocalDateTime.now());
                userRepository.save(user);
                
                return user;
            } else {
                // 새 사용자 등록
                User newUser = User.builder()
                        .email(email)
                        .name(name != null ? name : "사용자")
                        .password("oidc_user")
                        .role(Role.USER)
                        .provider(Provider.GOOGLE)
                        .createdAt(LocalDateTime.now())
                        .lastLoginTime(LocalDateTime.now())
                        .build();
                
                User savedUser = userRepository.save(newUser);
                log.info("✅ 새 사용자 등록 완료 - ID: {}, 이메일: {}", savedUser.getUserId(), email);
                return savedUser;
            }
        } catch (Exception e) {
            log.error("🚨 사용자 처리 중 오류 발생: {}", e.getMessage(), e);
            throw new OAuth2AuthenticationException("사용자 정보 처리 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
}