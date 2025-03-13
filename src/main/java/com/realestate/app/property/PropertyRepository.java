package com.realestate.app.property;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

//매물 관련
@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {
    // JpaRepository에서 기본적인 CRUD 메서드를 제공합니다
    // findAll(), findById(), save(), delete() 등
}
