package com.realestate.app.controller;

import com.realestate.app.model.user.UserLoginDto;
import com.realestate.app.model.user.UserRegisterDto;
import com.realestate.app.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

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
    public String login(Model model) {
        model.addAttribute("userLoginDto", new UserLoginDto());
        return "/user/login";
    }

}
