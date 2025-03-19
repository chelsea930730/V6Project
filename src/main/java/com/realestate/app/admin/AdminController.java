package com.realestate.app.admin;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {
    
    @GetMapping("/dashboard")
    public String dashboard() {
        return "admin/dashboard";  // templates/admin/dashboard.html을 찾습니다
    }
}
