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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
@Slf4j
public class PropertyApiController {

    private final PropertyService propertyService;

    @PostMapping("/filter")
    public ResponseEntity<List<Property>> filterProperties(@RequestBody Map<String, Object> filters) {
        try {
            log.info("필터 데이터 수신: {}", filters);

            // 가격 변환
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
                log.error("가격 변환 오류: ", e);
            }

            // 필터 파라미터 추출
            String keyword = (String) filters.get("keyword");
            String station = (String) filters.get("station");
            String line = (String) filters.get("line");
            List<String> selectedLines = filters.get("selectedLines") instanceof List ? 
                (List<String>) filters.get("selectedLines") : new ArrayList<>();
            List<String> selectedStations = filters.get("selectedStations") instanceof List ? 
                (List<String>) filters.get("selectedStations") : new ArrayList<>();
            String district = (String) filters.get("district");
            String buildingYear = (String) filters.get("buildingYear");
            String sortType = (String) filters.get("sortType");

            // 리스트 타입 변환
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

            // 초기 필터링 적용
            List<Property> filteredProperties;
            
            // 구 필터링 먼저 적용
            if (district != null && !district.isEmpty()) {
                log.info("지역구 필터링 적용: {}", district);
                filteredProperties = propertyService.getPropertiesByDistrict(district);
            } else {
                log.info("전체 매물 조회");
                filteredProperties = propertyService.getAllPropertiesByCreatedAtDesc();
            }
            
            // 노선/역 필터링 추가 적용
            if (!selectedLines.isEmpty() || !selectedStations.isEmpty()) {
                log.info("노선/역 필터링 추가 적용 - 선택된 노선: {}, 선택된 역: {}", selectedLines, selectedStations);
                filteredProperties = propertyService.filterBySubwayLineAndStation(filteredProperties, selectedLines, selectedStations);
            } else if (line != null && !line.isEmpty()) {
                log.info("URL 노선 필터링 추가 적용: {}", line);
                filteredProperties = propertyService.filterBySubwayLine(filteredProperties, line);
            }

            // 추가 필터 적용
            filteredProperties = propertyService.applyAdditionalFilters(
                filteredProperties,
                minPrice,
                maxPrice,
                buildingTypes,
                roomTypes,
                buildingYear,
                detailTypes,
                keyword
            );

            // 정렬 적용
            if (sortType != null && !filteredProperties.isEmpty()) {
                switch (sortType) {
                    case "newest":
                        filteredProperties.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
                        break;
                    case "price-low":
                        filteredProperties.sort((a, b) -> {
                            if (a.getMonthlyPrice() == null) return 1;
                            if (b.getMonthlyPrice() == null) return -1;
                            return a.getMonthlyPrice().compareTo(b.getMonthlyPrice());
                        });
                        break;
                    case "price-high":
                        filteredProperties.sort((a, b) -> {
                            if (a.getMonthlyPrice() == null) return 1;
                            if (b.getMonthlyPrice() == null) return -1;
                            return b.getMonthlyPrice().compareTo(a.getMonthlyPrice());
                        });
                        break;
                }
            }

            log.info("필터링 결과 매물 수: {}", filteredProperties.size());
            return ResponseEntity.ok(filteredProperties);

        } catch (Exception e) {
            log.error("필터링 처리 중 오류 발생: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Property>> searchProperties(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String line) {
        
        try {
            List<Property> searchResults;
            
            if (district != null && !district.isEmpty()) {
                log.info("지역구 검색: {}", district);
                searchResults = propertyService.getPropertiesByDistrict(district);
            } else if (line != null && !line.isEmpty()) {
                log.info("노선 검색: {}", line);
                searchResults = propertyService.getPropertiesBySubwayLine(line);
            } else if (keyword != null && !keyword.isEmpty()) {
                log.info("키워드 검색: {}", keyword);
                searchResults = propertyService.filterProperties(
                    null, null, null, null, null, null, null, keyword, null);
            } else {
                searchResults = propertyService.getAllPropertiesByCreatedAtDesc();
            }

            log.info("검색 결과 매물 수: {}", searchResults.size());
            return ResponseEntity.ok(searchResults);
        } catch (Exception e) {
            log.error("검색 처리 중 오류 발생: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}