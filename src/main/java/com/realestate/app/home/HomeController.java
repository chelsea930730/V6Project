package com.realestate.app.home;

import com.realestate.app.property.Property;
import com.realestate.app.property.PropertyService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;

import java.util.List;

@Slf4j
@Controller
public class HomeController {

    @Autowired
    private PropertyService propertyService;

    @ModelAttribute("isLoggedIn")
    public boolean isLoggedIn() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // 익명 사용자인 경우 false 반환
        if (authentication == null || !authentication.isAuthenticated() ||
                "anonymousUser".equals(authentication.getPrincipal())) {
            return false;
        }
        return true; // 로그인 상태면 true 반환
    }

    @GetMapping("/")
    public String index(Model model) {
        // 랜덤으로 3개의 매물 가져오기
        List<Property> randomProperties = propertyService.getRandomProperties(3);
        model.addAttribute("randomProperties", randomProperties);

        return "index";
    }
}
