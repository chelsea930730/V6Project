package com.realestate.app.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.realestate.app.property.Property;
import com.realestate.app.property.PropertyRepository;

import java.util.List;

@Service
public class PropertyMigrationService {

    private final PropertyRepository propertyRepository;

    @Autowired
    public PropertyMigrationService(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void migratePropertyReservedField() {
        // 모든 Property에 대해 reserved 필드가 null인 경우 false로 설정
        List<Property> properties = propertyRepository.findAll();
        for (Property property : properties) {
            if (property.getReserved() == null) {
                property.setReserved(false);
                propertyRepository.save(property);
            }
        }
    }
}