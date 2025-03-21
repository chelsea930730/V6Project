package com.realestate.app.admin;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.ui.Model;
import lombok.RequiredArgsConstructor;
import com.realestate.app.property.Property;
import com.realestate.app.property.PropertyService;
import java.util.List;

@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final PropertyService propertyService;

    @GetMapping("/dashboard")
    public String dashboard() {
        return "admin/dashboard";
    }

    @GetMapping("/addproperty")
    public String propertyList(Model model) {
        List<Property> properties = propertyService.getAllProperties();
        model.addAttribute("properties", properties);
        return "admin/addproperty";
    }

    @GetMapping("/create")
    public String createPropertyForm(@RequestParam(required = false) Long id, Model model) {
        if (id != null) {
            Property property = propertyService.getPropertyById(id);
            model.addAttribute("property", property);
        }
        return "admin/create";
    }

    @GetMapping("/consulting")
    public String consulting() {
        return "admin/consulting";
    }

    @GetMapping("/chatManage")
    public String chatManage(Model model) {
        // TODO: 채팅 목록을 가져오는 서비스 로직 구현 필요
        return "admin/chatManage";
    }
}
