package com.realestate.app.admin;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.ui.Model;
import lombok.RequiredArgsConstructor;
import com.realestate.app.property.Property;
import com.realestate.app.property.PropertyService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

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
    public String propertyList(Model model, @RequestParam(defaultValue = "1") int page) {
        // 페이지는 0부터 시작하므로 1을 빼줍니다
        int pageNumber = page - 1;
        // 한 페이지당 8개의 항목, 페이지 크기는 10으로 설정
        Pageable pageable = PageRequest.of(pageNumber, 8);
        Page<Property> propertyPage = propertyService.getAllPropertiesWithPaging(pageable);

        model.addAttribute("properties", propertyPage.getContent());
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", propertyPage.getTotalPages());

        // 페이지 번호 목록 생성 (최대 10개)
        int totalPages = propertyPage.getTotalPages();
        if (totalPages > 0) {
            // 현재 페이지 그룹의 시작과 끝 계산
            int start = Math.max(1, ((page - 1) / 10) * 10 + 1);
            int end = Math.min(totalPages, start + 9);

            List<Integer> pageNumbers = IntStream.rangeClosed(start, end)
                    .boxed()
                    .collect(Collectors.toList());

            model.addAttribute("pageNumbers", pageNumbers);
            model.addAttribute("startPage", start);
            model.addAttribute("endPage", end);
            model.addAttribute("hasNext", end < totalPages);
            model.addAttribute("hasPrevious", start > 1);
            model.addAttribute("nextPageGroup", Math.min(totalPages, end + 1));
            model.addAttribute("previousPageGroup", Math.max(1, start - 10));
        }

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
