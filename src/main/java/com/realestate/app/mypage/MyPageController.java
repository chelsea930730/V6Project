package com.realestate.app.mypage;

import com.realestate.app.reservation.Reservation;
import com.realestate.app.reservation.ReservationService;
import com.realestate.app.reservation.ReservationStatus;
import com.realestate.app.user.User;
import com.realestate.app.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Controller
@RequiredArgsConstructor
public class MyPageController {

    private final ReservationService reservationService;
    private final UserService userService;
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/mypage/mypage.html")
    public String myPageHtml(Model model, Authentication authentication) {
        return loadMyPageData(model, authentication);
    }
    
    @GetMapping("/mypage")
    public String myPage(Model model, Authentication authentication) {
        String userEmail = ((UserDetails) authentication.getPrincipal()).getUsername();
        User user = userService.getUserByEmail(userEmail);
        
        // 진행 중인 예약 (PENDING, CONFIRMED 상태)
        List<Reservation> activeReservations = reservationService.findByUserIdAndStatusIn(
            user.getUserId(), 
            Arrays.asList(ReservationStatus.PENDING, ReservationStatus.CONFIRMED)
        );
        
        // 완료된 예약 (COMPL, CANCELLED 상태)
        List<Reservation> completedReservations = reservationService.findByUserIdAndStatusIn(
            user.getUserId(), 
            Arrays.asList(ReservationStatus.COMPL, ReservationStatus.CANCELLED)
        );
        
        model.addAttribute("activeReservations", activeReservations);
        model.addAttribute("completedReservations", completedReservations);
        model.addAttribute("allReservations", 
            Stream.concat(activeReservations.stream(), completedReservations.stream())
            .collect(Collectors.toList())
        );
        
        return "mypage/mypage";
    }
    
    // 마이페이지 데이터 로드 공통 메서드
    private String loadMyPageData(Model model, Authentication authentication) {
        // 로그인 확인
        if (authentication == null || !authentication.isAuthenticated() || 
                authentication.getPrincipal().equals("anonymousUser")) {
            return "redirect:/user/login";
        }
        
        // 사용자 정보 가져오기
        String userEmail = null;
        User user = null;
        
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            userEmail = ((UserDetails) principal).getUsername();
        } else {
            userEmail = authentication.getName();
        }
        
        try {
            user = userService.getUserByEmail(userEmail);
            
            // 모든 예약 목록을 한번에 가져옴
            List<Reservation> allReservations = reservationService.findByUserId(user.getUserId());
            
            // 활성 예약 (PENDING, CONFIRMED)
            List<Reservation> activeReservations = allReservations.stream()
                .filter(r -> r.getStatus() == ReservationStatus.PENDING || 
                             r.getStatus() == ReservationStatus.CONFIRMED)
                .collect(Collectors.toList());
            
            // 완료된 예약 (COMPL, CANCELLED 포함)
            List<Reservation> completedReservations = allReservations.stream()
                .filter(r -> r.getStatus() == ReservationStatus.COMPL || 
                             r.getStatus() == ReservationStatus.CANCELLED)
                .collect(Collectors.toList());
            
            // 데이터를 모델에 추가
            model.addAttribute("user", user);
            model.addAttribute("activeReservations", activeReservations);
            model.addAttribute("completedReservations", completedReservations);
            model.addAttribute("allReservations", allReservations); // 모든 예약을 포함 (캘린더 표시 등에 사용)
            
            // 성공/오류 메시지 전달 (리디렉션된 경우)
            model.addAttribute("success", model.getAttribute("success"));
            model.addAttribute("error", model.getAttribute("error"));
            
        } catch (Exception e) {
            model.addAttribute("error", "사용자 정보를 불러오는 중 오류가 발생했습니다: " + e.getMessage());
            model.addAttribute("activeReservations", new ArrayList<>());
            model.addAttribute("completedReservations", new ArrayList<>());
            model.addAttribute("allReservations", new ArrayList<>());
        }
        
        return "mypage/mypage";
    }

    /**
     * 체크된 예약 삭제 처리
     */
    @PostMapping("/mypage/delete-reservations")
    @ResponseBody
    public ResponseEntity<?> deleteReservations(@RequestBody Map<String, List<Long>> payload,
                                                Authentication authentication) {
        // 로그인 상태 확인
        if (authentication == null || !authentication.isAuthenticated() || 
            authentication.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
        
        try {
            List<Long> reservationIds = payload.get("reservationIds");
            reservationService.deleteReservations(reservationIds);
            return ResponseEntity.ok().body(Map.of("success", true, "message", "선택한 예약이 삭제되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "예약 삭제 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 예약 상세 정보 조회
     */
    @GetMapping("/mypage/reservation/{reservationId}")
    public String getReservationDetail(@PathVariable Long reservationId, 
                                     Model model,
                                     Authentication authentication) {
        // 로그인 상태 확인
        if (!authentication.isAuthenticated()) {
            return "redirect:/user/login";
        }
        
        // 사용자 정보 가져오기
        String userEmail = ((UserDetails) authentication.getPrincipal()).getUsername();
        
        try {
            // 사용자 정보 조회
            User user = userService.getUserByEmail(userEmail);
            
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

    // 예약 취소 처리
    @PostMapping("/mypage/cancel-reservations")
    @ResponseBody
    public ResponseEntity<?> cancelReservations(@RequestBody Map<String, List<Long>> request,
                                              Authentication authentication) {
        if (!authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            List<Long> reservationIds = request.get("reservationIds");
            reservationService.cancelReservations(reservationIds);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                               .body("예약 취소 처리 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * 관리자용 상담 관리 페이지
     */
    @GetMapping("/admin/consulting-management")
    public String adminConsulting(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Model model) {
        
        // 페이지네이션 설정
        Pageable pageable = PageRequest.of(page, size, Sort.by("reservedDate").descending());
        
        // 모든 예약 목록 조회 (기본값)
        Page<Reservation> reservationsPage = reservationService.findAllReservations(pageable);
        
        // 필터링 조건이 있는 경우 적용
        if (status != null && !status.isEmpty()) {
            try {
                ReservationStatus statusEnum = ReservationStatus.valueOf(status);
                reservationsPage = reservationService.findByStatus(statusEnum, pageable);
            } catch (IllegalArgumentException e) {
                // 잘못된 상태값이 입력된 경우 무시
            }
        }
        
        if (date != null) {
            reservationsPage = reservationService.findByReservedDate(date, pageable);
        }
        
        if (search != null && !search.isEmpty()) {
            reservationsPage = reservationService.findByUserNameOrEmail(search, pageable);
        }
        
        // 모델에 데이터 추가
        model.addAttribute("reservations", reservationsPage.getContent());
        model.addAttribute("currentPage", reservationsPage.getNumber());
        model.addAttribute("totalPages", reservationsPage.getTotalPages());
        model.addAttribute("totalItems", reservationsPage.getTotalElements());
        
        // 필터 파라미터 유지
        model.addAttribute("status", status);
        model.addAttribute("date", date);
        model.addAttribute("search", search);
        
        return "admin/consulting";
    }
    
    /**
     * 예약 상세 정보 API
     */
    @GetMapping("/api/reservations/{id}")
    @ResponseBody
    public ResponseEntity<?> getReservationDetails(@PathVariable Long id) {
        try {
            Reservation reservation = reservationService.findById(id)
                    .orElseThrow(() -> new RuntimeException("예약 정보를 찾을 수 없습니다."));
            
            return ResponseEntity.ok(reservation);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * 예약 상태 변경 API - 숫자 코드로 변경
     */
    @PutMapping("/api/reservations/{id}/status")
    @ResponseBody
    public ResponseEntity<?> updateReservationStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        
        try {
            // statusCode 필드로 숫자 값 받기
            Integer statusCode = (Integer) request.get("statusCode");
            if (statusCode == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "상태 코드가 필요합니다."));
            }
            
            // 상태 코드에 따라 enum 설정
            ReservationStatus status;
            switch(statusCode) {
                case 0:
                    status = ReservationStatus.PENDING;
                    break;
                case 1:
                    status = ReservationStatus.CONFIRMED;
                    break;
                case 2:
                    status = ReservationStatus.COMPL;
                    break;
                case 3:
                    status = ReservationStatus.CANCELLED;
                    break;
                default:
                    return ResponseEntity.badRequest().body(Map.of("error", "잘못된 상태 코드입니다: " + statusCode));
            }
            
            // 예약 상태 업데이트
            Reservation reservation = reservationService.findById(id)
                    .orElseThrow(() -> new RuntimeException("예약 정보를 찾을 수 없습니다."));
            
            reservation.setStatus(status);
            reservationService.saveReservation(reservation);
            
            return ResponseEntity.ok(Map.of(
                "success", true, 
                "message", "상태가 성공적으로 변경되었습니다."
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * 예약 정보 업데이트 API
     */
    @PostMapping("/api/reservations/update")
    @ResponseBody
    public ResponseEntity<?> updateReservation(@RequestBody Map<String, Object> requestData) {
        try {
            Long reservationId = Long.parseLong(requestData.get("reservationId").toString());
            
            Reservation reservation = reservationService.findById(reservationId)
                    .orElseThrow(() -> new RuntimeException("예약 정보를 찾을 수 없습니다."));
            
            // 예약 날짜 업데이트
            if (requestData.containsKey("reservedDate") && requestData.get("reservedDate") != null) {
                String dateStr = requestData.get("reservedDate").toString();
                
                // ISO 형식의 날짜 문자열에서 LocalDate 추출 (YYYY-MM-DD 부분)
                LocalDate reservedDate;
                if (dateStr.contains("T")) {
                    // "YYYY-MM-DDThh:mm:ss" 형식인 경우
                    reservedDate = LocalDate.parse(dateStr.split("T")[0]);
                } else {
                    // "YYYY-MM-DD" 형식인 경우
                    reservedDate = LocalDate.parse(dateStr);
                }
                
                reservation.setReservedDate(reservedDate);
            }
            
            // 상태 업데이트
            if (requestData.containsKey("status") && requestData.get("status") != null) {
                String statusStr = requestData.get("status").toString();
                ReservationStatus status = ReservationStatus.valueOf(statusStr);
                reservation.setStatus(status);
            }
            
            // 메시지 업데이트
            if (requestData.containsKey("message")) {
                reservation.setMessage(requestData.get("message") != null 
                        ? requestData.get("message").toString() 
                        : null);
            }
            
            // 관리자 메모 업데이트
            if (requestData.containsKey("adminNotes")) {
                reservation.setAdminNotes(requestData.get("adminNotes") != null 
                        ? requestData.get("adminNotes").toString() 
                        : null);
            }
            
            reservationService.saveReservation(reservation);
            
            return ResponseEntity.ok(Map.of(
                "success", true, 
                "message", "예약 정보가 성공적으로 업데이트되었습니다."
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 간소화된 예약 상태 변경 API
     */
    @PostMapping("/api/reservations/{id}/status-simple")
    @ResponseBody
    public ResponseEntity<?> updateReservationStatusSimple(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        
        try {
            String status = request.get("status");
            if (status == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "상태값이 필요합니다."));
            }
            
            Reservation reservation = reservationService.findById(id)
                    .orElseThrow(() -> new RuntimeException("예약 정보를 찾을 수 없습니다."));
            
            // 단순 문자열 비교로 상태 설정
            if ("PENDING".equals(status)) {
                reservation.setStatus(ReservationStatus.PENDING);
            } else if ("CONFIRMED".equals(status)) {
                reservation.setStatus(ReservationStatus.CONFIRMED);
            } else if ("COMPL".equals(status)) {
                reservation.setStatus(ReservationStatus.COMPL);
            } else if ("CANCELLED".equals(status)) {
                reservation.setStatus(ReservationStatus.CANCELLED);
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "잘못된 상태값입니다: " + status));
            }
            
            reservationService.saveReservation(reservation);
            
            return ResponseEntity.ok(Map.of(
                "success", true, 
                "message", "상태가 변경되었습니다.",
                "newStatus", status
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 간소화된 예약 정보 업데이트 API
     */
    @PostMapping("/api/reservations/update-simple")
    @ResponseBody
    public ResponseEntity<?> updateReservationSimple(@RequestBody Map<String, Object> requestData) {
        try {
            Long reservationId = Long.parseLong(requestData.get("reservationId").toString());
            
            Reservation reservation = reservationService.findById(reservationId)
                    .orElseThrow(() -> new RuntimeException("예약 정보를 찾을 수 없습니다."));
            
            // 예약 날짜 업데이트
            if (requestData.containsKey("reservedDate") && requestData.get("reservedDate") != null) {
                String dateStr = requestData.get("reservedDate").toString();
                
                // ISO 형식의 날짜 문자열에서 LocalDate 추출
                LocalDate reservedDate;
                if (dateStr.contains("T")) {
                    reservedDate = LocalDate.parse(dateStr.split("T")[0]);
                } else {
                    reservedDate = LocalDate.parse(dateStr);
                }
                
                reservation.setReservedDate(reservedDate);
            }
            
            // 상태 업데이트 - 단순 문자열 비교
            if (requestData.containsKey("status") && requestData.get("status") != null) {
                String status = requestData.get("status").toString();
                
                if ("PENDING".equals(status)) {
                    reservation.setStatus(ReservationStatus.PENDING);
                } else if ("CONFIRMED".equals(status)) {
                    reservation.setStatus(ReservationStatus.CONFIRMED);
                } else if ("COMPL".equals(status)) {
                    reservation.setStatus(ReservationStatus.COMPL);
                } else if ("CANCELLED".equals(status)) {
                    reservation.setStatus(ReservationStatus.CANCELLED);
                }
            }
            
            // 메시지 업데이트
            if (requestData.containsKey("message")) {
                reservation.setMessage(requestData.get("message") != null 
                        ? requestData.get("message").toString() 
                        : null);
            }
            
            // 관리자 메모 업데이트
            if (requestData.containsKey("adminNotes")) {
                reservation.setAdminNotes(requestData.get("adminNotes") != null 
                        ? requestData.get("adminNotes").toString() 
                        : null);
            }
            
            reservationService.saveReservation(reservation);
            
            return ResponseEntity.ok(Map.of(
                "success", true, 
                "message", "예약 정보가 성공적으로 업데이트되었습니다."
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 직접 SQL로 예약 상태 업데이트 (응급 조치)
     */
    @PostMapping("/api/reservations/direct-update")
    @ResponseBody
    public ResponseEntity<?> directUpdateReservation(@RequestBody Map<String, Object> request) {
        try {
            Long reservationId = Long.parseLong(request.get("reservationId").toString());
            String status = request.get("status").toString();
            
            // 직접 JdbcTemplate으로 SQL 실행
            String sql = "UPDATE reservation SET status = ? WHERE reservation_id = ?";
            jdbcTemplate.update(sql, status, reservationId);
            
            return ResponseEntity.ok(Map.of(
                "success", true, 
                "message", "상태가 성공적으로 변경되었습니다."
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 상태만 변경하는 API - 예약은 삭제하지 않음
     */
    @PostMapping("/api/reservations/update-status-only")
    @ResponseBody
    public ResponseEntity<?> updateReservationStatusOnly(@RequestBody Map<String, Object> request) {
        try {
            Long reservationId = Long.valueOf(request.get("reservationId").toString());
            String status = request.get("status").toString();
            
            Reservation reservation = reservationService.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다: " + reservationId));
            
            // 상태 업데이트 (삭제하지 않음)
            ReservationStatus reservationStatus = ReservationStatus.valueOf(status);
            reservation.setStatus(reservationStatus);
            
            // 저장
            reservationService.saveReservation(reservation);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "예약 상태가 성공적으로 변경되었습니다."
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "success", false,
                    "error", "상태 변경 중 오류가 발생했습니다: " + e.getMessage()
                ));
        }
    }
}
