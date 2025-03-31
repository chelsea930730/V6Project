package com.realestate.app.property;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {
    // JpaRepository에서 기본적인 CRUD 메서드를 제공합니다
    // findAll(), findById(), save(), delete() 등

    List<Property> findByDistrictContaining(String district);

    // 생성일 기준 내림차순 정렬
    List<Property> findAllByOrderByCreatedAtDesc();

    // 페이징 처리와 함께 생성일 기준 내림차순 정렬
    Page<Property> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT p FROM Property p WHERE p.subwayLine LIKE %:line%")
    List<Property> findBySubwayLineContaining(@Param("line") String line);

    @Query("SELECT p FROM Property p WHERE p.subwayLine LIKE CONCAT('%', :line, '%')")
    List<Property> findByStationRegex(@Param("line") String pattern);
}