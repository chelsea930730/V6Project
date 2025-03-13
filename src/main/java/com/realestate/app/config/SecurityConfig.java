package com.realestate.app.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;

import com.realestate.app.config.CustomAuthenticationProvider;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;

@Configuration
@RequiredArgsConstructor
@EnableWebSecurity
public class SecurityConfig {
    private final CustomOAuthUserService customOAuthUserService;
    private final AuthenticationFailureHandler authenticationFailureHandler;
    private final org.springframework.security.oauth2.client.userinfo.OAuth2UserService<OAuth2UserRequest, OAuth2User> OAuth2UserService;
    private final AuthenticationUserDetails userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/user/login", "/user/register", "/user/status", "/error").permitAll()
                        .requestMatchers("/css/**", "/js/**", "/img/**", "/static/**", "/navi.html").permitAll()
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .requestMatchers("/oauth2/**").permitAll()
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form
                        .loginPage("/user/login") // ✅ 로그인 페이지 설정
                        .loginProcessingUrl("/user/login") // ✅ 로그인 요청 URL
                        .usernameParameter("email") // ✅ 폼에서 전달할 파라미터 이름
                        .passwordParameter("password") // ✅ 폼에서 전달할 비밀번호 파라미터 이름
                        .defaultSuccessUrl("/", true) // ✅ 로그인 성공 시 이동할 페이지
                        .failureUrl("/user/login?error=true") // ✅ 로그인 실패 시 이동할 페이지
                        .permitAll()
                )
                .oauth2Login(oauth2 -> oauth2
                        .loginPage("/user/login") // ✅ 로그인 페이지 설정
                        .defaultSuccessUrl("/", true) // ✅ 로그인 성공 시 이동할 페이지
                        .userInfoEndpoint(userInfo -> userInfo.userService(customOAuthUserService)) // ✅ Custom OAuth2UserService 등록
                )
                .logout(logout -> logout
                        .logoutUrl("/user/logout")
                        .logoutSuccessUrl("/")
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID")
                );

        return http.authenticationProvider(customAuthenticationProvider()).build(); // ✅ CustomAuthenticationProvider 사용
    }


    // ✅ PasswordEncoder를 반드시 @Bean으로 등록해야 함
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ✅ CustomAuthenticationProvider를 @Bean으로 등록
    @Bean
    public AuthenticationProvider customAuthenticationProvider() {
        return new CustomAuthenticationProvider(userDetailsService, passwordEncoder());
    }
}



