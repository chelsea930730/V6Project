package com.realestate.app.property;

import com.realestate.app.geocoding.GeocodingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;

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

    public List<PropertyDto> getAllPropertyDtos() {
        return propertyRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(PropertyDto::fromEntity)
                .collect(Collectors.toList());
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

    @Transactional
    public PropertyDto savePropertyDto(PropertyDto propertyDto) {
        // 시키킨과 레이킨 null 체크 및 기본값 설정
        if (propertyDto.getShikikin() == null) {
            propertyDto.setShikikin(BigDecimal.ZERO);
        }
        if (propertyDto.getReikin() == null) {
            propertyDto.setReikin(BigDecimal.ZERO);
        }

        // features 값에서 상세조건을 detailDescription에 저장
        String features = propertyDto.getDetailDescription();
        if (features != null && !features.isEmpty()) {
            // 상세조건을 detailDescription에 저장
            propertyDto.setDetailDescription(features);
        }
        
        // description은 그대로 description에 저장 (비고)

        Property property = propertyDto.toEntity();

        if (property.getLocation() != null) {
            var result = geocodingService.getCoordinates(property.getLocation());
            if (result != null) {
                property.setLatitude(BigDecimal.valueOf(result.latitude()));
                property.setLongitude(BigDecimal.valueOf(result.longitude()));
            }
        }

        Property savedProperty = propertyRepository.save(property);
        return PropertyDto.fromEntity(savedProperty);
    }

    public Property getPropertyById(Long id) {
        return propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("매물을 찾을 수 없습니다: " + id));
    }

    public PropertyDto getPropertyDtoById(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("매물을 찾을 수 없습니다: " + id));
        return PropertyDto.fromEntity(property);
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
        log.info("노선 검색 시작: {}", line);
        
        // 이미 변환된 노선명이 전달되므로 추가 변환 불필요
        log.info("검색할 노선명: {}", line);
        List<Property> properties = propertyRepository.findBySubwayLineContaining(line);
        log.info("검색된 매물 수: {}", properties.size());
        
        return properties;
    }

    public List<Property> getPropertiesBySubwayLineAndStation(List<String> lines, List<String> stations) {
        log.info("노선 및 역 검색 시작 - 선택된 노선: {}, 선택된 역: {}", lines, stations);
        
        List<Property> properties = getAllProperties();
        
        // 노선 필터링
        if (lines != null && !lines.isEmpty()) {
            properties = properties.stream()
                .filter(property -> lines.stream()
                    .anyMatch(line -> {
                        String convertedLine = convertLineNameToFullName(line);
                        return property.getSubwayLine() != null && 
                               property.getSubwayLine().contains(convertedLine);
                    }))
                .collect(Collectors.toList());
        }
        
        // 역 필터링
        if (stations != null && !stations.isEmpty()) {
            properties = properties.stream()
                .filter(property -> stations.stream()
                    .anyMatch(station -> {
                        if (property.getStation() == null) return false;
                        // 공백을 제거하고 비교
                        String normalizedPropertyStation = property.getStation().replaceAll("\\s+", "");
                        String normalizedStation = station.replaceAll("\\s+", "");
                        return normalizedPropertyStation.equals(normalizedStation);
                    }))
                .collect(Collectors.toList());
        }
        
        log.info("검색된 매물 수: {}", properties.size());
        return properties;
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
                boolean roomTypeMatch = roomTypes == null || roomTypes.isEmpty() || 
                    roomTypes.stream().anyMatch(roomType -> {
                        if (roomType.equals("2K이상")) {
                            return property.getRoomType() != null && 
                                   (property.getRoomType().startsWith("2") || 
                                    property.getRoomType().startsWith("3") ||
                                    property.getRoomType().startsWith("4"));
                        }
                        return property.getRoomType() != null && 
                               property.getRoomType().equals(roomType);
                    });

                // 건축년도 필터링
                boolean buildingYearMatch = buildingYear == null || buildingYear.isEmpty() || 
                    (property.getBuiltYear() != null && matchBuildingYear(property.getBuiltYear(), buildingYear));

                // 상세 정보 필터링
                boolean detailMatch = detailTypes == null || detailTypes.isEmpty() || 
                    (property.getDetailDescription() != null && 
                     detailTypes.stream().anyMatch(detail -> 
                         property.getDetailDescription().contains(detail)));

                // 키워드 검색
                boolean keywordMatch = true;
                if (keyword != null && !keyword.isEmpty()) {
                    String japaneseDistrict = convertDistrictToJapanese(keyword);
                    keywordMatch = (property.getTitle() != null && 
                                  (property.getTitle().contains(keyword) || 
                                   property.getTitle().contains(japaneseDistrict))) ||
                                 (property.getDescription() != null && 
                                  (property.getDescription().contains(keyword) || 
                                   property.getDescription().contains(japaneseDistrict))) ||
                                 (property.getLocation() != null && 
                                  (property.getLocation().contains(keyword) || 
                                   property.getLocation().contains(japaneseDistrict)));
                }

                // 지하철 노선 필터링
                boolean subwayLineMatch = true;
                if (line != null && !line.isEmpty()) {
                    String convertedLine = convertLineNameToFullName(line);
                    subwayLineMatch = property.getSubwayLine() != null && 
                                    property.getSubwayLine().contains(convertedLine);
                }

                // 역 필터링
                boolean stationMatch = true;
                if (station != null && !station.isEmpty()) {
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

    public boolean matchBuildingYear(String propertyYear, String filterYear) {
        try {
            int year = Integer.parseInt(propertyYear.replaceAll("[^0-9]", ""));
            int currentYear = java.time.Year.now().getValue();
            
            return switch (filterYear) {
                case "1년 이내" -> currentYear - year <= 1;
                case "5년 이내" -> currentYear - year <= 5;
                case "10년 이내" -> currentYear - year <= 10;
                case "15년 이내" -> currentYear - year <= 15;
                case "20년 이내" -> currentYear - year <= 20;
                case "25년 이내" -> currentYear - year <= 25;
                case "30년 이내" -> currentYear - year <= 30;
                default -> true;
            };
        } catch (NumberFormatException e) {
            return false;
        }
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

    private String convertLineNameToFullName(String line) {
        return switch (line) {
            case "야마노테" -> "JR山手線・JR야마노테선";
            case "츄오- 소부" -> "JR中央総武線";
            case "사이쿄" -> "JR埼京線";
            case "죠반" -> "JR常磐線・JR죠반선";
            case "타카사키" -> "JR高崎線・JR타카사키선";
            case "요코스카" -> "JR横須賀・JR요코스카선";
            case "게이힌토호쿠" -> "JR京浜東北線・JR게이힌토호쿠선";
            case "한조몬" -> "半蔵門線・한조몬선";
            case "마루노우치" -> "丸ノ内線・마루노우치선";
            case "히비야" -> "日比谷線・히비야선";
            case "치요다" -> "千代田線・치요다선";
            case "후쿠토신" -> "副都心線・후쿠토신선";
            case "긴자" -> "銀座線・긴자선";
            case "난보쿠" -> "南北線・난보쿠선";
            case "유라쿠쵸" -> "有楽町線・유라쿠쵸선";
            case "토자이" -> "東西線・토자이선";
            default -> line;
        };
    }

    public List<Property> applyAdditionalFilters(List<Property> properties, 
                                               BigDecimal minPrice, 
                                               BigDecimal maxPrice,
                                               List<String> buildingTypes,
                                               List<String> roomTypes,
                                               String buildingYear,
                                               List<String> detailTypes,
                                               String keyword) {
        return properties.stream()
            .filter(property -> {
                // 가격 필터
                boolean priceMatch = true;
                if (minPrice != null && property.getMonthlyPrice() != null) {
                    priceMatch = property.getMonthlyPrice().compareTo(minPrice) >= 0;
                }
                if (maxPrice != null && property.getMonthlyPrice() != null) {
                    priceMatch = priceMatch && property.getMonthlyPrice().compareTo(maxPrice) <= 0;
                }

                // 건물 유형 필터
                boolean buildingTypeMatch = buildingTypes.isEmpty() || 
                    (property.getBuildingType() != null && 
                     buildingTypes.contains(property.getBuildingType().getValue()));

                // 방 유형 필터
                boolean roomTypeMatch = roomTypes.isEmpty() || 
                    (property.getRoomType() != null && 
                     roomTypes.stream().anyMatch(roomType -> {
                        if (roomType.equals("2K이상")) {
                            return property.getRoomType().startsWith("2") || 
                                   property.getRoomType().startsWith("3") ||
                                   property.getRoomType().startsWith("4");
                        }
                        return property.getRoomType().equals(roomType);
                    }));

                // 건축년도 필터
                boolean yearMatch = buildingYear == null || buildingYear.isEmpty() || 
                    (property.getBuiltYear() != null && 
                     matchBuildingYear(property.getBuiltYear(), buildingYear));

                // 상세 조건 필터
                boolean detailMatch = detailTypes.isEmpty() || 
                    (property.getDetailDescription() != null && 
                     detailTypes.stream().anyMatch(detail -> 
                         property.getDetailDescription().contains(detail)));

                // 키워드 검색
                boolean keywordMatch = true;
                if (keyword != null && !keyword.isEmpty()) {
                    String japaneseDistrict = convertDistrictToJapanese(keyword);
                    keywordMatch = (property.getTitle() != null && 
                                  (property.getTitle().contains(keyword) || 
                                   property.getTitle().contains(japaneseDistrict))) ||
                                 (property.getDescription() != null && 
                                  (property.getDescription().contains(keyword) || 
                                   property.getDescription().contains(japaneseDistrict))) ||
                                 (property.getLocation() != null && 
                                  (property.getLocation().contains(keyword) || 
                                   property.getLocation().contains(japaneseDistrict)));
                }

                return priceMatch && buildingTypeMatch && roomTypeMatch && 
                       yearMatch && detailMatch && keywordMatch;
            })
            .collect(Collectors.toList());
    }

    // 한글 지역명을 일본어로 변환하는 메서드 추가
    private String convertDistrictToJapanese(String koreanDistrict) {
        return switch (koreanDistrict) {
            case "아다치구", "아다치" -> "足立区";
            case "가쓰시카구", "가쓰시카" -> "葛飾区";
            case "에도가와구", "에도가와" -> "江戸川区";
            case "고토구", "고토" -> "江東区";
            case "스미다구", "스미다" -> "墨田区";
            case "아라카와구", "아라카와" -> "荒川区";
            case "다이토구", "다이토" -> "台東区";
            case "기타구", "기타" -> "北区";
            case "분쿄구", "분쿄" -> "文京区";
            case "도시마구", "도시마" -> "豊島区";
            case "이타바시구", "이타바시" -> "板橋区";
            case "네리마구", "네리마" -> "練馬区";
            case "스기나미구", "스기나미" -> "杉並区";
            case "나카노구", "나카노" -> "中野区";
            case "신주쿠구", "신주쿠" -> "新宿区";
            case "지요다구", "지요다" -> "千代田区";
            case "주오구", "주오" -> "中央区";
            case "시부야구", "시부야" -> "渋谷区";
            case "세타가야구", "세타가야" -> "世田谷区";
            case "미나토구", "미나토" -> "港区";
            case "메구로구", "메구로" -> "目黒区";
            case "시나가와구", "시나가와" -> "品川区";
            case "오타구", "오타" -> "大田区";
            default -> koreanDistrict;
        };
    }

    // 매물 검색 메서드 추가
    public Page<Property> searchProperties(String searchType, String keyword, Pageable pageable) {
        if (searchType == null || keyword == null || keyword.trim().isEmpty()) {
            return getAllPropertiesWithPaging(pageable);
        }

        switch (searchType) {
            case "id":
                try {
                    Long propertyId = Long.parseLong(keyword);
                    return propertyRepository.findByPropertyId(propertyId, pageable);
                } catch (NumberFormatException e) {
                    return Page.empty(pageable);
                }
            case "title":
                return propertyRepository.findByTitleContaining(keyword, pageable);
            case "all":
                try {
                    Long propertyId = Long.parseLong(keyword);
                    return propertyRepository.findByPropertyIdOrTitleContaining(propertyId, keyword, pageable);
                } catch (NumberFormatException e) {
                    return propertyRepository.findByTitleContaining(keyword, pageable);
                }
            default:
                return getAllPropertiesWithPaging(pageable);
        }
    }

    @Transactional
    public Property updateProperty(PropertyDto propertyDto) {
        Property existingProperty = propertyRepository.findById(propertyDto.getPropertyId())
                .orElseThrow(() -> new RuntimeException("매물을 찾을 수 없습니다: " + propertyDto.getPropertyId()));
        
        // 기존 데이터 유지하면서 업데이트
        Property property = propertyDto.toEntity();
        property.setCreatedAt(existingProperty.getCreatedAt());
        
        // features 값에서 상세조건을 detailDescription에 저장
        String features = propertyDto.getDetailDescription();
        if (features != null && !features.isEmpty()) {
            // 상세조건을 detailDescription에 저장
            property.setDetailDescription(features);
        }
        
        // description은 그대로 description에 저장 (비고)
        
        // 주변 시설 정보 명시적으로 설정
        property.setNearbyFacilities(propertyDto.getNearbyFacilities());
        
        // 디버깅용 로그
        log.info("매물 업데이트 중: ID={}, nearbyFacilities={}", 
                property.getPropertyId(), property.getNearbyFacilities());
        
        return propertyRepository.save(property);
    }

    // 랜덤 매물 가져오기
    public List<Property> getRandomProperties(int count) {
        // 전체 매물 수 확인 (썸네일이 있는 매물만)
        long totalProperties = propertyRepository.count();
        int limit = (int) Math.min(totalProperties, count);

        if (limit == 0) {
            return new ArrayList<>();
        }

        // 썸네일이 있는 매물 중에서 랜덤으로 limit 개수만큼 가져오기
        return propertyRepository.findRandomPropertiesWithThumbnail(limit);
    }

    // 이미 필터링된 매물 목록에 대해 노선 필터링 적용
    public List<Property> filterBySubwayLine(List<Property> properties, String line) {
        log.info("노선 필터링 적용: {}", line);
        
        String convertedLine = convertLineNameToFullName(line);
        return properties.stream()
            .filter(property -> property.getSubwayLine() != null && 
                   property.getSubwayLine().contains(convertedLine))
            .collect(Collectors.toList());
    }

    // 이미 필터링된 매물 목록에 대해 노선/역 필터링 적용
    public List<Property> filterBySubwayLineAndStation(List<Property> properties, 
                                                     List<String> lines, 
                                                     List<String> stations) {
        log.info("노선 및 역 필터링 적용 - 선택된 노선: {}, 선택된 역: {}", lines, stations);
        
        // 노선 필터링
        if (lines != null && !lines.isEmpty()) {
            properties = properties.stream()
                .filter(property -> lines.stream()
                    .anyMatch(line -> {
                        String convertedLine = convertLineNameToFullName(line);
                        return property.getSubwayLine() != null && 
                               property.getSubwayLine().contains(convertedLine);
                    }))
                .collect(Collectors.toList());
        }
        
        // 역 필터링
        if (stations != null && !stations.isEmpty()) {
            properties = properties.stream()
                .filter(property -> stations.stream()
                    .anyMatch(station -> {
                        if (property.getStation() == null) return false;
                        // 공백을 제거하고 비교
                        String normalizedPropertyStation = property.getStation().replaceAll("\\s+", "");
                        String normalizedStation = station.replaceAll("\\s+", "");
                        return normalizedPropertyStation.equals(normalizedStation);
                    }))
                .collect(Collectors.toList());
        }
        
        log.info("필터링 결과 매물 수: {}", properties.size());
        return properties;
    }
}
