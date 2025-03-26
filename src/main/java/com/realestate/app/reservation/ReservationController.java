package com.realestate.app.reservation;

import com.realestate.app.property.Property;
import com.realestate.app.property.PropertyService;
import com.realestate.app.user.User;
import com.realestate.app.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

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
            
            // ReservationDto에 사용자 정보 미리 설정
            ReservationDto reservationDto = new ReservationDto();
            reservationDto.setName(user.getName());
            reservationDto.setEmail(user.getEmail());
            reservationDto.setPhone(user.getPhone());  // 기존 전화번호가 있다면 설정
            
            model.addAttribute("reservation", reservationDto);
            
            // 선택된 매물이 있는 경우
            if (propertyIds != null && !propertyIds.isEmpty()) {
                List<Property> properties = propertyService.findByIds(propertyIds);
                model.addAttribute("properties", properties);
            }
            
        } catch (Exception e) {
            return "redirect:/user/login";
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
            
            // 전화번호 업데이트
            if (reservationDto.getPhone() != null && !reservationDto.getPhone().isEmpty()) {
                user.setPhone(reservationDto.getPhone());
                userService.updateUser(user);
            }
            
            // 예약 저장
            reservationService.saveReservationWithProperties(reservationDto, propertyIds, user);
            redirectAttributes.addFlashAttribute("success", "상담 예약이 성공적으로 접수되었습니다.");
            return "redirect:/mypage";
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

    /**
     * 예약 상세 정보 조회
     */
    @GetMapping("/reservation/{reservationId}")
    public String getReservationDetail(@PathVariable Long reservationId, 
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
        
        try {
            // 사용자 정보 조회
            user = userService.getUserByEmail(userEmail);
            
            // 예약 정보 조회
            Reservation reservation = reservationService.findById(reservationId)
                    .orElseThrow(() -> new RuntimeException("예약 정보를 찾을 수 없습니다."));
            
            // 본인의 예약만 볼 수 있도록 검증
            if (!reservation.getUser().getUserId().equals(user.getUserId())) {
                return "redirect:/mypage";
            }
            
            model.addAttribute("reservation", reservation);
            
            // 예약에 포함된 매물 정보 추가
            model.addAttribute("properties", reservation.getProperties());
            
            return "mypage/reservationdetail";
        } catch (Exception e) {
            return "redirect:/mypage";
        }
    }

    @PostMapping("/reservation/cancel-selected")
    @ResponseBody
    public ResponseEntity<?> cancelSelectedReservations(@RequestBody Map<String, List<Long>> request,
                                                  Authentication authentication) {
        if (!authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            List<Long> reservationIds = request.get("reservationIds");
            reservationService.cancelReservations(reservationIds);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // 상담 완료된 예약 목록 조회
    @GetMapping("/mypage/completed-reservations")
    public String viewCompletedReservations(Model model, Authentication authentication) {
        String userEmail = ((UserDetails) authentication.getPrincipal()).getUsername();
        User user = userService.getUserByEmail(userEmail);
        
        List<Reservation> completedReservations = reservationService.findByUserIdAndStatus(
            user.getUserId(), 
            ReservationStatus.COMPLETED
        );
        
        model.addAttribute("reservations", completedReservations);
        return "mypage/completed-reservations";
    }
}
