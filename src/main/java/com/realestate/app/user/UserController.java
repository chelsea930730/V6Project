package com.realestate.app.user;

import com.realestate.app.config.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Slf4j
@RequestMapping("/user")
@RequiredArgsConstructor
@Controller
public class UserController {
    private final UserService userService;

    //회원가입 페이지을 요청하는 메서드
    @GetMapping("register")
    public String register(Model model) {
        model.addAttribute("userRegisterDto", new UserRegisterDto());
        return "/user/register";
    }
    @PostMapping("register")
    public String register(@ModelAttribute UserRegisterDto userRegisterDto) {
        log.info("userRegisterDto: {}", userRegisterDto);
        userService.save(userRegisterDto);
        return "redirect:/";
    }

    //로그인 페이지를 요청하는 메서드
    @GetMapping("login")
    public String login(Model model,
                        @RequestParam(name = "loginErrorMessage", required = false) String errorMessage) {
        log.info("🔍 [로그인 페이지] 에러 메시지: {}", errorMessage);

        if (errorMessage != null) {
            model.addAttribute("loginErrorMessage", errorMessage);
        } else {
            model.addAttribute("loginErrorMessage", "");
        }

        // ✅ 일반 로그인 시 loginDto 추가
        model.addAttribute("userLoginDto", new UserLoginDto());

        return "/user/login";
    }

    @GetMapping("/index")
    @ResponseBody
    public Map<String, Object> checkLoginStatus() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        log.info("🔍 현재 로그인 상태: {}", authentication);

        Map<String, Object> response = new HashMap<>();
        boolean isLoggedIn = authentication != null && authentication.isAuthenticated() &&
                !(authentication instanceof AnonymousAuthenticationToken);

        response.put("isLoggedIn", isLoggedIn);

        if (isLoggedIn) {
            Object principal = authentication.getPrincipal();
            String principalType = principal.getClass().getName();
            log.info("🔍 principal 객체 타입: {}", principalType);
            log.info("🔍 principal 객체: {}", principal);

            try {
                // AuthenticatedUser 타입 처리 (우리 서비스의 커스텀 사용자 클래스)
                if (principal instanceof AuthenticatedUser) {
                    AuthenticatedUser user = (AuthenticatedUser) principal;
                    response.put("email", user.getUsername());
                    response.put("name", user.getName());

                    // 사용자 역할 정보 추가
                    response.put("role", user.getUser().getRole().name());
                    log.info("🔍 사용자 역할: {}", user.getUser().getRole().name());

                    response.put("loginType", user.isOAuth2User() ? "oauth2" : "form");
                }
                // OAuth2User 타입 처리 (OAuth2 로그인 사용자)
                else if (principal instanceof OAuth2User) {
                    OAuth2User oauth2User = (OAuth2User) principal;
                    Map<String, Object> attrs = oauth2User.getAttributes();

                    log.info("🔍 OAuth2User 속성: {}", attrs);
                    response.put("loginType", "oauth2");
                    response.put("email", attrs.get("email"));
                    response.put("name", attrs.get("name"));
                    response.put("username", oauth2User.getName());

                    if (authentication instanceof OAuth2AuthenticationToken) {
                        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
                        response.put("provider", oauthToken.getAuthorizedClientRegistrationId());
                        log.info("🔍 OAuth 제공자: {}", oauthToken.getAuthorizedClientRegistrationId());
                    }

                    // DB에서 이메일로 사용자 정보 조회 시도
                    String email = (String) attrs.get("email");
                    if (email != null) {
                        try {
                            // 구글 로그인으로 갓 가입한 사용자의 경우, DB에 정보가 없을 수 있음
                            // findByEmail 대신 saveOrFindByEmail 메서드 호출
                            User user = userService.saveOrFindByEmail(email, (String) attrs.get("name"), oauth2User.getName());

                            if (user != null) {
                                response.put("role", user.getRole().name());
                                response.put("userId", user.getUserId());
                                log.info("🔍 DB에서 조회한 사용자 정보 - ID: {}, 역할: {}, 제공자: {}",
                                        user.getUserId(), user.getRole().name(), user.getProvider());

                                // 마지막 로그인 시간 업데이트
                                user.setLastLoginTime(LocalDateTime.now());
                                userService.updateUser(user);
                                log.info("✅ 사용자 마지막 로그인 시간 업데이트: {}", user.getLastLoginTime());
                            } else {
                                log.error("❌ 이메일 {}로 사용자를 찾거나 생성할 수 없습니다.", email);
                                response.put("error", "사용자 정보를 찾거나 생성할 수 없습니다.");
                            }
                        } catch (Exception e) {
                            log.error("🚨 DB에서 사용자 정보 조회/생성 실패: {}", e.getMessage(), e);
                            response.put("error", "사용자 정보 처리 중 오류가 발생했습니다.");
                        }
                    }
                }
                // OidcUser 타입 처리 (OpenID Connect 사용자)
                else if (principal instanceof OidcUser) {
                    OidcUser oidcUser = (OidcUser) principal;
                    Map<String, Object> attrs = oidcUser.getAttributes();

                    log.info("🔍 OidcUser 속성: {}", attrs);
                    response.put("loginType", "oidc");
                    response.put("email", attrs.get("email"));
                    response.put("name", attrs.get("name"));
                    response.put("username", oidcUser.getName());

                    // 이메일로 사용자 정보 조회
                    String email = (String) attrs.get("email");
                    if (email != null) {
                        try {
                            User user = userService.saveOrFindByEmail(email, (String) attrs.get("name"), oidcUser.getName());
                            if (user != null) {
                                response.put("role", user.getRole().name());
                                response.put("userId", user.getUserId());

                                // 마지막 로그인 시간 업데이트
                                user.setLastLoginTime(LocalDateTime.now());
                                userService.updateUser(user);
                            }
                        } catch (Exception e) {
                            log.error("🚨 OIDC 사용자 정보 처리 중 오류: {}", e.getMessage(), e);
                        }
                    }
                } else {
                    // 기타 인증 방식
                    response.put("username", authentication.getName());
                    response.put("loginType", "other");
                    response.put("principalType", principalType);
                }
            } catch (Exception e) {
                log.error("🚨 사용자 정보 처리 중 오류: {}", e.getMessage(), e);
                response.put("error", "사용자 정보를 처리하는 도중 오류가 발생했습니다.");
            }
        }

        log.info("🔍 응답 데이터: {}", response);
        return response;
    }

    @GetMapping("/api/users")
    @ResponseBody
    public List<User> getAllUsers() {
        return userService.getAllUsers(); // 모든 사용자 반환
    }
}