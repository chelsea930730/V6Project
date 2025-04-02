package com.realestate.app.property;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
@Slf4j
public class PropertyStatusController {

    private final PropertyService propertyService;

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updatePropertyStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        try {
            log.info("매물 상태 변경 요청: ID={}, 새 상태={}", id, request.get("status"));

            String newStatus = request.get("status");
            if (newStatus == null || newStatus.isEmpty()) {
                return ResponseEntity.badRequest().body(
                        Map.of("success", false,
                                "message", "상태 값이 제공되지 않았습니다.")
                );
            }

            Property property = propertyService.getPropertyById(id);
            property.setStatus(Property.Status.valueOf(newStatus));
            propertyService.saveProperty(property);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "매물 상태가 성공적으로 변경되었습니다.");
            response.put("status", newStatus);
            response.put("propertyId", id);

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("유효하지 않은 상태 값: {}", request.get("status"), e);
            return ResponseEntity.badRequest().body(
                    Map.of("success", false,
                            "message", "유효하지 않은 상태 값입니다: " + e.getMessage())
            );
        } catch (Exception e) {
            log.error("매물 상태 업데이트 오류: ", e);
            return ResponseEntity.badRequest().body(
                    Map.of("success", false,
                            "message", "매물 상태 업데이트에 실패했습니다: " + e.getMessage())
            );
        }
    }
}