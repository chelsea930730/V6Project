package com.realestate.app.property;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.realestate.app.geocoding.GeocodingService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.math.BigDecimal;

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

    public Page<Property> getAllPropertiesWithPaging(Pageable pageable) {
        return propertyRepository.findAll(pageable);
    }
}
