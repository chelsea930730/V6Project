package com.realestate.app.config;

import com.realestate.app.user.Provider;
import com.realestate.app.user.Role;
import com.realestate.app.user.User;
import com.realestate.app.user.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.Map;
import java.util.Optional;

// 소셜 로그인을 성공 했을 때 로그인 정보에 대한 값을 loadUser 메서드에 받을 수 있다.
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuthUserService extends DefaultOAuth2UserService {
    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        log.info("🔵 Google OAuth2 로그인 시작");

        OAuth2User oAuth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = oAuth2User.getAttributes();

        log.info("🔵 OAuth2User 속성: {}", attributes);

        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");

        log.info("🔍 추출된 정보 - 이메일: {}, 이름: {}", email, name);

        if (email == null) {
            log.error("🚨 [오류] 이메일을 가져올 수 없습니다");
            throw new OAuth2AuthenticationException(new OAuth2Error("invalid_email"), "OAuth2 로그인 실패: 이메일 정보 없음");
        }

        try {
            Optional<User> findUser = userRepository.findByEmail(email);
            User user;

            if (findUser.isPresent()) {
                user = findUser.get();
                log.info("✅ 기존 사용자 로그인: {} (ID: {})", email, user.getUserId());

                // 기존 사용자 정보 업데이트
                if (user.getProvider() == Provider.LOCAL) {
                    user.setProvider(Provider.GOOGLE);
                    userRepository.save(user);
                    log.info("🔄 로컬 사용자를 OAuth2 사용자로 업데이트: {}", email);
                }
            } else {
                // 새 사용자 등록
                user = User.builder()
                        .email(email)
                        .name(name)
                        .password("oauth2_user")
                        .role(Role.USER)
                        .provider(Provider.GOOGLE)
                        .build();

                user = userRepository.save(user);
                log.info("✅ 새 사용자 등록 완료 - ID: {}, 이메일: {}", user.getUserId(), email);
            }

            return new AuthenticatedUser(user, attributes);
        } catch (Exception e) {
            log.error("🚨 사용자 저장 중 오류 발생: {}", e.getMessage(), e);
            // OAuth2Error 객체를 생성하여 예외 처리
            OAuth2Error oauth2Error = new OAuth2Error(
                "user_save_error",
                "사용자 저장 중 오류: " + e.getMessage(),
                null
            );
            throw new OAuth2AuthenticationException(oauth2Error, e);
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public User saveOrUpdateUser(String email, String name) {
        log.info("🔄 사용자 저장 시작: {}", email);

        try {
            Optional<User> existingUser = userRepository.findByEmail(email);

            if (existingUser.isPresent()) {
                User user = existingUser.get();
                user.setName(name);
                user.setProvider(Provider.GOOGLE);

                // 엔티티 매니저 직접 사용
                entityManager.merge(user);
                entityManager.flush();

                log.info("✅ 사용자 업데이트 완료: ID = {}", user.getUserId());
                return user;
            } else {
                User newUser = User.builder()
                        .email(email)
                        .name(name)
                        .password("google_oauth")
                        .role(Role.USER)
                        .provider(Provider.GOOGLE)
                        .build();

                // 엔티티 매니저 직접 사용
                entityManager.persist(newUser);
                entityManager.flush();

                log.info("✅ 새 사용자 저장 완료: ID = {}", newUser.getUserId());
                return newUser;
            }
        } catch (Exception e) {
            log.error("❌ 사용자 저장 중 오류 발생", e);
            throw e;
        }
    }
}

