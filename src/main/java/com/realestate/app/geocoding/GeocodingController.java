package com.realestate.app.geocoding;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.app.property.PropertyService;

@RestController
@RequestMapping("/api/geocoding")
@RequiredArgsConstructor
public class GeocodingController {
    private final PropertyService propertyService;

    @GetMapping("/update-all")
    public ResponseEntity<String> updateAllCoordinates() {
        try {
            propertyService.updateAllPropertiesCoordinates();
            return ResponseEntity.ok("모든 매물의 좌표 업데이트가 완료되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("좌표 업데이트 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
}
