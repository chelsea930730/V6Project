package com.realestate.app.admin;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.ui.Model;
import lombok.RequiredArgsConstructor;
import com.realestate.app.property.Property;
import com.realestate.app.property.PropertyService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;
import org.springframework.data.domain.Sort;
import com.realestate.app.reservation.Reservation;
import com.realestate.app.reservation.ReservationService;
import com.realestate.app.reservation.ReservationStatus;
import org.springframework.data.domain.PageImpl;
import java.lang.NumberFormatException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import org.json.JSONArray;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import java.time.YearMonth;
import com.realestate.app.reservation.CancellationCounterRepository;
import com.realestate.app.reservation.CancellationCounter;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.util.ArrayList;
import java.time.format.DateTimeFormatter;

@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final PropertyService propertyService;
    private final ReservationService reservationService;
    private final CancellationCounterRepository cancellationCounterRepository;

    @GetMapping("/dashboard")
    public String dashboard(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Model model) {
        
        // 날짜 파라미터가 없으면 오늘 날짜 사용
        LocalDate selectedDate = date != null ? date : LocalDate.now();
        
        // 총 예약 건수 (모든 상태 포함)
        long totalReservationsCount = reservationService.countAll();
        
        // 상태별 예약 건수
        long activeReservationsCount = reservationService.countByStatus(ReservationStatus.CONFIRMED) + 
                                     reservationService.countByStatus(ReservationStatus.PENDING);
        long completedReservationsCount = reservationService.countByStatus(ReservationStatus.COMPL);
        long cancelledReservationsCount = reservationService.countByStatus(ReservationStatus.CANCELLED);
        
        // 월별 예약 통계 데이터 (그래프용)
        List<Long> monthlyStats = Arrays.asList(15L, 22L, 18L, 25L, 30L, 35L, 28L, 40L, 45L, 38L, 42L, 48L);
        
        // 오늘 예약 목록 (선택된 날짜의 모든 예약)
        // Pageable 객체 생성 - 페이지 사이즈를 충분히 크게 설정하여 모든 예약을 가져옴
        Pageable pageable = PageRequest.of(0, 100, Sort.by("reservedDate").ascending());
        Page<Reservation> dayReservationsPage = reservationService.findByReservedDate(selectedDate, pageable);
        List<Reservation> dayReservations = dayReservationsPage.getContent();
        
        // 현재 월의 예약 있는 날짜들을 하드코딩된 데이터로 대체
        List<String> reservationDates = new ArrayList<>();
        LocalDate now = LocalDate.now();
        // 현재 월의 날짜 중 임의로 5-10개 선택
        int daysInMonth = now.lengthOfMonth();
        int numDates = 5 + (int)(Math.random() * 6); // 5-10개 날짜
        
        for (int i = 0; i < numDates; i++) {
            int day = 1 + (int)(Math.random() * daysInMonth);
            LocalDate randomDate = now.withDayOfMonth(Math.min(day, daysInMonth));
            reservationDates.add(randomDate.format(DateTimeFormatter.ISO_DATE));
        }
        
        // 오늘 날짜도 포함
        reservationDates.add(now.format(DateTimeFormatter.ISO_DATE));
        
        // 중복 제거 및 정렬
        reservationDates = reservationDates.stream()
            .distinct()
            .sorted()
            .collect(Collectors.toList());
        
        // 예약 날짜 JSON 형식으로 변환
        ObjectMapper objectMapper = new ObjectMapper();
        String reservationDatesJson = "[]";
        try {
            reservationDatesJson = objectMapper.writeValueAsString(reservationDates);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        
        // 모델에 데이터 추가
        model.addAttribute("totalReservationsCount", totalReservationsCount);
        model.addAttribute("activeReservationsCount", activeReservationsCount);
        model.addAttribute("completedReservationsCount", completedReservationsCount);
        model.addAttribute("cancelledReservationsCount", cancelledReservationsCount);
        model.addAttribute("monthlyStats", monthlyStats);
        model.addAttribute("dayReservations", dayReservations);
        model.addAttribute("selectedDate", selectedDate);
        model.addAttribute("reservationDatesJson", reservationDatesJson);
        
        return "admin/dashboard";
    }

    @GetMapping("/addproperty")
    public String propertyList(Model model, @RequestParam(defaultValue = "1") int page) {
        // 페이지는 0부터 시작하므로 1을 빼줍니다
        int pageNumber = page - 1;
        // 한 페이지당 8개의 항목, 페이지 크기는 10으로 설정
        Pageable pageable = PageRequest.of(pageNumber, 8);
        Page<Property> propertyPage = propertyService.getAllPropertiesWithPaging(pageable);

        model.addAttribute("properties", propertyPage.getContent());
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", propertyPage.getTotalPages());

        // 페이지 번호 목록 생성 (최대 10개)
        int totalPages = propertyPage.getTotalPages();
        if (totalPages > 0) {
            // 현재 페이지 그룹의 시작과 끝 계산
            int start = Math.max(1, ((page - 1) / 10) * 10 + 1);
            int end = Math.min(totalPages, start + 9);

            List<Integer> pageNumbers = IntStream.rangeClosed(start, end)
                    .boxed()
                    .collect(Collectors.toList());

            model.addAttribute("pageNumbers", pageNumbers);
            model.addAttribute("startPage", start);
            model.addAttribute("endPage", end);
            model.addAttribute("hasNext", end < totalPages);
            model.addAttribute("hasPrevious", start > 1);
            model.addAttribute("nextPageGroup", Math.min(totalPages, end + 1));
            model.addAttribute("previousPageGroup", Math.max(1, start - 10));
        }

        return "admin/addproperty";
    }

    @GetMapping("/create")
    public String createPropertyForm(@RequestParam(required = false) Long id, Model model) {
        if (id != null) {
            Property property = propertyService.getPropertyById(id);
            model.addAttribute("property", property);
        }
        return "admin/create";
    }

    @GetMapping("/consulting")
    public String consulting(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(value = "searchType", required = false) String searchType,
            @RequestParam(value = "search", required = false) String search,
            Model model) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("reservedDate").descending());
        Page<Reservation> reservationsPage;
        
        // 검색어와 필터 조건 적용
        if (search != null && !search.isEmpty() && searchType != null) {
            // 검색 유형에 따른 처리
            switch (searchType) {
                case "name":
                    reservationsPage = reservationService.findByUserNameContaining(search, pageable);
                    break;
                case "email":
                    reservationsPage = reservationService.findByUserEmailContaining(search, pageable);
                    break;
                case "reservationId":
                    try {
                        Long id = Long.parseLong(search);
                        reservationsPage = reservationService.findByReservationId(id, pageable);
                    } catch (NumberFormatException e) {
                        reservationsPage = Page.empty(pageable);
                    }
                    break;
                case "property":
                    // 매물 정보로 검색
                    reservationsPage = reservationService.findByPropertyTitleContaining(search, pageable);
                    break;
                default:
                    reservationsPage = reservationService.findAll(pageable);
            }
        } else if (status != null && !status.isEmpty()) {
            // 상태별 필터링
            try {
                ReservationStatus statusEnum = ReservationStatus.valueOf(status);
                reservationsPage = reservationService.findByStatus(statusEnum, pageable);
            } catch (IllegalArgumentException e) {
                reservationsPage = reservationService.findAll(pageable);
            }
        } else if (startDate != null && endDate != null) {
            // 날짜 범위 필터링
            reservationsPage = reservationService.findByReservedDateBetween(startDate, endDate, pageable);
        } else {
            // 모든 예약 표시 (계약 불가 포함)
            reservationsPage = reservationService.findAll(pageable);
        }
        
        model.addAttribute("reservations", reservationsPage.getContent());
        model.addAttribute("currentPage", reservationsPage.getNumber());
        model.addAttribute("totalPages", reservationsPage.getTotalPages());
        model.addAttribute("status", status == null ? "" : status);
        model.addAttribute("startDate", startDate);
        model.addAttribute("endDate", endDate);
        model.addAttribute("searchType", searchType);
        model.addAttribute("search", search);
        
        return "admin/consulting";
    }

    @GetMapping("/chatManage")
    public String chatManage(Model model) {
        // TODO: 채팅 목록을 가져오는 서비스 로직 구현 필요
        return "admin/chatManage";
    }

    /**
     * 선택한 예약 삭제 처리 (관리자용)
     */
    @PostMapping("/api/admin/reservations/cancel")
    @ResponseBody
    public ResponseEntity<?> adminCancelReservations(@RequestBody Map<String, List<Long>> request) {
        try {
            List<Long> reservationIds = request.get("reservationIds");
            if (reservationIds == null || reservationIds.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "취소할 예약 ID가 제공되지 않았습니다."
                ));
            }

            int cancelledCount = reservationService.deleteReservationsAndMakePropertiesAvailable(reservationIds);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", cancelledCount + "개의 예약이 취소되고 관련 매물이 다시 등록되었습니다.",
                "cancelledCount", cancelledCount
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "예약 취소 처리 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }
}
