package com.realestate.app.property;

import com.realestate.app.geocoding.GeocodingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.realestate.app.geocoding.GeocodingService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PropertyService {
    private final PropertyRepository propertyRepository;
    private final GeocodingService geocodingService;
    private static final Logger log = LoggerFactory.getLogger(PropertyService.class);

    public List<Property> getAllProperties() {
        return propertyRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public Property saveProperty(Property property) {
        if (property.getLocation() != null) {
            var result = geocodingService.getCoordinates(property.getLocation());
            if (result != null) {
                property.setLatitude(BigDecimal.valueOf(result.latitude()));
                property.setLongitude(BigDecimal.valueOf(result.longitude()));
            }
        }
        return propertyRepository.save(property);
    }

    public Property getPropertyById(Long id) {
        return propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("매물을 찾을 수 없습니다: " + id));
    }

    @Transactional
    public void updateAllPropertiesCoordinates() {
        List<Property> properties = propertyRepository.findAll();

        for (Property property : properties) {
            if (property.getLocation() != null &&
                    (property.getLatitude() == null || property.getLongitude() == null)) {

                log.info("Updating coordinates for property: {}", property.getTitle());
                var result = geocodingService.getCoordinates(property.getLocation());

                if (result != null) {
                    property.setLatitude(BigDecimal.valueOf(result.latitude()));
                    property.setLongitude(BigDecimal.valueOf(result.longitude()));
                    propertyRepository.save(property);
                    log.info("Updated coordinates for {}: lat={}, lng={}",
                            property.getTitle(), result.latitude(), result.longitude());
                } else {
                    log.error("Failed to get coordinates for property: {}", property.getTitle());
                }

                // Google API 제한을 고려한 딜레이
                try {
                    Thread.sleep(200);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        }
    }

    public List<Property> getPropertiesByDistrict(String district) {
        return propertyRepository.findByDistrictContaining(district);
    }

    public List<Property> getPropertiesBySubwayLine(String line) {
        return propertyRepository.findBySubwayLineContaining(line);
    }

    public List<Property> filterProperties(
            BigDecimal minPrice,
            BigDecimal maxPrice,
            List<String> buildingTypes,
            List<String> roomTypes,
            String buildingYear,
            String station,
            String line,
            String keyword,
        List<String> detailTypes
    ) {
        return getAllProperties().stream()
                    .filter(property -> {
                // 월세 필터링
                boolean monthlyPriceMatch = true;
                if (minPrice != null) {
                    monthlyPriceMatch = property.getMonthlyPrice() == null || 
                                      property.getMonthlyPrice().compareTo(minPrice) >= 0;
                }
                if (maxPrice != null) {
                    monthlyPriceMatch = monthlyPriceMatch && (property.getMonthlyPrice() == null || 
                                      property.getMonthlyPrice().compareTo(maxPrice) <= 0);
                }

                // 건물 유형 필터링
                boolean buildingTypeMatch = buildingTypes == null 
                    || buildingTypes.isEmpty() 
                    || buildingTypes.contains(property.getBuildingType().getValue());

                // 방 유형 필터링
                boolean roomTypeMatch = roomTypes == null
                    || roomTypes.isEmpty()
                    || roomTypes.contains(property.getRoomType());

                // 건축년도 필터링
                boolean buildingYearMatch = buildingYear == null 
                    || buildingYear.isEmpty() 
                    || property.getBuiltYear() == null 
                    || property.getBuiltYear().contains(buildingYear);

                // 상세 정보 필터링
                boolean detailMatch = detailTypes == null 
                    || detailTypes.isEmpty() 
                    || (property.getNearbyFacilities() != null && 
                        detailTypes.stream()
                            .anyMatch(detail -> property.getNearbyFacilities().contains(detail)));

                        // 키워드 검색
                boolean keywordMatch = keyword == null 
                    || keyword.isEmpty() 
                    || (property.getTitle() != null && property.getTitle().contains(keyword)) 
                    || (property.getDescription() != null && property.getDescription().contains(keyword));

                // 지하철 노선 필터링 수정
                boolean subwayLineMatch = true;
                if (line != null && !line.isEmpty()) {
                    subwayLineMatch = property.getSubwayLine() != null && 
                                    property.getSubwayLine().contains(line);
                }

                // 역 필터링 수정 (역이 선택된 경우에만 적용)
                boolean stationMatch = true;
                if (station != null && !station.isEmpty()) {
                    // DB에 저장된 형식 (일본어(한글))에 맞춰 검색
                    String stationPattern = "(" + station + ")";
                    stationMatch = property.getStation() != null && 
                                 property.getStation().contains(stationPattern);
                }

                return monthlyPriceMatch && buildingTypeMatch && roomTypeMatch && 
                       buildingYearMatch && detailMatch && keywordMatch && 
                       subwayLineMatch && stationMatch;
                    })
                    .collect(Collectors.toList());
    }

    public Page<Property> getAllPropertiesWithPaging(Pageable pageable) {
        return propertyRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    public List<Property> findByIds(List<Long> propertyIds) {
        return propertyRepository.findAllById(propertyIds);
    }

    public List<Property> getAllPropertiesByCreatedAtDesc() {
        return propertyRepository.findAllByOrderByCreatedAtDesc();
    }
    @Transactional
    public void deleteProperty(Long id) {
        propertyRepository.deleteById(id);
    }
}
