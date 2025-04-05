package com.realestate.app.admin;

import com.realestate.app.reservation.ReservationService;
import com.realestate.app.reservation.ReservationStatus; // 정확한 import path 확인
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminStatisticsController {

    private final ReservationService reservationService;
    
    @Autowired
    public AdminStatisticsController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }
    
    @GetMapping("/statistics/month/{month}")
    public ResponseEntity<Map<String, Long>> getMonthlyStatistics(@PathVariable int month) {
        try {
            // 현재 연도 가져오기
            int year = LocalDate.now().getYear();
            
            // 월 값 검증 (1-12 사이)
            if (month < 1 || month > 12) {
                return ResponseEntity.badRequest().build();
            }
            
            // 월의 시작일과 종료일 계산
            LocalDate startDate = LocalDate.of(year, month, 1);
            LocalDate endDate = startDate.plusMonths(1).minusDays(1);
            
            // 해당 월의 통계 데이터 조회
            long totalReservationsCount = reservationService.countReservationsByDateRange(startDate, endDate);
            long activeReservationsCount = reservationService.countReservationsByDateRangeAndStatuses(
                    startDate, endDate, List.of(ReservationStatus.PENDING, ReservationStatus.CONFIRMED));
            long completedReservationsCount = reservationService.countReservationsByDateRangeAndStatuses(
                    startDate, endDate, List.of(ReservationStatus.COMPL));
            long cancelledReservationsCount = reservationService.countReservationsByDateRangeAndStatuses(
                    startDate, endDate, List.of(ReservationStatus.CANCELLED));
            
            // 결과 맵 생성
            Map<String, Long> result = new HashMap<>();
            result.put("totalReservationsCount", totalReservationsCount);
            result.put("activeReservationsCount", activeReservationsCount);
            result.put("completedReservationsCount", completedReservationsCount);
            result.put("cancelledReservationsCount", cancelledReservationsCount);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            // 오류 로깅
            System.err.println("월별 통계 조회 오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/statistics/year/{year}/month/{month}")
    public ResponseEntity<Map<String, Long>> getYearMonthStatistics(
            @PathVariable int year, 
            @PathVariable int month) {
        try {
            // 월 값 검증 (1-12 사이)
            if (month < 1 || month > 12) {
                return ResponseEntity.badRequest().build();
            }
            
            // 월의 시작일과 종료일 계산
            LocalDate startDate = LocalDate.of(year, month, 1);
            LocalDate endDate = startDate.plusMonths(1).minusDays(1);
            
            // 해당 월의 통계 데이터 조회
            long totalReservationsCount = reservationService.countReservationsByDateRange(startDate, endDate);
            long activeReservationsCount = reservationService.countReservationsByDateRangeAndStatuses(
                    startDate, endDate, List.of(ReservationStatus.PENDING, ReservationStatus.CONFIRMED));
            long completedReservationsCount = reservationService.countReservationsByDateRangeAndStatuses(
                    startDate, endDate, List.of(ReservationStatus.COMPL));
            long cancelledReservationsCount = reservationService.countReservationsByDateRangeAndStatuses(
                    startDate, endDate, List.of(ReservationStatus.CANCELLED));
            
            // 결과 맵 생성
            Map<String, Long> result = new HashMap<>();
            result.put("totalReservationsCount", totalReservationsCount);
            result.put("activeReservationsCount", activeReservationsCount);
            result.put("completedReservationsCount", completedReservationsCount);
            result.put("cancelledReservationsCount", cancelledReservationsCount);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            // 오류 로깅
            System.err.println("연월별 통계 조회 오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/reservations/month")
    public ResponseEntity<?> getMonthReservations(
            @RequestParam(defaultValue = "0") int year,
            @RequestParam(defaultValue = "0") int month) {
        
        try {
            // 연도나 월이 지정되지 않은 경우 현재 연월 사용
            if (year <= 0) {
                year = LocalDate.now().getYear();
            }
            if (month <= 0 || month > 12) {
                month = LocalDate.now().getMonthValue();
            }
            
            // 월의 시작일과 종료일 계산
            LocalDate startDate = LocalDate.of(year, month, 1);
            LocalDate endDate = startDate.plusMonths(1).minusDays(1);
            
            // 해당 월의 예약 목록 조회
            return ResponseEntity.ok(reservationService.getReservationsByDateRange(startDate, endDate));
        } catch (Exception e) {
            System.err.println("월별 예약 조회 오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
