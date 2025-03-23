package com.realestate.app.property;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Set;
import java.util.Objects;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/property")
@RequiredArgsConstructor
@Slf4j
public class PropertyController {
    private final PropertyService propertyService;

    // 매물 목록 조회
    @GetMapping("/list")
    public String listProperties(
        @RequestParam(required = false) String district,
        @RequestParam(required = false) String line,
        @RequestParam(required = false) String station,
        Model model) {
        
        System.out.println("요청 파라미터: district=" + district + ", line=" + line + ", station=" + station);

        List<Property> properties;
        
        // 모든 매물 가져오기 (나중에 필터링을 위해)
        List<Property> allProperties = propertyService.getAllProperties();
        System.out.println("전체 매물 수: " + allProperties.size() + "개");
        
        // 필터링된 매물 목록
        if (district != null) {
            // 지역구 필터링
            properties = allProperties.stream()
                .filter(p -> p.getDistrict() != null && 
                       (p.getDistrict().contains(district) || 
                        (district.length() > 2 && p.getDistrict().contains(district.substring(0, district.length()-1)))))
                .collect(Collectors.toList());
            
            System.out.println("지역구 필터링 '" + district + "': " + properties.size() + "개");
            model.addAttribute("filterType", "district");
            model.addAttribute("filterValue", district);
        } 
        else if (line != null) {
            // 노선 필터링
            properties = allProperties.stream()
                .filter(p -> p.getSubwayLine() != null && 
                       (p.getSubwayLine().contains(line)))
                .collect(Collectors.toList());
            
            System.out.println("노선 필터링 '" + line + "': " + properties.size() + "개");
            model.addAttribute("filterType", "line");
            model.addAttribute("filterValue", line);
        }
        else if (station != null) {
            // 역 필터링
            properties = allProperties.stream()
                .filter(p -> p.getSubwayLine() != null && 
                       (p.getSubwayLine().contains(station)))
                .collect(Collectors.toList());
            
            System.out.println("역 필터링 '" + station + "': " + properties.size() + "개");
            model.addAttribute("filterType", "station");
            model.addAttribute("filterValue", station);
        }
        else {
            // 필터 없음 - 모든 매물 표시
            properties = allProperties;
            System.out.println("필터 없음 - 전체 매물 표시");
        }
        
        // 매물 정보 로깅 (디버깅용)
        if (properties.size() > 0) {
            Property sample = properties.get(0);
            System.out.println("샘플 매물 정보:");
            System.out.println("- 제목: " + sample.getTitle());
            System.out.println("- 지역구: " + sample.getDistrict());
            System.out.println("- 지하철: " + sample.getSubwayLine());
        }
        
        model.addAttribute("properties", properties);
        return "property/list";
    }
    // 매물 상세 조회 
    @GetMapping("/{id}")
    public String getPropertyDetail(@PathVariable Long id, Model model, Authentication authentication) {
        // 기존 코드: 매물 정보 조회
        Property property = propertyService.getPropertyById(id);
        model.addAttribute("property", property);
        
        // 인증 상태 확인 및 모델에 추가
        boolean isLoggedIn = authentication != null && authentication.isAuthenticated() 
                && !authentication.getPrincipal().equals("anonymousUser");
        model.addAttribute("isLoggedIn", isLoggedIn);
        
        return "property/detail";
    }

    @GetMapping("/debug")
    @ResponseBody
    public Map<String, Object> debugDatabase() {
        Map<String, Object> result = new HashMap<>();
        
        List<Property> allProperties = propertyService.getAllProperties();
        
        // 저장된 모든 지역구와 노선 목록
        Set<String> districts = allProperties.stream()
            .map(Property::getDistrict)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());
        
        Set<String> subwayLines = allProperties.stream()
            .map(Property::getSubwayLine)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());
        
        // 매물 샘플 정보 (최대 5개)
        List<Map<String, Object>> sampleProperties = allProperties.stream()
            .limit(5)
            .map(p -> {
                Map<String, Object> data = new HashMap<>();
                data.put("id", p.getPropertyId());
                data.put("title", p.getTitle());
                data.put("district", p.getDistrict());
                data.put("subwayLine", p.getSubwayLine());
                data.put("monthlyPrice", p.getMonthlyPrice());
                return data;
            })
            .collect(Collectors.toList());
        
        result.put("totalProperties", allProperties.size());
        result.put("districts", districts);
        result.put("subwayLines", subwayLines);
        result.put("sampleProperties", sampleProperties);
        
        return result;
    }

    @PostMapping("/filter")
    @ResponseBody
    public ResponseEntity<List<Property>> filterProperties(@RequestBody Map<String, Object> filters) {
        try {
            log.info("받은 필터 데이터: {}", filters);

            // 필수값 처리
            BigDecimal minPrice = null;
            BigDecimal maxPrice = null;
            if (filters.get("minPrice") != null) {
                minPrice = new BigDecimal(filters.get("minPrice").toString());
            }
            if (filters.get("maxPrice") != null) {
                maxPrice = new BigDecimal(filters.get("maxPrice").toString());
            }

            // 선택적 필터값 처리
            String keyword = (String) filters.get("keyword");

            @SuppressWarnings("unchecked")
            List<String> buildingTypes = (List<String>) filters.get("buildingTypes");

            @SuppressWarnings("unchecked")
            List<String> roomTypes = (List<String>) filters.get("roomTypes");

            String buildingYear = (String) filters.get("buildingYear");
            String station = (String) filters.get("station");

            List<Property> filteredProperties = propertyService.filterProperties(
                    minPrice,
                    maxPrice,
                    buildingTypes,
                    roomTypes,
                    buildingYear,
                    station,
                    keyword
            );

            log.info("필터링된 매물 수: {}", filteredProperties.size());
            return ResponseEntity.ok(filteredProperties);

        } catch (Exception e) {
            log.error("필터링 중 오류 발생: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
