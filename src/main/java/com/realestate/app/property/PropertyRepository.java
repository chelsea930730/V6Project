package com.realestate.app.property;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

//매물 관련
@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {
    // JpaRepository에서 기본적인 CRUD 메서드를 제공합니다
    // findAll(), findById(), save(), delete() 등

    List<Property> findByDistrictContaining(String district);
    List<Property> findBySubwayLineContaining(String line);
    
    // 생성일 기준 내림차순 정렬
    List<Property> findAllByOrderByCreatedAtDesc();
    
    // 페이징 처리와 함께 생성일 기준 내림차순 정렬
    Page<Property> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
