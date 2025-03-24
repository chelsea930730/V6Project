package com.realestate.app.property;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface PropertyImageRepository extends JpaRepository<PropertyImage, PropertyImageId> {
  List<PropertyImage> findByPropertyPropertyId(Long propertyId);
  
  // 첫 번째 이미지만 필요한 경우 (LIMIT 1은 데이터베이스에 따라 작동하지 않을 수 있음)
  @Query(value = "SELECT p.image_url FROM property_image p WHERE p.property_id = :propertyId ORDER BY p.image_url LIMIT 1", nativeQuery = true)
  String findFirstImageUrlByPropertyId(@Param("propertyId") Long propertyId);
  
  // 또는 Spring Data JPA 네이밍 규칙 사용
  // String findTopByPropertyPropertyIdOrderByImageUrl(Long propertyId);
}