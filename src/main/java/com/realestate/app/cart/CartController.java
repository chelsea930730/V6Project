package com.realestate.app.cart;

import com.realestate.app.config.AuthenticatedUser;
import com.realestate.app.property.Property;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import com.realestate.app.property.PropertyImageRepository;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

@Controller
@RequiredArgsConstructor
@RequestMapping("/cart")
public class CartController {

    private final CartService cartService;
    private final PropertyImageRepository propertyImageRepository;

    /**
     * 장바구니 목록 조회
     */
    @GetMapping
    public String viewCart(@AuthenticationPrincipal AuthenticatedUser authenticatedUser, Model model) {
        if (authenticatedUser == null) {
            return "redirect:/user/login";
        }
        
        Long userId = getUserIdFromAuthenticatedUser(authenticatedUser);
        List<Property> cartItems = cartService.getCartItems(userId);
        
        // 각 매물에 대한 이미지 정보 로드
        Map<Long, String> propertyImages = new HashMap<>();
        for (Property property : cartItems) {
            // 첫 번째 이미지만 가져오는 예시
            String imageUrl = propertyImageRepository.findFirstImageUrlByPropertyId(property.getPropertyId());
            propertyImages.put(property.getPropertyId(), 
                imageUrl != null ? imageUrl : "/img/property-placeholder.jpg");
        }
        
        model.addAttribute("properties", cartItems);
        model.addAttribute("propertyImages", propertyImages);
        
        return "cart/cart";
    }

    /**
     * 장바구니에 매물 추가
     */
    @PostMapping("/add")
    public String addToCart(@AuthenticationPrincipal AuthenticatedUser authenticatedUser,
                           @RequestParam("propertyIds") List<Long> propertyIds,
                           RedirectAttributes redirectAttributes) {
        if (authenticatedUser == null) {
            return "redirect:/user/login"; // 로그인 경로 수정
        }
        
        Long userId = getUserIdFromAuthenticatedUser(authenticatedUser);
        cartService.addMultipleToCart(userId, propertyIds);
        redirectAttributes.addFlashAttribute("message", propertyIds.size() + "개의 매물이 장바구니에 추가되었습니다.");
        return "redirect:/property/list";
    }

    /**
     * 장바구니에서 매물 제거
     */
    @PostMapping("/remove")
    public String removeFromCart(@AuthenticationPrincipal AuthenticatedUser authenticatedUser,
                                @RequestParam("propertyId") Long propertyId,
                                RedirectAttributes redirectAttributes) {
        if (authenticatedUser == null) {
            return "redirect:/user/login"; // 로그인 경로 수정
        }
        
        Long userId = getUserIdFromAuthenticatedUser(authenticatedUser);
        cartService.removeFromCart(userId, propertyId);
        redirectAttributes.addFlashAttribute("message", "매물이 장바구니에서 제거되었습니다.");
        return "redirect:/cart";
    }

    /**
     * 장바구니 비우기
     */
    @PostMapping("/clear")
    public String clearCart(@AuthenticationPrincipal AuthenticatedUser authenticatedUser,
                           RedirectAttributes redirectAttributes) {
        if (authenticatedUser == null) {
            return "redirect:/user/login"; // 로그인 경로 수정
        }
        
        Long userId = getUserIdFromAuthenticatedUser(authenticatedUser);
        cartService.clearCart(userId);
        redirectAttributes.addFlashAttribute("message", "장바구니가 비워졌습니다.");
        return "redirect:/cart";
    }

    /**
     * 선택한 매물 삭제 (AJAX)
     */
    @PostMapping("/remove-selected")
    @ResponseBody
    public ResponseEntity<?> removeSelectedFromCart(@AuthenticationPrincipal AuthenticatedUser authenticatedUser,
                                                    @RequestBody Map<String, List<Long>> request) {
        if (authenticatedUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        Long userId = getUserIdFromAuthenticatedUser(authenticatedUser);
        List<Long> propertyIds = request.get("propertyIds");
        
        if (propertyIds == null || propertyIds.isEmpty()) {
            return ResponseEntity.badRequest().body("선택된 매물이 없습니다.");
        }
        
        for (Long propertyId : propertyIds) {
            cartService.removeFromCart(userId, propertyId);
        }
        
        return ResponseEntity.ok().build();
    }
    
    /**
     * AuthenticatedUser에서 userId를 추출하는 유틸리티 메서드
     */
    private Long getUserIdFromAuthenticatedUser(AuthenticatedUser authenticatedUser) {
        // AuthenticatedUser가 User 객체에 직접 접근할 수 있도록 메서드 추가 필요
        String email = authenticatedUser.getUsername();
        // 이메일로 userId를 찾아오는 서비스 메서드 호출 필요
        return cartService.getUserIdByEmail(email);
    }
}
