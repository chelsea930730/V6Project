package com.realestate.app.property;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;

@Controller
@RequestMapping("/property")
@RequiredArgsConstructor
@Slf4j
public class PropertyController {
    private final PropertyService propertyService;

    // 매물 목록 페이지
    @GetMapping("/list")
    public String listProperties(
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String line,
            @RequestParam(required = false) String station,
            Model model) {

        log.info("Requested parameters - district: {}, line: {}, station: {}", district, line, station);

        List<Property> properties;

        // 필터 조건에 따른 초기 데이터 로드
        if (district != null && !district.isEmpty()) {
            properties = propertyService.getPropertiesByDistrict(district);
            model.addAttribute("filterType", "district");
            model.addAttribute("filterValue", district);
            
            // 일본어 지역구인 경우 한글 이름도 추가
            if (district.matches(".*[\\u4E00-\\u9FAF].*")) {  // 한자 포함 여부 확인
                String koreanDistrict = convertDistrictToKorean(district);
                model.addAttribute("filterValueKorean", koreanDistrict);
            }
        } 
        else if (line != null && !line.isEmpty()) {
            properties = propertyService.getPropertiesBySubwayLine(line);
            model.addAttribute("filterType", "line");
            model.addAttribute("filterValue", line);
        } 
        else {
            properties = propertyService.getAllPropertiesByCreatedAtDesc();
        }

        model.addAttribute("properties", properties);
        log.info("Total properties loaded: {}", properties.size());
        
        return "property/list";
    }

    // 매물 상세 페이지
    @GetMapping("/{id}")
    public String getPropertyDetail(@PathVariable Long id, Model model, Authentication authentication) {
        try {
            Property property = propertyService.getPropertyById(id);
            model.addAttribute("property", property);
            
            // 로그인 상태 확인
            boolean isLoggedIn = authentication != null && 
                               authentication.isAuthenticated() && 
                               !authentication.getPrincipal().equals("anonymousUser");
            model.addAttribute("isLoggedIn", isLoggedIn);
            
            return "property/detail";
        } catch (RuntimeException e) {
            log.error("Error loading property detail for ID: {}", id, e);
            return "error/404";
        }
    }

    // 일본어 지역구를 한글로 변환하는 메서드
    private String convertDistrictToKorean(String japaneseDistrict) {
        return switch (japaneseDistrict) {
            case "足立区" -> "아다치구";
            case "葛飾区" -> "가쓰시카구";
            case "江戸川区" -> "에도가와구";
            case "江東区" -> "고토구";
            case "墨田区" -> "스미다구";
            case "荒川区" -> "아라카와구";
            case "台東区" -> "다이토구";
            case "北区" -> "기타구";
            case "文京区" -> "분쿄구";
            case "豊島区" -> "도시마구";
            case "板橋区" -> "이타바시구";
            case "練馬区" -> "네리마구";
            case "杉並区" -> "스기나미구";
            case "中野区" -> "나카노구";
            case "新宿区" -> "신주쿠구";
            case "千代田区" -> "지요다구";
            case "中央区" -> "주오구";
            case "渋谷区" -> "시부야구";
            case "世田谷区" -> "세타가야구";
            case "港区" -> "미나토구";
            case "目黒区" -> "메구로구";
            case "品川区" -> "시나가와구";
            case "大田区" -> "오타구";
            default -> japaneseDistrict;
        };
    }
}