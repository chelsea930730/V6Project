package com.realestate.app.config;

import com.realestate.app.model.user.Provider;
import com.realestate.app.model.user.Role;
import com.realestate.app.model.user.User;
import com.realestate.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;

// 소셜 로그인을 성공 했을 때 로그인 정보에 대한 값을 loadUser 메서드에 받을 수 있다.
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuthUserService extends DefaultOAuth2UserService {
    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        log.info("🔵 Google OAuth2 로그인 진행");

        OAuth2User oAuth2User = super.loadUser(userRequest);
        log.info("🔵 OAuth2User Attributes: {}", oAuth2User.getAttributes());  // ✅ 디버깅 로그 추가

        // ✅ 구글에서 제공하는 이메일 정보 확인
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        log.info("🔍 가져온 사용자 정보 - 이메일: {}, 이름: {}", email, name);  // ✅ 확인용 로그 추가

        if (email == null) {
            log.error("🚨 [오류] Google OAuth2 로그인 - 이메일을 가져올 수 없습니다!");
            throw new OAuth2AuthenticationException("Google OAuth2 로그인 실패: 이메일 정보 없음");
        }

        Optional<User> findUser = userRepository.findByEmail(email);
        User user;

        if (findUser.isPresent()) {
            user = findUser.get();
        } else {
            // ✅ 새 사용자 등록
            user = User.builder()
                    .email(email)
                    .name(name)
                    .password("oauth2_user") // 소셜 로그인 사용자는 비밀번호가 필요 없음
                    .role(Role.USER)
                    .provider(Provider.GOOGLE)
                    .build();
            userRepository.save(user);
        }

        return new AuthenticatedUser(user, oAuth2User.getAttributes());
    }


}

