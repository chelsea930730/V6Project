package com.realestate.app.admin;

import com.realestate.app.property.Property;
import com.realestate.app.property.PropertyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class AdminApiController {

    private final PropertyService propertyService;

    @Value("${file.upload.directory}")
    private String uploadDirectory;

    @PostMapping
    public ResponseEntity<?> createProperty(
            @RequestParam("title") String title,
            @RequestParam("monthlyPrice") BigDecimal monthlyPrice,
            @RequestParam("managementFee") BigDecimal managementFee,
            @RequestParam("initialCost") String initialCost,
            @RequestParam("area") BigDecimal area,
            @RequestParam("floor") String floor,
            @RequestParam("buildingType") String buildingType,
            @RequestParam("roomType") String roomType,
            @RequestParam("features") String[] features,
            @RequestParam("station") String station,
            @RequestParam("line") String line,
            @RequestParam("address") String address,
            @RequestParam("district") String district,
            @RequestParam("shikikin") String shikikin,
            @RequestParam("reikin") String reikin,
            @RequestParam("status") String status,
            @RequestParam("builtYear") String builtYear,
            @RequestParam("description") String description,
            @RequestParam("nearbyFacilities") String nearbyFacilities,
            @RequestParam(value = "thumbnailImage", required = false) MultipartFile thumbnailImage,
            @RequestParam(value = "floorplanImages", required = false) MultipartFile[] floorplanImages,
            @RequestParam(value = "buildingImages", required = false) MultipartFile[] buildingImages,
            @RequestParam(value = "interiorImages", required = false) MultipartFile[] interiorImages) {
        
        try {
            Property property = new Property();
            property.setTitle(title);
            property.setMonthlyPrice(monthlyPrice);
            property.setManagementFee(managementFee);
            property.setInitialCost(initialCost);
            property.setArea(area);
            property.setFloor(floor + "층");
            property.setBuildingType(Property.BuildingType.valueOf(buildingType));
            property.setRoomType(roomType);
            property.setStation(station);
            property.setSubwayLine(line);
            property.setLocation(address);
            property.setDistrict(district);
            property.setShikikin(new BigDecimal(shikikin.replaceAll("[^0-9]", "")));
            property.setReikin(new BigDecimal(reikin.replaceAll("[^0-9]", "")));
            property.setStatus(Property.Status.valueOf(status));
            property.setBuiltYear(builtYear);
            property.setDescription(description);
            property.setNearbyFacilities(nearbyFacilities);

            // 특징들을 description에 추가
            if (features != null && features.length > 0) {
                StringBuilder featureText = new StringBuilder(description);
                featureText.append("\n\n특징:\n");
                for (String feature : features) {
                    featureText.append("- ").append(feature).append("\n");
                }
                property.setDescription(featureText.toString());
            }

            // 썸네일 이미지 처리
            if (thumbnailImage != null && !thumbnailImage.isEmpty()) {
                String thumbnailUrl = saveImage(thumbnailImage);
                property.setThumbnailImage(thumbnailUrl);
            }

            // 평면도 이미지 처리 - 모든 이미지 저장
            if (floorplanImages != null && floorplanImages.length > 0) {
                StringBuilder floorplanUrls = new StringBuilder();
                for (MultipartFile image : floorplanImages) {
                    if (image != null && !image.isEmpty()) {
                        String imageUrl = saveImage(image);
                        if (floorplanUrls.length() > 0) {
                            floorplanUrls.append(",");
                        }
                        floorplanUrls.append(imageUrl);
                    }
                }
                property.setFloorplanImage(floorplanUrls.toString());
            }

            // 건물 이미지 처리 - 모든 이미지 저장
            if (buildingImages != null && buildingImages.length > 0) {
                StringBuilder buildingUrls = new StringBuilder();
                for (MultipartFile image : buildingImages) {
                    if (image != null && !image.isEmpty()) {
                        String imageUrl = saveImage(image);
                        if (buildingUrls.length() > 0) {
                            buildingUrls.append(",");
                        }
                        buildingUrls.append(imageUrl);
                    }
                }
                property.setBuildingImage(buildingUrls.toString());
            }

            // 내부 이미지 처리 - 모든 이미지 저장
            if (interiorImages != null && interiorImages.length > 0) {
                StringBuilder interiorUrls = new StringBuilder();
                for (MultipartFile image : interiorImages) {
                    if (image != null && !image.isEmpty()) {
                        String imageUrl = saveImage(image);
                        if (interiorUrls.length() > 0) {
                            interiorUrls.append(",");
                        }
                        interiorUrls.append(imageUrl);
                    }
                }
                property.setInteriorImage(interiorUrls.toString());
            }

            // 매물 저장
            Property savedProperty = propertyService.saveProperty(property);
            return ResponseEntity.ok().body(savedProperty);
        } catch (Exception e) {
            log.error("매물 등록 중 오류 발생", e);
            // JSON 형식으로 오류 메시지 반환
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "매물 등록에 실패했습니다: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProperty(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("monthlyPrice") BigDecimal monthlyPrice,
            @RequestParam("managementFee") BigDecimal managementFee,
            @RequestParam("initialCost") String initialCost,
            @RequestParam("area") BigDecimal area,
            @RequestParam("floor") String floor,
            @RequestParam("buildingType") String buildingType,
            @RequestParam("roomType") String roomType,
            @RequestParam("features") String[] features,
            @RequestParam("station") String station,
            @RequestParam("line") String line,
            @RequestParam("address") String address,
            @RequestParam("district") String district,
            @RequestParam("status") String status,
            @RequestParam("builtYear") String builtYear,
            @RequestParam("description") String description,
            @RequestParam(value = "thumbnailImage", required = false) MultipartFile thumbnailImage,
            @RequestParam(value = "floorplanImages", required = false) MultipartFile[] floorplanImages,
            @RequestParam(value = "buildingImages", required = false) MultipartFile[] buildingImages,
            @RequestParam(value = "interiorImages", required = false) MultipartFile[] interiorImages) {
        
        try {
            Property property = propertyService.getPropertyById(id);
            property.setTitle(title);
            property.setMonthlyPrice(monthlyPrice);
            property.setManagementFee(managementFee);
            property.setInitialCost(initialCost);
            property.setArea(area);
            property.setFloor(floor + "층");
            property.setBuildingType(Property.BuildingType.valueOf(buildingType));
            property.setRoomType(roomType);
            property.setStation(station);
            property.setSubwayLine(line);
            property.setLocation(address);
            property.setDistrict(district);
            property.setStatus(Property.Status.valueOf(status));
            property.setBuiltYear(builtYear);
            property.setDescription(description);

            // 특징들을 description에 추가
            if (features != null && features.length > 0) {
                StringBuilder featureText = new StringBuilder(description);
                featureText.append("\n\n특징:\n");
                for (String feature : features) {
                    featureText.append("- ").append(feature).append("\n");
                }
                property.setDescription(featureText.toString());
            }

            // 썸네일 이미지 처리
            if (thumbnailImage != null && !thumbnailImage.isEmpty()) {
                String thumbnailUrl = saveImage(thumbnailImage);
                property.setThumbnailImage(thumbnailUrl);
            }

            // 평면도 이미지 처리
            if (floorplanImages != null && floorplanImages.length > 0) {
                String floorplanUrl = saveImage(floorplanImages[0]);
                property.setFloorplanImage(floorplanUrl);
            }

            // 건물 이미지 처리
            if (buildingImages != null && buildingImages.length > 0) {
                String buildingUrl = saveImage(buildingImages[0]);
                property.setBuildingImage(buildingUrl);
            }

            // 내부 이미지 처리
            if (interiorImages != null && interiorImages.length > 0) {
                String interiorUrl = saveImage(interiorImages[0]);
                property.setInteriorImage(interiorUrl);
            }

            // 매물 저장
            Property updatedProperty = propertyService.saveProperty(property);
            return ResponseEntity.ok().body(updatedProperty);
        } catch (Exception e) {
            log.error("매물 수정 중 오류 발생", e);
            // JSON 형식으로 오류 메시지 반환
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "매물 수정에 실패했습니다: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    private String saveImage(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return null;
        }

        // 외부 디렉토리에 저장 (application.properties에 정의된 경로 사용)
        Path directory = Paths.get(uploadDirectory);
        if (!Files.exists(directory)) {
            Files.createDirectories(directory);
        }

        // 파일명 생성 (UUID + 원본 파일명)
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String filename = UUID.randomUUID().toString() + extension;

        // 파일 저장
        Path filePath = directory.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // 상대 경로 반환 (/uploads/파일명)
        return "/uploads/" + filename;
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getPropertyById(@PathVariable Long id) {
        try {
            Property property = propertyService.getPropertyById(id);
            
            // 클라이언트가 기대하는 형식으로 응답 데이터 구성
            Map<String, Object> response = new HashMap<>();
            response.put("propertyId", property.getPropertyId());
            response.put("title", property.getTitle());
            response.put("monthlyPrice", property.getMonthlyPrice());
            response.put("managementFee", property.getManagementFee());
            response.put("initialCost", property.getInitialCost());
            response.put("area", property.getArea());
            response.put("floor", property.getFloor());  // e.g. "3층"
            response.put("buildingType", property.getBuildingType().name());  // enum의 name 사용
            response.put("roomType", property.getRoomType());
            response.put("station", property.getStation());
            response.put("subwayLine", property.getSubwayLine());
            response.put("location", property.getLocation());  // address로 사용될 필드
            response.put("district", property.getDistrict());
            response.put("shikikin", property.getShikikin());
            response.put("reikin", property.getReikin());
            response.put("status", property.getStatus().name());  // enum의 name 사용
            response.put("builtYear", property.getBuiltYear());
            response.put("description", property.getDescription());
            response.put("nearbyFacilities", property.getNearbyFacilities());
            
            // 이미지 URL 추가
            response.put("thumbnailImage", property.getThumbnailImage());
            response.put("floorplanImage", property.getFloorplanImage());
            response.put("buildingImage", property.getBuildingImage());
            response.put("interiorImage", property.getInteriorImage());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("매물 조회 중 오류 발생", e);
            // JSON 형식으로 오류 메시지 반환
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "매물 조회에 실패했습니다: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProperty(@PathVariable Long id) {
        try {
            // 매물 삭제 전에 존재 여부 확인
            Property property = propertyService.getPropertyById(id);
            
            // 매물 삭제
            propertyService.deleteProperty(id);
            
            return ResponseEntity.ok().body(Map.of(
                "success", true,
                "message", "매물이 성공적으로 삭제되었습니다."
            ));
        } catch (Exception e) {
            log.error("매물 삭제 중 오류 발생", e);
            
            // 외래키 제약조건 위반 오류 메시지 확인 (장바구니나 예약에 포함된 매물)
            String errorMessage = e.getMessage();
            if (errorMessage != null && 
                (errorMessage.contains("foreign key constraint") || 
                 errorMessage.contains("constraint fails") || 
                 errorMessage.contains("FKmk46lll28mjrtb5ji3fiqjanp"))) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "장바구니에 담긴 매물이나 예약중인 매물은 삭제할 수 없습니다."
                ));
            }
            
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "매물 삭제에 실패했습니다: " + e.getMessage()
            ));
        }
    }
} 