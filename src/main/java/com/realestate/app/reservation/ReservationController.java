package com.realestate.app.reservation;

import com.realestate.app.property.Property;
import com.realestate.app.property.PropertyService;
import com.realestate.app.user.User;
import com.realestate.app.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.ArrayList;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class ReservationController {
    private final ReservationService reservationService;
    private final PropertyService propertyService;
    private final UserService userService;

    // 예약 폼 페이지 표시
    @GetMapping("/reservation")
    public String reservationForm(@RequestParam(value = "propertyIds", required = false) List<Long> propertyIds, 
                                 Model model,
                                 Authentication authentication) {
        // 로그인 상태 확인
        boolean isLoggedIn = authentication != null && authentication.isAuthenticated() && 
                !authentication.getPrincipal().equals("anonymousUser");
        
        if (!isLoggedIn) {
            return "redirect:/user/login";
        }
        
        // 사용자 정보 가져오기
        String userEmail = null;
        User user = null;
        
        // Principal 객체에서 사용자 이메일 얻기
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            userEmail = ((UserDetails) principal).getUsername();
        } else {
            userEmail = authentication.getName();
        }
        
        // 사용자 정보 조회
        try {
            user = userService.getUserByEmail(userEmail);
        } catch (Exception e) {
            return "redirect:/user/login";
        }
        
        // 빈 예약 객체 생성
        model.addAttribute("reservation", new ReservationDto());
        
        // 선택된 매물이 있는 경우
        List<Property> properties = new ArrayList<>();
        if (propertyIds != null && !propertyIds.isEmpty()) {
            properties = propertyService.findByIds(propertyIds);
            model.addAttribute("properties", properties);
        }
        
        return "mypage/reservation";
    }
    
    // 예약 제출 처리
    @PostMapping("/reservation")
    public String submitReservation(@ModelAttribute("reservation") ReservationDto reservationDto,
                                   @RequestParam(value = "propertyIds", required = false) List<Long> propertyIds,
                                   Authentication authentication,
                                   RedirectAttributes redirectAttributes) {
        // 로그인 상태 확인
        boolean isLoggedIn = authentication != null && authentication.isAuthenticated() && 
                !authentication.getPrincipal().equals("anonymousUser");
        
        if (!isLoggedIn) {
            return "redirect:/user/login";
        }
        
        // 사용자 정보 가져오기
        String userEmail = null;
        User user = null;
        
        // Principal 객체에서 사용자 이메일 얻기
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            userEmail = ((UserDetails) principal).getUsername();
        } else {
            userEmail = authentication.getName();
        }
        
        // 사용자 정보 조회
        try {
            user = userService.getUserByEmail(userEmail);
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "사용자 정보를 찾을 수 없습니다.");
            return "redirect:/user/login";
        }
        
        // 매물 ID가 없는 경우 처리
        if (propertyIds == null || propertyIds.isEmpty()) {
            redirectAttributes.addFlashAttribute("error", "상담 예약할 매물을 선택해주세요.");
            return "redirect:/reservation";
        }
        
        try {
            // 예약 저장
            reservationService.saveReservationWithProperties(reservationDto, propertyIds, user);
            redirectAttributes.addFlashAttribute("success", "상담 예약이 성공적으로 접수되었습니다.");
            return "redirect:/mypage"; // 마이페이지로 리디렉션 변경
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "예약 처리 중 오류가 발생했습니다: " + e.getMessage());
            return "redirect:/reservation";
        }
    }
    
    // 예약 목록 조회
    @GetMapping("/mypage/reservations")
    public String viewReservations(Model model, Authentication authentication) {
        // 로그인 상태 확인
        boolean isLoggedIn = authentication != null && authentication.isAuthenticated() && 
                !authentication.getPrincipal().equals("anonymousUser");
        
        if (!isLoggedIn) {
            return "redirect:/user/login";
        }
        
        // 사용자 정보 가져오기
        String userEmail = null;
        User user = null;
        
        // Principal 객체에서 사용자 이메일 얻기
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            userEmail = ((UserDetails) principal).getUsername();
        } else {
            userEmail = authentication.getName();
        }
        
        // 사용자 정보 조회
        try {
            user = userService.getUserByEmail(userEmail);
            // findByUserId 메서드 사용 (Service에 실제로 있는 메서드)
            List<Reservation> reservations = reservationService.findByUserId(user.getUserId());
            model.addAttribute("reservations", reservations);
        } catch (Exception e) {
            model.addAttribute("error", "예약 정보를 불러오는 중 오류가 발생했습니다.");
            model.addAttribute("reservations", new ArrayList<>());
        }
        
        return "mypage/reservation";
    }
}
