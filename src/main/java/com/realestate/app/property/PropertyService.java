package com.realestate.app.property;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.realestate.app.geocoding.GeocodingService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.math.BigDecimal;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PropertyService {
    private final PropertyRepository propertyRepository;
    private final GeocodingService geocodingService;
    private static final Logger log = LoggerFactory.getLogger(PropertyService.class);

    public List<Property> getAllProperties() {
        return propertyRepository.findAll();
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
            String keyword) {

        try {
            return getAllProperties().stream()
                    .filter(property -> {
                        // 가격 필터
                        if (property.getMonthlyPrice() == null ||
                                property.getMonthlyPrice().compareTo(minPrice) < 0 ||
                                property.getMonthlyPrice().compareTo(maxPrice) > 0) {
                            return false;
                        }

                        // 건물 타입 필터
                        if (buildingTypes != null && !buildingTypes.isEmpty()) {
                            boolean matchesType = buildingTypes.stream()
                                    .anyMatch(type -> property.getBuildingType() != null &&
                                            property.getBuildingType().name().equals(type));
                            if (!matchesType) return false;
                        }

                        // 방 타입 필터
                        if (roomTypes != null && !roomTypes.isEmpty()) {
                            if (!roomTypes.contains(property.getRoomType())) {
                                return false;
                            }
                        }

                        // 건축년도 필터
                        if (buildingYear != null && !buildingYear.isEmpty()) {
                            String yearStr = property.getBuiltYear().replace("년", "");
                            try {
                                int propertyYear = Integer.parseInt(yearStr);
                                int currentYear = java.time.Year.now().getValue();
                                int age = currentYear - propertyYear;

                                int limit = switch (buildingYear) {
                                    case "1년 이내" -> 1;
                                    case "5년 이내" -> 5;
                                    case "10년 이내" -> 10;
                                    case "15년 이내" -> 15;
                                    case "20년 이내" -> 20;
                                    case "25년 이내" -> 25;
                                    case "30년 이내" -> 30;
                                    default -> Integer.MAX_VALUE;
                                };

                                if (age > limit) return false;
                            } catch (NumberFormatException e) {
                                log.error("건축년도 파싱 오류: {}", yearStr);
                                return false;
                            }
                        }

                        // 역 필터
                        if (station != null && !station.isEmpty()) {
                            if (property.getSubwayLine() == null ||
                                    !property.getSubwayLine().contains(station)) {
                                return false;
                            }
                        }

                        // 키워드 검색
                        if (keyword != null && !keyword.isEmpty()) {
                            String lowercaseKeyword = keyword.toLowerCase();
                            return (property.getLocation() != null &&
                                    property.getLocation().toLowerCase().contains(lowercaseKeyword)) ||
                                    (property.getDistrict() != null &&
                                            property.getDistrict().toLowerCase().contains(lowercaseKeyword));
                        }

                        return true;
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("필터링 중 오류 발생: ", e);
            return getAllProperties();
        }
    }
}
