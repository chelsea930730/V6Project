package com.realestate.app.admin;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.realestate.app.property.Property;
import com.realestate.app.property.PropertyDto;
import com.realestate.app.property.PropertyService;
import com.realestate.app.reservation.CancellationCounter;
import com.realestate.app.reservation.CancellationCounterRepository;
import com.realestate.app.reservation.Reservation;
import com.realestate.app.reservation.ReservationService;
import com.realestate.app.reservation.ReservationStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONArray;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.io.IOException;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final PropertyService propertyService;
    private final ReservationService reservationService;
    private final CancellationCounterRepository cancellationCounterRepository;
    private final AdminService adminService;

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

        // 월별 예약 통계 데이터 계산 (컨설팅 페이지 데이터 기반)
        List<Long> monthlyStats = calculateMonthlyStats();

        // 오늘 예약 목록 (선택된 날짜의 모든 예약)
        // Pageable 객체 생성 - 페이지 사이즈를 충분히 크게 설정하여 모든 예약을 가져옴
        Pageable pageable = PageRequest.of(0, 100, Sort.by("reservedDate").ascending());
        Page<Reservation> dayReservationsPage = reservationService.findByReservedDate(selectedDate, pageable);
        List<Reservation> dayReservations = dayReservationsPage.getContent();

        // 현재 월의 예약 있는 날짜들 조회
        // 현재 년월의 첫날과 마지막 날 계산
        LocalDate firstDayOfMonth = selectedDate.withDayOfMonth(1);
        LocalDate lastDayOfMonth = selectedDate.withDayOfMonth(selectedDate.lengthOfMonth());

        // 이번 달의 예약 날짜 조회 (컨설팅 데이터 기반)
        List<String> reservationDates = getReservationDatesForMonth(firstDayOfMonth, lastDayOfMonth);

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

    // 월별 예약 통계 데이터 계산 (현재 연도의 1월부터 12월까지)
    private List<Long> calculateMonthlyStats() {
        List<Long> monthlyStats = new ArrayList<>(12);
        LocalDate today = LocalDate.now();
        int currentYear = today.getYear();

        System.out.println("현재 연도의 월별 예약 통계 계산 시작: " + currentYear);

        // 현재 연도의 1월부터 12월까지 각 달의 예약 수 계산
        for (int month = 1; month <= 12; month++) {
            LocalDate monthStart = LocalDate.of(currentYear, month, 1);
            LocalDate monthEnd = monthStart.withDayOfMonth(monthStart.lengthOfMonth());

            // 모든 예약 목록 가져오기 (Pageable 사용)
            Pageable pageable = PageRequest.of(0, 1000, Sort.by("reservedDate").ascending());
            Page<Reservation> reservationsPage = reservationService.findByReservedDateBetween(monthStart, monthEnd, pageable);
            long count = reservationsPage.getContent().size();

            System.out.println(month + "월의 예약 수: " + count);

            // 해당 월의 예약 수 추가
            monthlyStats.add(count);
        }

        System.out.println("계산된 월별 통계: " + monthlyStats);

        return monthlyStats;
    }

    // 특정 월의 예약 날짜 목록 조회
    private List<String> getReservationDatesForMonth(LocalDate firstDay, LocalDate lastDay) {
        // 해당 월 전체 예약 목록 조회
        Pageable pageable = PageRequest.of(0, 1000, Sort.by("reservedDate").ascending());
        Page<Reservation> reservationsPage = reservationService.findByReservedDateBetween(firstDay, lastDay, pageable);
        List<Reservation> reservations = reservationsPage.getContent();

        // 날짜만 추출하여 중복 제거 후 반환
        DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE;
        return reservations.stream()
            .map(reservation -> reservation.getReservedDate().format(formatter))
            .distinct()
            .collect(Collectors.toList());
    }

    @GetMapping("/addproperty")
    public String propertyList(Model model, 
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(required = false) String searchType,
            @RequestParam(required = false) String keyword) {
        
        int pageNumber = page - 1;
        Pageable pageable = PageRequest.of(pageNumber, 8, Sort.by("createdAt").descending());
        
        // 검색 조건에 따른 매물 목록 조회
        Page<Property> propertyPage;
        if (searchType != null && keyword != null && !keyword.trim().isEmpty()) {
            propertyPage = propertyService.searchProperties(searchType, keyword, pageable);
        } else {
            propertyPage = propertyService.getAllPropertiesWithPaging(pageable);
        }

        model.addAttribute("properties", propertyPage.getContent());
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", propertyPage.getTotalPages());
        model.addAttribute("searchType", searchType);
        model.addAttribute("keyword", keyword);

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
    @PostMapping("/reservations/cancel")
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

    // 매물 목록 페이지 (관리자용)
    @GetMapping("/property/list")
    public String listProperties(Model model) {
        List<PropertyDto> properties = propertyService.getAllPropertyDtos();
        model.addAttribute("properties", properties);
        return "admin/property-list";
    }

    // 매물 등록 폼 페이지
    @GetMapping("/property/create")
    public String showCreateForm(Model model) {
        model.addAttribute("propertyDto", new PropertyDto());
        model.addAttribute("buildingTypes", Property.BuildingType.values());
        model.addAttribute("statusTypes", Property.Status.values());
        return "admin/create";
    }

    // 매물 등록 처리 (유효성 검증 포함)
    @PostMapping("/property/create")
    public String createProperty(
            @Valid @ModelAttribute PropertyDto propertyDto,
            BindingResult bindingResult,
            @RequestParam(value = "thumbnailImage", required = false) MultipartFile thumbnailImage,
            @RequestParam(value = "floorplanImages", required = false) MultipartFile[] floorplanImages,
            @RequestParam(value = "buildingImages", required = false) MultipartFile[] buildingImages,
            @RequestParam(value = "interiorImages", required = false) MultipartFile[] interiorImages,
            @RequestParam(value = "features", required = false) String[] features,
            Model model,
            RedirectAttributes redirectAttributes) {

        // 유효성 검증 실패 시 폼 다시 표시
        if (bindingResult.hasErrors()) {
            log.error("매물 등록 유효성 검증 실패: {}", bindingResult.getAllErrors());
            model.addAttribute("buildingTypes", Property.BuildingType.values());
            model.addAttribute("statusTypes", Property.Status.values());
            return "admin/create";
        }

        try {
            // 이미지 처리 및 특징 처리 로직
            processPropertyImages(propertyDto, thumbnailImage, floorplanImages, buildingImages, interiorImages);
            processFeatures(propertyDto, features);

            // 매물 저장
            PropertyDto savedProperty = propertyService.savePropertyDto(propertyDto);
            redirectAttributes.addFlashAttribute("successMessage", "매물이 성공적으로 등록되었습니다.");
            return "redirect:/admin/property/list";
        } catch (Exception e) {
            log.error("매물 등록 중 오류 발생", e);
            model.addAttribute("errorMessage", "매물 등록에 실패했습니다: " + e.getMessage());
            model.addAttribute("buildingTypes", Property.BuildingType.values());
            model.addAttribute("statusTypes", Property.Status.values());
            return "admin/create";
        }
    }

    // 매물 수정 폼 페이지
    @GetMapping("/property/edit/{id}")
    public String showEditForm(@PathVariable Long id, Model model) {
        try {
            PropertyDto propertyDto = propertyService.getPropertyDtoById(id);
            model.addAttribute("propertyDto", propertyDto);
            model.addAttribute("buildingTypes", Property.BuildingType.values());
            model.addAttribute("statusTypes", Property.Status.values());
            return "admin/create";
        } catch (Exception e) {
            log.error("매물 조회 실패: {}", e.getMessage());
            return "redirect:/admin/property/list";
        }
    }

    // 매물 수정 처리 (유효성 검증 포함)
    @PostMapping("/property/edit/{id}")
    public String updateProperty(
            @PathVariable Long id,
            @Valid @ModelAttribute PropertyDto propertyDto,
            BindingResult bindingResult,
            @RequestParam(value = "thumbnailImage", required = false) MultipartFile thumbnailImage,
            @RequestParam(value = "floorplanImages", required = false) MultipartFile[] floorplanImages,
            @RequestParam(value = "buildingImages", required = false) MultipartFile[] buildingImages,
            @RequestParam(value = "interiorImages", required = false) MultipartFile[] interiorImages,
            @RequestParam(value = "features", required = false) String[] features,
            Model model,
            RedirectAttributes redirectAttributes) {

        // ID 설정
        propertyDto.setPropertyId(id);

        // 유효성 검증 실패 시 폼 다시 표시
        if (bindingResult.hasErrors()) {
            log.error("매물 수정 유효성 검증 실패: {}", bindingResult.getAllErrors());
            model.addAttribute("buildingTypes", Property.BuildingType.values());
            model.addAttribute("statusTypes", Property.Status.values());
            return "admin/create";
        }

        try {
            // 이미지 처리 및 특징 처리 로직
            processPropertyImages(propertyDto, thumbnailImage, floorplanImages, buildingImages, interiorImages);
            processFeatures(propertyDto, features);

            // 매물 저장
            PropertyDto updatedProperty = propertyService.savePropertyDto(propertyDto);
            redirectAttributes.addFlashAttribute("successMessage", "매물이 성공적으로 수정되었습니다.");
            return "redirect:/admin/property/list";
        } catch (Exception e) {
            log.error("매물 수정 중 오류 발생", e);
            model.addAttribute("errorMessage", "매물 수정에 실패했습니다: " + e.getMessage());
            model.addAttribute("buildingTypes", Property.BuildingType.values());
            model.addAttribute("statusTypes", Property.Status.values());
            return "admin/create";
        }
    }

    // 매물 삭제 처리
    @PostMapping("/property/delete/{id}")
    public String deleteProperty(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            propertyService.deleteProperty(id);
            redirectAttributes.addFlashAttribute("successMessage", "매물이 성공적으로 삭제되었습니다.");
        } catch (Exception e) {
            log.error("매물 삭제 중 오류 발생", e);
            redirectAttributes.addFlashAttribute("errorMessage", "매물 삭제에 실패했습니다: " + e.getMessage());
        }
        return "redirect:/admin/property/list";
    }

    // 이미지 처리 메서드
    private void processPropertyImages(
            PropertyDto propertyDto,
            MultipartFile thumbnailImage,
            MultipartFile[] floorplanImages,
            MultipartFile[] buildingImages,
            MultipartFile[] interiorImages) throws IOException {
        
        // 썸네일 이미지 처리
        if (thumbnailImage != null && !thumbnailImage.isEmpty()) {
            String thumbnailUrl = adminService.saveImage(thumbnailImage);
            propertyDto.setThumbnailImage(thumbnailUrl);
        }

        // 평면도 이미지 처리 - 모든 이미지 저장
        if (floorplanImages != null && floorplanImages.length > 0) {
            StringBuilder floorplanUrls = new StringBuilder();
            for (MultipartFile image : floorplanImages) {
                if (image != null && !image.isEmpty()) {
                    String imageUrl = adminService.saveImage(image);
                    if (floorplanUrls.length() > 0) {
                        floorplanUrls.append(",");
                    }
                    floorplanUrls.append(imageUrl);
                }
            }
            propertyDto.setFloorplanImage(floorplanUrls.toString());
        }

        // 건물 이미지 처리 - 모든 이미지 저장
        if (buildingImages != null && buildingImages.length > 0) {
            StringBuilder buildingUrls = new StringBuilder();
            for (MultipartFile image : buildingImages) {
                if (image != null && !image.isEmpty()) {
                    String imageUrl = adminService.saveImage(image);
                    if (buildingUrls.length() > 0) {
                        buildingUrls.append(",");
                    }
                    buildingUrls.append(imageUrl);
                }
            }
            propertyDto.setBuildingImage(buildingUrls.toString());
        }

        // 내부 이미지 처리 - 모든 이미지 저장
        if (interiorImages != null && interiorImages.length > 0) {
            StringBuilder interiorUrls = new StringBuilder();
            for (MultipartFile image : interiorImages) {
                if (image != null && !image.isEmpty()) {
                    String imageUrl = adminService.saveImage(image);
                    if (interiorUrls.length() > 0) {
                        interiorUrls.append(",");
                    }
                    interiorUrls.append(imageUrl);
                }
            }
            propertyDto.setInteriorImage(interiorUrls.toString());
        }
    }

    // 특징 처리 메서드
    private void processFeatures(PropertyDto propertyDto, String[] features) {
        if (features != null && features.length > 0) {
            String description = propertyDto.getDescription() != null ? propertyDto.getDescription() : "";
            StringBuilder featureText = new StringBuilder(description);
            featureText.append("\n\n특징:\n");
            for (String feature : features) {
                featureText.append("- ").append(feature).append("\n");
            }
            propertyDto.setDescription(featureText.toString());
        }
    }
}
