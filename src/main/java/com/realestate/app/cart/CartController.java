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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.ArrayList;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    public String viewCart(Model model, Authentication authentication) {
        // 캐스팅을 시도하지 말고 인증 상태만 확인
        boolean isLoggedIn = false;
        String userEmail = null;
        
        if (authentication != null && authentication.isAuthenticated() && 
                !authentication.getPrincipal().equals("anonymousUser")) {
            
            isLoggedIn = true;
            
            // Principal 객체에서 사용자 이메일(username) 얻기
            Object principal = authentication.getPrincipal();
            
            // 안전한 타입 체크와 캐스팅
            if (principal instanceof UserDetails) {
                userEmail = ((UserDetails) principal).getUsername();
            } else {
                // 다른 타입의 경우 getName() 사용
                userEmail = authentication.getName();
            }
            
            // 로그인된 사용자의 장바구니 아이템 가져오기
            if (userEmail != null) {
                // 이메일로 사용자 ID를 조회한 후 장바구니 아이템 가져오기
                Long userId = cartService.getUserIdByEmail(userEmail);
                List<Property> properties = cartService.getCartItems(userId);
                model.addAttribute("properties", properties);
                
                // 이미지 정보 등 추가 작업
                Map<Long, String> propertyImages = new HashMap<>();
                for (Property property : properties) {
                    propertyImages.put(property.getPropertyId(), property.getThumbnailImage());
                }
                model.addAttribute("propertyImages", propertyImages);
            } else {
                model.addAttribute("properties", new ArrayList<>());
            }
        } else {
            // 로그인하지 않은 경우 빈 목록 표시
            model.addAttribute("properties", new ArrayList<>());
        }
        
        // 로그인 상태 모델에 추가
        model.addAttribute("isLoggedIn", isLoggedIn);
        
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
