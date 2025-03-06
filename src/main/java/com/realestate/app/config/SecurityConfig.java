package com.realestate.app.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;

//스프링 시큐리티의 전체적인 설정을 관리하는 클래스
@Configuration
@RequiredArgsConstructor
@EnableWebSecurity
public class SecurityConfig {
    private final AuthenticationFailureHandler authenticationFailureHandler;
    private final org.springframework.security.oauth2.client.userinfo.OAuth2UserService<OAuth2UserRequest, OAuth2User> OAuth2UserService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                //Cross-Site Request Forgery 보호 기능을 비활성화
                .csrf(AbstractHttpConfigurer::disable);
        http
                .authorizeHttpRequests(request -> request
                        // 인증없이 접근 할 수 있는 URL을 설정 (메인 페이지, 로그인 페이지, 회원 가입 페이지, 에러)
                        .requestMatchers("/", "/auth/login", "/auth/register", "/error").permitAll()
                        // /admin/* 경로는 ADMIN, MANAGER 권한을 가지고 있어야 접근할 수 있다.
                        .requestMatchers("/admin/*").hasAnyRole("ADMIN")
                        // 그 외 모든 경로는 인증을 받아야 접근 가능하다.
                        .anyRequest().authenticated())
                // 폼 로그인 방식을 사용
                .formLogin(formLogin -> formLogin
                        // 루트를 지정해주지 않으면 /login 이 기본값으로 설정된다.
                        // 사용자가 지정한 로그인 경로를 사용하고 싶으면 아래처럼 써주면 된다. (GET 방식)
                        .loginPage("/users/login")
                        // 로그인 아이디의 파라미터 이름을 설정. 기본 값으로 username을 사용한다.
//                        .usernameParameter("id")
                        // 로그인 패스워드의 파라미터 이름을 설정. 기본 값으로 password를 사용한다.
//                        .passwordParameter("pw")
                        // 로그인 인증을 처리하는 URL (POST 방식)
                        .loginProcessingUrl("/users/login")
                        // 로그인에 성공 했을 때 이동할 경로를 설정
                        .defaultSuccessUrl("/users/login-success")
                        // 인증에 실패했을 때 이동할 경로를 설정
//                        .failureUrl("/users/login-fail")
                        //로그인 실패 처리 핸들러
                        .failureHandler(authenticationFailureHandler)
                        .permitAll())
                //로그아웃 처리방법
                .logout(logout -> logout
                        // 로그아웃 URL 지정. 기본값은 /logout 이다.
                        .logoutUrl("/users/logout")
                        //로그아웃 성공 후 리다이렉트 될 주소
                        .logoutSuccessUrl("/")
                        //세션을 삭제
                        .invalidateHttpSession(true)
                        // 쿠키를 삭제한다.
                        .deleteCookies("JSESSIONID"))
                .oauth2Login(
                        oauth2 ->
                                oauth2.userInfoEndpoint(
                                        userInfo ->
                                                userInfo.userService(OAuth2UserService)));
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCrypt 형식을 이용해서 패스워드 암호화
        // 양방향 암호화 : 패스워드 <-> 암호화 된 패스워드
        // 단방향 암호화 : 패스워드 -> 암호화된 패스워드 (훨씬 안정적)
        // BCrypt 는 단방향 암호화 형식
        return new BCryptPasswordEncoder();
    }
}
