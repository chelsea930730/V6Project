package com.realestate.app.user;

import com.realestate.app.config.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
    public ResponseEntity<Map<String, Object>> checkLoginStatus() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();  // ✅ 인증 정보 가져오기
        log.info("🔍 현재 로그인 상태: {}", authentication);

        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            log.info("🔍 principal 객체: {}", principal);

            if (principal instanceof AuthenticatedUser) {
                AuthenticatedUser user = (AuthenticatedUser) principal;
                log.info("✅ 로그인 유저 확인: {}", user.getUsername());

                return ResponseEntity.ok(Map.of(
                        "isLoggedIn", true,
                        "email", user.getUsername(),
                        "name", user.getName()
                ));
            }
        }
        return ResponseEntity.ok(Map.of("isLoggedIn", false));
    }
    @GetMapping("/api/users")
    @ResponseBody
    public List<User> getAllUsers() {
        return userService.getAllUsers(); // 모든 사용자 반환
    }

}
