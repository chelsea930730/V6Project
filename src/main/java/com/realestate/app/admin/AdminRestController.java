package com.realestate.app.admin;

import com.realestate.app.reservation.ReservationService;
import com.realestate.app.reservation.Reservation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminRestController {

    private final ReservationService reservationService;

    public AdminRestController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @GetMapping("/reservations/dates")
    public List<String> getReservationDates(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        // 해당 기간의 예약 날짜 조회
        Pageable pageable = PageRequest.of(0, 1000, Sort.by("reservedDate").ascending());
        Page<Reservation> reservationsPage = reservationService.findByReservedDateBetween(startDate, endDate, pageable);
        List<Reservation> reservations = reservationsPage.getContent();

        // 날짜만 추출하여 중복 제거 후 반환
        return reservations.stream()
                .map(reservation -> {
                    // toString()으로 변환 후 YYYY-MM-DD 부분만 추출
                    if (reservation.getReservedDate() != null) {
                        String dateStr = reservation.getReservedDate().toString();
                        // 날짜 부분만 추출 (처음 10자리 - YYYY-MM-DD 형식)
                        return dateStr.length() >= 10 ? dateStr.substring(0, 10) : "";
                    }
                    return "";
                })
                .filter(date -> !date.isEmpty())
                .distinct()
                .collect(Collectors.toList());
    }
}