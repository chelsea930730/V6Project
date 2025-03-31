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
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

import com.realestate.app.config.CustomAuthenticationProvider;
import com.realestate.app.user.Role;

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
    public AuthenticationSuccessHandler authenticationSuccessHandler() {
        return new SimpleUrlAuthenticationSuccessHandler() {
            @Override
            public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                                Authentication authentication) throws IOException, ServletException {
                var authorities = authentication.getAuthorities();
                boolean isAdmin = authorities.stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

                if (isAdmin) {
                    getRedirectStrategy().sendRedirect(request, response, "/admin/dashboard");
                } else {
                    getRedirectStrategy().sendRedirect(request, response, "/");
                }
            }
        };
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .headers(headers -> headers
                        .frameOptions(frame -> frame.sameOrigin())
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/user/login", "/user/register", "/error","/property/**",
                                "/css/**", "/js/**", "/img/**", "/static/**", "/navi.html",
                                "/webjars/**", "/fonts/**", "/images/**", "/uploads/**").permitAll()
                        .requestMatchers("/admin/dashboard", "/admin/addproperty", "/admin/create", "/admin/create/**", "/admin/consulting").hasRole("ADMIN")
                        .requestMatchers("/oauth2/**").permitAll()
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form
                        .loginPage("/user/login")
                        .loginProcessingUrl("/user/login")
                        .usernameParameter("email")
                        .passwordParameter("password")
                        .successHandler(authenticationSuccessHandler())
                        .failureUrl("/user/login?error=true")
                        .permitAll()
                )
                .oauth2Login(oauth2 -> oauth2
                        .loginPage("/user/login")
                        .successHandler(authenticationSuccessHandler())
                        .userInfoEndpoint(userInfo -> userInfo.userService(customOAuthUserService))
                )
                .logout(logout -> logout
                        .logoutUrl("/user/logout")
                        .logoutSuccessUrl("/")
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID")
                );

        return http.authenticationProvider(customAuthenticationProvider()).build();
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



