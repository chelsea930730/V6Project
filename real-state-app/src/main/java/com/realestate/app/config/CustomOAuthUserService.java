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
@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuthUserService extends DefaultOAuth2UserService {
    private final UserRepository userRepository;
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        log.info("loadUser 메서드 실행");
        log.info("userRequest: {}", userRequest);
        log.info("ClientRegistration: {}", userRequest.getClientRegistration());
        log.info("AccessToken: {}", userRequest.getAccessToken());
        OAuth2User oAuth2User = super.loadUser(userRequest);

        log.info("oAuth2User: {}", oAuth2User);
        log.info("oAuth2User.getAttributes(): {}", oAuth2User.getAttributes());

        // 소셜 로그인 절차
        // 1. 서비스에 처음 로그인 하는 사용자
        // -> 자동으로 회원 가입을 시킨다
        // username은 이메일을 사용, 패스워드는 임의의 값(1234)로 넣는다. 어차피 폼데이터로 로그인하지 않기 때문에 비밀번호는 아무거나 넣어도 상관없음.

        // 2. 이전에 로그인 한 적이 있는 사용자
        // -> 이미 회원 가입이 되어 있기 때문에, 회원 DB에서 검색한다.
        String email = "";
        String name = "";
        String provider = ""; //어떤 서비스(ex:구글)를 통해 소셜 로그인을 시도했는가?
        User user = null;
        Optional<User> findUser = userRepository.findByEmail(email);
        if (findUser.isPresent()) {
            //이미 존재하는 회원
            user = findUser.get();
        }else{
            //존재하지 않으면 회원가입을 진행
            email = oAuth2User.getAttribute("email");
            name = oAuth2User.getAttribute("name");
            provider = userRequest.getClientRegistration().getRegistrationId();
            user = new User();
            user.setEmail(email);
            user.setPassword("1234");
            user.setName(name);
            user.setRole(Role.USER);
            user.setProvider(Provider.GOOGLE);

            userRepository.save(user);
        }

        return new AuthenticatedUser(user,oAuth2User.getAttributes());
    }
}
