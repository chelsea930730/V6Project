package com.realestate.app.reservation;

import com.realestate.app.property.Property;
import com.realestate.app.property.PropertyService;
import com.realestate.app.user.User;
import com.realestate.app.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import jakarta.validation.Valid;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;

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
    public String submitReservation(@Valid @ModelAttribute("reservation") ReservationDto reservationDto,
                                   BindingResult bindingResult,
                                   @RequestParam(value = "propertyIds", required = false) List<Long> propertyIds,
                                   Authentication authentication,
                                   Model model,
                                   RedirectAttributes redirectAttributes) {
        // 로그인 상태 확인
        boolean isLoggedIn = authentication != null && authentication.isAuthenticated() && 
                !authentication.getPrincipal().equals("anonymousUser");
        
        if (!isLoggedIn) {
            return "redirect:/user/login";
        }
        
        // 유효성 검증 실패 시 폼 다시 표시
        if (bindingResult.hasErrors()) {
            // 선택된 매물이 있는 경우
            if (propertyIds != null && !propertyIds.isEmpty()) {
                List<Property> properties = propertyService.findByIds(propertyIds);
                model.addAttribute("properties", properties);
            }
            return "mypage/reservation";
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
            
            // propertyIds가 null이거나 비어있을 경우에도 처리할 수 있도록 수정
            if (propertyIds == null) {
                propertyIds = new ArrayList<>();
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
            ReservationStatus.COMPL
        );
        
        model.addAttribute("reservations", completedReservations);
        return "mypage/completed-reservations";
    }

    @GetMapping("/api/reservations/recent")
    @ResponseBody
    public List<ReservationDto> getRecentReservations(
            @RequestParam(value = "days", required = false, defaultValue = "0") int days) {
        // 현재 로그인한 사용자 정보 가져오기
        String userEmail = SecurityUtils.getCurrentUserEmail();
        if (userEmail == null) {
            return Collections.emptyList();
        }
        
        // 오늘 날짜 기준으로 계산
        LocalDate today = LocalDate.now();
        LocalDate startDate = days > 0 ? today.minusDays(days) : today;
        
        // 서비스 호출하여 데이터 가져오기
        return reservationService.getReservationsByUserAndDateRange(userEmail, startDate, today);
    }

    @GetMapping("/api/reservations/count")
    @ResponseBody
    public Map<String, Integer> getReservationCount() {
        try {
            String userEmail = SecurityUtils.getCurrentUserEmail();
            int count = 0;
            
            if (userEmail != null) {
                // 권한 확인
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                boolean isAdmin = authentication != null && 
                                 authentication.getAuthorities().stream()
                                     .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
                
                if (isAdmin) {
                    // 오늘 날짜로부터 30일 이내의 모든 예약
                    LocalDate today = LocalDate.now();
                    LocalDate endDate = today.plusDays(30);
                    
                    // 모든 사용자의 예약 조회
                    // 여기서 오류 발생: Pageable 매개변수가 필요함
                    // 수정: 올바른 메서드 호출로 변경
                    
                    // 예약 개수만 필요하므로 countReservationsByDateRange 메서드를 사용
                    count = (int) reservationService.countReservationsByDateRange(today, endDate);
                    
                    // 또는 다른 방법으로 필요한 정보를 얻을 수 있음:
                    // List<ReservationDto> reservations = reservationService.getAllUpcomingReservations(today, endDate);
                    // count = reservations.size();
                } else {
                    count = reservationService.countReservationsByUser(userEmail);
                }
            }
            
            Map<String, Integer> result = new HashMap<>();
            result.put("count", count);
            return result;
        } catch (Exception e) {
            // 오류 로깅
            e.printStackTrace();
            // 오류 발생 시 기본값 반환
            return Collections.singletonMap("count", 0);
        }
    }

    @GetMapping("/api/reservations/upcoming")
    @ResponseBody
    public List<ReservationDto> getUserUpcomingReservations(
            @RequestParam(value = "days", required = false, defaultValue = "0") int days) {
        // 현재 로그인한 사용자의 이메일 가져오기
        String userEmail = SecurityUtils.getCurrentUserEmail();
        if (userEmail == null) {
            return Collections.emptyList();
        }
        
        // 날짜 범위 계산
        LocalDate today = LocalDate.now();
        LocalDate endDate = days > 0 ? today.plusDays(days) : today;
        
        // 사용자의 예약만 조회
        return reservationService.getUpcomingReservationsByUser(userEmail, today, endDate);
    }

    @GetMapping("/api/reservations/admin/upcoming")
    @ResponseBody
    @PreAuthorize("hasRole('ROLE_ADMIN')")  // 또는 @Secured("ROLE_ADMIN")
    public List<ReservationDto> getAllUpcomingReservations(
            @RequestParam(value = "days", required = false, defaultValue = "0") int days) {
        try {
            // 날짜 범위 계산
            LocalDate today = LocalDate.now();
            LocalDate endDate = days > 0 ? today.plusDays(days) : today;
            
            // 모든 사용자의 예약 조회
            return reservationService.getAllUpcomingReservations(today, endDate);
        } catch (Exception e) {
            // 디버깅을 위한 로그 추가
            e.printStackTrace();
            // 빈 리스트 반환 또는 적절한 오류 처리
            return Collections.emptyList();
        }
    }
}
