package com.realestate.app.service;

import com.realestate.app.model.property.Property;
import com.realestate.app.repository.PropertyRepository;
import com.realestate.app.service.GeocodingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

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

    public Property saveProperty(Property property) {
        // 주소가 있을 경우 위도/경도 설정
        if (property.getLocation() != null) {
            GeocodingResult result = geocodingService.getCoordinates(property.getLocation());
            if (result != null) {
                property.setLatitude(result.latitude());
                property.setLongitude(result.longitude());
            }
        }
        return propertyRepository.save(property);
    }

    // 기존 데이터의 위도/경도 업데이트 (테스트 작업)
    @Transactional
    public void updateAllPropertiesCoordinates() {
        List<Property> properties = propertyRepository.findAll();
        
        for (Property property : properties) {
            if (property.getLocation() != null && 
                (property.getLatitude() == null || property.getLongitude() == null)) {
                
                log.info("Updating coordinates for property: {}", property.getTitle());
                GeocodingResult result = geocodingService.getCoordinates(property.getLocation());
                
                if (result != null) {
                    property.setLatitude(result.latitude());
                    property.setLongitude(result.longitude());
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
}
