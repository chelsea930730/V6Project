package com.realestate.app.property;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
@Slf4j
public class PropertyApiController {

    private final PropertyService propertyService;

    @PostMapping("/filter")
    public ResponseEntity<List<Property>> filterProperties(@RequestBody Map<String, Object> filters) {
        try {
            log.info("받은 필터 데이터: {}", filters);

            // 가격 변환 시 예외 처리 추가
            BigDecimal minPrice = null;
            BigDecimal maxPrice = null;
            try {
                if (filters.get("minPrice") != null) {
                    minPrice = new BigDecimal(filters.get("minPrice").toString());
                }
                if (filters.get("maxPrice") != null) {
                    maxPrice = new BigDecimal(filters.get("maxPrice").toString());
                }
            } catch (NumberFormatException e) {
                log.error("가격 변환 중 오류: ", e);
            }

            String keyword = (String) filters.get("keyword");
            String station = (String) filters.get("station");
            String line = (String) filters.get("subwayLine");
            String buildingYear = (String) filters.get("buildingYear");
            String sortType = (String) filters.get("sortType");

            // 리스트 타입 안전하게 변환
            List<String> buildingTypes = new ArrayList<>();
            List<String> roomTypes = new ArrayList<>();
            List<String> detailTypes = new ArrayList<>();

            if (filters.get("buildingTypes") instanceof List) {
                buildingTypes = (List<String>) filters.get("buildingTypes");
            }
            if (filters.get("roomTypes") instanceof List) {
                roomTypes = (List<String>) filters.get("roomTypes");
            }
            if (filters.get("detailTypes") instanceof List) {
                detailTypes = (List<String>) filters.get("detailTypes");
            }

            List<Property> filteredProperties = propertyService.filterProperties(
                    minPrice,
                    maxPrice,
                    buildingTypes,
                    roomTypes,
                    buildingYear,
                    station,
                    line,
                    keyword,
                    detailTypes
            );

            // 정렬 로직
            if (sortType != null) {
                switch (sortType) {
                    case "newest":
                        filteredProperties.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
                        break;
                    case "price-low":
                        filteredProperties.sort((a, b) -> a.getMonthlyPrice().compareTo(b.getMonthlyPrice()));
                        break;
                    case "price-high":
                        filteredProperties.sort((a, b) -> b.getMonthlyPrice().compareTo(a.getMonthlyPrice()));
                        break;
                }
            }

            log.info("필터링된 매물 수: {}", filteredProperties.size());
            return ResponseEntity.ok(filteredProperties);

        } catch (Exception e) {
            log.error("필터링 중 오류 발생: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
