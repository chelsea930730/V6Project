package com.realestate.app.mypage;

import com.realestate.app.reservation.Reservation;
import com.realestate.app.reservation.ReservationService;
import com.realestate.app.reservation.ReservationStatus;
import com.realestate.app.user.User;
import com.realestate.app.user.UserService;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.Arrays;

@Controller
@RequiredArgsConstructor
public class MyPageController {

    private final ReservationService reservationService;
    private final UserService userService;

    @GetMapping("/mypage/mypage.html")
    public String myPageHtml(Model model, Authentication authentication) {
        return loadMyPageData(model, authentication);
    }

    @GetMapping("/mypage")
    public String myPage(Model model, Authentication authentication) {
        String userEmail = ((UserDetails) authentication.getPrincipal()).getUsername();
        User user = userService.getUserByEmail(userEmail);

        // 진행 중인 예약 (PENDING 상태)
        List<Reservation> activeReservations = reservationService.findByUserIdAndStatus(
                user.getUserId(),
                ReservationStatus.PENDING
        );

        // 완료된 예약 (COMPLETED, CANCELLED 상태)
        List<Reservation> completedReservations = reservationService.findByUserIdAndStatusIn(
                user.getUserId(),
                Arrays.asList(ReservationStatus.COMPLETED, ReservationStatus.CANCELLED)
        );

        model.addAttribute("activeReservations", activeReservations);
        model.addAttribute("completedReservations", completedReservations);

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

            // 1. 진행 중인 예약 목록 - 문자열로 상태 비교
            List<Reservation> activeReservations = reservationService.findByUserId(user.getUserId())
                    .stream()
                    .filter(r -> "PENDING".equals(r.getStatus().name()) ||
                            "CONFIRMED".equals(r.getStatus().name()))
                    .collect(Collectors.toList());

            // 2. 완료된 상담 내역 - 문자열로 상태 비교
            List<Reservation> completedReservations = reservationService.findByUserId(user.getUserId())
                    .stream()
                    .filter(r -> "CANCELLED".equals(r.getStatus().name()))
                    .collect(Collectors.toList());

            // 데이터를 모델에 추가
            model.addAttribute("user", user);
            model.addAttribute("activeReservations", activeReservations);
            model.addAttribute("completedReservations", completedReservations);

            // 성공/오류 메시지 전달 (리디렉션된 경우)
            model.addAttribute("success", model.getAttribute("success"));
            model.addAttribute("error", model.getAttribute("error"));

        } catch (Exception e) {
            model.addAttribute("error", "사용자 정보를 불러오는 중 오류가 발생했습니다: " + e.getMessage());
            model.addAttribute("activeReservations", new ArrayList<>());
            model.addAttribute("completedReservations", new ArrayList<>());
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
}