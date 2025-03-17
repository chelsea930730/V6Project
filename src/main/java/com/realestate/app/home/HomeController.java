package com.realestate.app.home;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.ui.Model;

@Slf4j
@Controller
public class HomeController {

    @GetMapping("/")
    public String index() {
        return "index";
    }

     @GetMapping("/HTML/login.html")
    public String login() {
        return "HTML/login"; // src/main/resources/templates/HTML/login.html
    }

    @GetMapping("/admin/baguni")
    public String baguni() {
        return "admin/baguni"; // src/main/resources/templates/admin/baguni.html
    }

    @GetMapping("/admin/create")
    public String create() {
        return "admin/create"; // src/main/resources/templates/admin/create.html
    }

    @GetMapping("/mypage")
    public String mypage() {
        return "mypage/mypage"; // src/main/resources/templates/mypage/mypage.html
    }

    @GetMapping("/admin/sangdam")
    public String sangdam() {
        return "admin/sangdam"; // src/main/resources/templates/admin/sangdam.html
    }

     @GetMapping("/admin/sangdamsangse")
     public String sangdamsangse() {
         return "admin/sangdamsangse"; // src/main/resources/templates/admin/sangdamsangse.html
     }
}
