package com.realestate.app.user;

import com.realestate.app.config.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.*;

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
        response.put("isLoggedIn", authentication != null && authentication.isAuthenticated() && 
                                   !(authentication instanceof AnonymousAuthenticationToken));
        
        if (authentication != null && authentication.isAuthenticated() && 
            !(authentication instanceof AnonymousAuthenticationToken)) {
            
            Object principal = authentication.getPrincipal();
            log.info("🔍 principal 객체: {}", principal);
            
            try {
                if (principal instanceof AuthenticatedUser) {
                    AuthenticatedUser user = (AuthenticatedUser) principal;
                    response.put("email", user.getUsername());
                    response.put("name", user.getName());
                    
                    // 사용자 역할 정보 추가
                    response.put("role", user.getUser().getRole().name());
                    log.info("🔍 사용자 역할: {}", user.getUser().getRole().name());
                    
                    if (user.isOAuth2User()) {
                        response.put("loginType", "oauth2");
                    } else {
                        response.put("loginType", "form");
                    }
                } else {
                    // 기타 인증 방식
                    response.put("username", authentication.getName());
                    response.put("loginType", "other");
                }
            } catch (Exception e) {
                log.error("사용자 정보 처리 중 오류: {}", e.getMessage());
                response.put("error", "사용자 정보를 처리하는 도중 오류가 발생했습니다.");
            }
        }
        
        return response;
    }
    @GetMapping("/api/users")
    @ResponseBody
    public List<User> getAllUsers() {
        return userService.getAllUsers(); // 모든 사용자 반환
    }
    @GetMapping("/api/users")
    @ResponseBody
    public List<User> getAllUsers() {
        return userService.getAllUsers(); // 모든 사용자 반환
    }


}
