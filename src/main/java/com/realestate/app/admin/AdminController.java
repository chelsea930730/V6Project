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

import java.time.YearMonth;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.time.format.DateTimeFormatter;
import org.springframework.beans.factory.annotation.Autowired;

@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final PropertyService propertyService;
    private final CancellationCounterRepository cancellationCounterRepository;
    private final AdminService adminService;

    @ModelAttribute("propertyDto")
    public PropertyDto propertyDto() {
        return new PropertyDto();
    }

    @Autowired
    private ReservationService reservationService;

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
    public String getConsultingPage(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String searchType,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "AND") String filterCondition,
            @RequestParam(defaultValue = "0") int page,
            Model model) {

        // Pageable 설정
        Pageable pageable = PageRequest.of(page, 10, Sort.by("reservedDate").descending());

        // 결과 페이지
        Page<Reservation> reservationsPage;

        // 항상 AND 조건으로 모든 필터 적용 (기존 서비스 객체 사용)
        reservationsPage = this.reservationService.findAllWithAllFilters(
                status, startDate, endDate, searchType, search, pageable);

        // 모델에 데이터 추가
        model.addAttribute("reservations", reservationsPage.getContent());
        model.addAttribute("currentPage", reservationsPage.getNumber());
        model.addAttribute("totalPages", reservationsPage.getTotalPages());

        // 필터 파라미터 추가 (뷰에서 사용)
        model.addAttribute("status", status);
        model.addAttribute("startDate", startDate);
        model.addAttribute("endDate", endDate);
        model.addAttribute("searchType", searchType);
        model.addAttribute("search", search);
        model.addAttribute("filterCondition", "AND"); // 항상 AND로 설정

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
            @RequestParam(value = "extraImage1", required = false) MultipartFile[] extraImage1,
            @RequestParam(value = "extraImage2", required = false) MultipartFile[] extraImage2,
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
            processPropertyImages(propertyDto, thumbnailImage, floorplanImages, buildingImages, interiorImages, extraImage1, extraImage2);
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
            Property property = propertyService.getPropertyById(id);
            PropertyDto propertyDto = PropertyDto.fromEntity(property);

            // 기존 특징들을 파싱
            List<String> features = new ArrayList<>();
            String description = propertyDto.getDescription();
            if (description != null && description.contains("특징:")) {
                String[] parts = description.split("특징:\n");
                if (parts.length > 1) {
                    String[] featureLines = parts[1].split("\n");
                    for (String line : featureLines) {
                        if (line.startsWith("- ")) {
                            features.add(line.substring(2));
                        }
                    }
                    // 원래 설명만 남기기
                    propertyDto.setDescription(parts[0].trim());
                }
            }

            model.addAttribute("propertyDto", propertyDto);
            model.addAttribute("buildingTypes", Property.BuildingType.values());
            model.addAttribute("statusTypes", Property.Status.values());
            model.addAttribute("selectedFeatures", features);

            // 역 정보 설정
            model.addAttribute("selectedStation", propertyDto.getStation());
            model.addAttribute("selectedLine", propertyDto.getSubwayLine());

            // 건축년도 설정
            model.addAttribute("selectedBuiltYear", propertyDto.getBuiltYear());

            // 이미지 URL 설정
            model.addAttribute("thumbnailImageUrl", propertyDto.getThumbnailImage());
            model.addAttribute("floorplanImageUrls", propertyDto.getFloorplanImage() != null ?
                propertyDto.getFloorplanImage().split(",") : new String[0]);
            model.addAttribute("buildingImageUrls", propertyDto.getBuildingImage() != null ?
                propertyDto.getBuildingImage().split(",") : new String[0]);
            model.addAttribute("interiorImageUrls", propertyDto.getInteriorImage() != null ?
                propertyDto.getInteriorImage().split(",") : new String[0]);
            model.addAttribute("extraImage1Urls", propertyDto.getExtraImage1() != null ?
                propertyDto.getExtraImage1().split(",") : new String[0]);
            model.addAttribute("extraImage2Urls", propertyDto.getExtraImage2() != null ?
                propertyDto.getExtraImage2().split(",") : new String[0]);

            return "admin/create";
        } catch (Exception e) {
            log.error("매물 조회 실패: {}", e.getMessage());
            return "redirect:/admin/addproperty";
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
            @RequestParam(value = "extraImage1", required = false) MultipartFile[] extraImage1,
            @RequestParam(value = "extraImage2", required = false) MultipartFile[] extraImage2,
            @RequestParam(value = "features", required = false) String[] features,
            Model model,
            RedirectAttributes redirectAttributes) {
        try {
            if (bindingResult.hasErrors()) {
                model.addAttribute("buildingTypes", Property.BuildingType.values());
                model.addAttribute("statusTypes", Property.Status.values());
                return "admin/create";
            }

            // 기존 매물 정보 가져오기
            Property existingProperty = propertyService.getPropertyById(id);

            // 이미지가 새로 업로드되지 않은 경우 기존 이미지 URL 유지
            if (thumbnailImage == null || thumbnailImage.isEmpty()) {
                propertyDto.setThumbnailImage(existingProperty.getThumbnailImage());
            }
            if (floorplanImages == null || floorplanImages.length == 0 || floorplanImages[0].isEmpty()) {
                propertyDto.setFloorplanImage(existingProperty.getFloorplanImage());
            }
            if (buildingImages == null || buildingImages.length == 0 || buildingImages[0].isEmpty()) {
                propertyDto.setBuildingImage(existingProperty.getBuildingImage());
            }
            if (interiorImages == null || interiorImages.length == 0 || interiorImages[0].isEmpty()) {
                propertyDto.setInteriorImage(existingProperty.getInteriorImage());
            }
            if (extraImage1 == null || extraImage1.length == 0 || extraImage1[0].isEmpty()) {
                propertyDto.setExtraImage1(existingProperty.getExtraImage1());
            }
            if (extraImage2 == null || extraImage2.length == 0 || extraImage2[0].isEmpty()) {
                propertyDto.setExtraImage2(existingProperty.getExtraImage2());
            }

            // 새로운 이미지가 업로드된 경우에만 이미지 처리
            processPropertyImages(propertyDto, thumbnailImage, floorplanImages, buildingImages, interiorImages, extraImage1, extraImage2);

            // 특징 처리
            processFeatures(propertyDto, features);

            // 매물 ID 설정
            propertyDto.setPropertyId(id);

            // 매물 정보 업데이트
            propertyService.updateProperty(propertyDto);

            redirectAttributes.addFlashAttribute("message", "매물이 성공적으로 수정되었습니다.");
            return "redirect:/admin/addproperty";
        } catch (Exception e) {
            log.error("매물 수정 실패: {}", e.getMessage());
            redirectAttributes.addFlashAttribute("error", "매물 수정에 실패했습니다.");
            return "redirect:/admin/addproperty";
        }
    }

    private void processPropertyImages(
            PropertyDto propertyDto,
            MultipartFile thumbnailImage,
            MultipartFile[] floorplanImages,
            MultipartFile[] buildingImages,
            MultipartFile[] interiorImages,
            MultipartFile[] extraImage1,
            MultipartFile[] extraImage2) throws IOException {

        // 썸네일 이미지 처리
        if (thumbnailImage != null && !thumbnailImage.isEmpty()) {
            String thumbnailUrl = adminService.uploadImage(thumbnailImage);
            propertyDto.setThumbnailImage(thumbnailUrl);
        }

        // 평면도 이미지 처리
        if (floorplanImages != null && floorplanImages.length > 0 && !floorplanImages[0].isEmpty()) {
            List<String> floorplanUrls = Arrays.stream(floorplanImages)
                    .map(file -> {
                        try {
                            return adminService.uploadImage(file);
                        } catch (IOException e) {
                            throw new RuntimeException("이미지 업로드 실패", e);
                        }
                    })
                    .collect(Collectors.toList());
            propertyDto.setFloorplanImage(String.join(",", floorplanUrls));
        }

        // 건물 이미지 처리
        if (buildingImages != null && buildingImages.length > 0 && !buildingImages[0].isEmpty()) {
            List<String> buildingUrls = Arrays.stream(buildingImages)
                    .map(file -> {
                        try {
                            return adminService.uploadImage(file);
                        } catch (IOException e) {
                            throw new RuntimeException("이미지 업로드 실패", e);
                        }
                    })
                    .collect(Collectors.toList());
            propertyDto.setBuildingImage(String.join(",", buildingUrls));
        }

        // 내부 이미지 처리
        if (interiorImages != null && interiorImages.length > 0 && !interiorImages[0].isEmpty()) {
            List<String> interiorUrls = Arrays.stream(interiorImages)
                    .map(file -> {
                        try {
                            return adminService.uploadImage(file);
                        } catch (IOException e) {
                            throw new RuntimeException("이미지 업로드 실패", e);
                        }
                    })
                    .collect(Collectors.toList());
            propertyDto.setInteriorImage(String.join(",", interiorUrls));
        }

        // 추가 이미지 1 처리
        if (extraImage1 != null && extraImage1.length > 0 && !extraImage1[0].isEmpty()) {
            List<String> extraUrls1 = Arrays.stream(extraImage1)
                    .map(file -> {
                        try {
                            return adminService.uploadImage(file);
                        } catch (IOException e) {
                            throw new RuntimeException("이미지 업로드 실패", e);
                        }
                    })
                    .collect(Collectors.toList());
            propertyDto.setExtraImage1(String.join(",", extraUrls1));
        }

        // 추가 이미지 2 처리
        if (extraImage2 != null && extraImage2.length > 0 && !extraImage2[0].isEmpty()) {
            List<String> extraUrls2 = Arrays.stream(extraImage2)
                    .map(file -> {
                        try {
                            return adminService.uploadImage(file);
                        } catch (IOException e) {
                            throw new RuntimeException("이미지 업로드 실패", e);
                        }
                    })
                    .collect(Collectors.toList());
            propertyDto.setExtraImage2(String.join(",", extraUrls2));
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
}
