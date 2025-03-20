package com.realestate.app.cart;

import com.realestate.app.property.Property;
import com.realestate.app.property.PropertyRepository;
import com.realestate.app.user.User;
import com.realestate.app.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;

    /**
     * 장바구니에 매물 추가
     */
    @Transactional
    public void addToCart(Long userId, Long propertyId) {
        // 이미 장바구니에 있는지 확인
        if (cartRepository.existsByUserIdAndPropertyId(userId, propertyId)) {
            return; // 이미 존재하면 추가하지 않음
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new IllegalArgumentException("매물을 찾을 수 없습니다: " + propertyId));

        Cart cart = new Cart(user, property);
        cartRepository.save(cart);
    }

    /**
     * 여러 매물을 장바구니에 추가
     */
    @Transactional
    public void addMultipleToCart(Long userId, List<Long> propertyIds) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));

        List<Cart> cartItems = new ArrayList<>();
        
        for (Long propertyId : propertyIds) {
            // 이미 장바구니에 있는지 확인
            if (!cartRepository.existsByUserIdAndPropertyId(userId, propertyId)) {
                Property property = propertyRepository.findById(propertyId)
                        .orElseThrow(() -> new IllegalArgumentException("매물을 찾을 수 없습니다: " + propertyId));
                
                Cart cart = new Cart(user, property);
                cartItems.add(cart);
            }
        }
        
        cartRepository.saveAll(cartItems);
    }

    /**
     * 사용자의 장바구니 항목 조회
     */
    @Transactional(readOnly = true)
    public List<Property> getCartItems(Long userId) {
        List<Cart> carts = cartRepository.findByUserId(userId);
        return carts.stream()
                .map(Cart::getProperty)
                .collect(Collectors.toList());
    }

    /**
     * 장바구니에서 매물 삭제
     */
    @Transactional
    public void removeFromCart(Long userId, Long propertyId) {
        cartRepository.deleteByUserIdAndPropertyId(userId, propertyId);
    }

    /**
     * 장바구니 비우기
     */
    @Transactional
    public void clearCart(Long userId) {
        cartRepository.deleteAllByUserId(userId);
    }
    
    /**
     * 장바구니에 매물이 있는지 확인
     */
    @Transactional(readOnly = true)
    public boolean isInCart(Long userId, Long propertyId) {
        return cartRepository.existsByUserIdAndPropertyId(userId, propertyId);
    }

    /**
     * 이메일로 사용자 ID 조회
     */
    @Transactional(readOnly = true)
    public Long getUserIdByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + email));
        return user.getUserId();
    }
}
