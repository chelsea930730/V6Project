package com.realestate.app.cart;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface CartRepository extends JpaRepository<Cart, CartId> {
    
    // 특정 사용자의 장바구니 항목 모두 조회
    @Query("SELECT c FROM Cart c WHERE c.user.userId = :userId")
    List<Cart> findByUserId(@Param("userId") Long userId);
    
    // 특정 사용자의 특정 매물 장바구니 항목 조회
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Cart c WHERE c.user.userId = :userId AND c.property.propertyId = :propertyId")
    boolean existsByUserIdAndPropertyId(@Param("userId") Long userId, @Param("propertyId") Long propertyId);
    
    // 특정 사용자의 장바구니 항목 전부 삭제
    @Modifying
    @Transactional
    @Query("DELETE FROM Cart c WHERE c.user.userId = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);
    
    // 특정 사용자의 특정 매물 장바구니 항목 삭제
    @Modifying
    @Transactional
    @Query("DELETE FROM Cart c WHERE c.user.userId = :userId AND c.property.propertyId = :propertyId")
    void deleteByUserIdAndPropertyId(@Param("userId") Long userId, @Param("propertyId") Long propertyId);
}
