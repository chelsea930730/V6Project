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

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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
        return loadMyPageData(model, authentication);
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
}
