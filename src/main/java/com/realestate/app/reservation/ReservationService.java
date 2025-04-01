package com.realestate.app.reservation;

import com.realestate.app.admin.CancellationStatistics;
import com.realestate.app.admin.CancellationStatisticsRepository;
import com.realestate.app.property.Property;
import com.realestate.app.property.PropertyRepository;
import com.realestate.app.property.PropertyService;
import com.realestate.app.user.User;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;

import org.springframework.data.jpa.domain.Specification;
import com.realestate.app.reservation.SecurityUtils;

import java.util.ArrayList;

@Service
@AllArgsConstructor
@Transactional
public class ReservationService {
    private final ReservationRepository reservationRepository;
    private final PropertyService propertyService;
    private final CancellationCounterRepository cancellationCounterRepository;
    private final PropertyRepository propertyRepository;
    private final CancellationStatisticsRepository cancellationStatisticsRepository;

    public void saveReservation(Reservation reservation) {
        reservationRepository.save(reservation);
    }

    public List<Reservation> findByUserId(Long userId) {
        return reservationRepository.findByUser_UserId(userId);
    }

    // POST로 전송된 예약 정보 저장
    @Transactional
    public void saveReservationWithProperties(ReservationDto dto, List<Long> propertyIds, User user) {
        // 하나의 예약 생성
        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setReservedDate(LocalDate.from(dto.getReservedDate()));
        reservation.setStatus(ReservationStatus.PENDING);
        
        // message 필드 설정
        reservation.setMessage(dto.getMessage());
        
        // 모든 매물을 예약에 추가
        for (Long propertyId : propertyIds) {
            Property property = propertyService.getPropertyById(propertyId);
            
            // 매물을 예약 상태로 변경
            property.setReserved(true);
            propertyService.saveProperty(property);
            
            reservation.addProperty(property);
        }
        
        // 하나의 예약 저장
        reservationRepository.save(reservation);
    }

    /**
     * 선택된 예약 ID 목록에 해당하는 예약들을 삭제합니다.
     * @param reservationIds 삭제할 예약 ID 목록
     */
    @Transactional
    public void deleteReservations(List<Long> reservationIds) {
        if (reservationIds != null && !reservationIds.isEmpty()) {
            reservationRepository.deleteAllById(reservationIds);
        }
    }

    /**
     * 예약 ID로 예약 정보를 조회합니다.
     * @param reservationId 조회할 예약 ID
     * @return 예약 정보
     */
    public java.util.Optional<Reservation> findById(Long reservationId) {
        return reservationRepository.findById(reservationId);
    }

    @Transactional
    public void cancelReservations(List<Long> reservationIds) {
        List<Reservation> reservations = reservationRepository.findAllById(reservationIds);
        
        for (Reservation reservation : reservations) {
            // PENDING 상태인 예약만 취소 가능
            if (reservation.getStatus() == ReservationStatus.PENDING) {
                reservation.setStatus(ReservationStatus.CANCELLED);
            }
        }
        
        reservationRepository.saveAll(reservations);
    }

    public List<Reservation> findByUserIdAndActiveStatus(Long userId) {
        return reservationRepository.findByUser_UserIdAndStatus(userId, ReservationStatus.PENDING);
    }

    public List<Reservation> findByUserIdAndCompletedStatuses(Long userId) {
        return reservationRepository.findByUser_UserIdAndStatusIn(userId, 
            Arrays.asList(ReservationStatus.COMPL, ReservationStatus.CANCELLED));
    }

    // 특정 사용자의 특정 상태 예약 조회 메소드 추가
    public List<Reservation> findByUserIdAndStatus(Long userId, ReservationStatus status) {
        return reservationRepository.findByUser_UserIdAndStatus(userId, status);
    }

    // 특정 사용자의 여러 상태 예약 조회 메소드 추가
    public List<Reservation> findByUserIdAndStatusIn(Long userId, List<ReservationStatus> statuses) {
        return reservationRepository.findByUser_UserIdAndStatusIn(userId, statuses);
    }

    // 모든 예약 조회 (페이징)
    public Page<Reservation> findAllReservations(Pageable pageable) {
        return reservationRepository.findAll(pageable);
    }

    // 상태로 예약 조회 (페이징)
    public Page<Reservation> findByStatus(ReservationStatus status, Pageable pageable) {
        return reservationRepository.findByStatus(status, pageable);
    }

    // 날짜 범위로 예약 조회 (페이징)
    public Page<Reservation> findByDateBetween(LocalDateTime start, LocalDateTime end, Pageable pageable) {
        return reservationRepository.findByReservedDateBetween(start, end, pageable);
    }

    // 사용자 이름 또는 이메일로 예약 조회 (페이징)
    public Page<Reservation> findByUserNameOrEmail(String search, Pageable pageable) {
        return reservationRepository.findByUserNameContainingOrUserEmailContaining(search, search, pageable);
    }

    // LocalDate를 사용하는 메소드 추가
    public Page<Reservation> findByReservedDate(LocalDate date, Pageable pageable) {
        return reservationRepository.findByReservedDate(date, pageable);
    }

    // 필요한 메서드들 추가
    public Page<Reservation> findAll(Pageable pageable) {
        return reservationRepository.findAll(pageable);
    }

    public Page<Reservation> findByStatus(ReservationStatus status, String search, Pageable pageable) {
        if (search != null && !search.isEmpty()) {
            return reservationRepository.findByStatusAndUserNameContainingOrUserEmailContaining(
                status, search, search, pageable);
        }
        return reservationRepository.findByStatus(status, pageable);
    }

    public Page<Reservation> findByDate(LocalDate date, String search, Pageable pageable) {
        if (search != null && !search.isEmpty()) {
            return reservationRepository.findByReservedDateAndUserNameContainingOrUserEmailContaining(
                date, search, search, pageable);
        }
        return reservationRepository.findByReservedDate(date, pageable);
    }

    public Page<Reservation> findByStatusAndDate(ReservationStatus status, LocalDate date, Pageable pageable) {
        return reservationRepository.findByStatusAndReservedDate(status, date, pageable);
    }

    public Page<Reservation> findByStatusAndDate(ReservationStatus status, LocalDate date, String search, Pageable pageable) {
        if (search != null && !search.isEmpty()) {
            return reservationRepository.findByStatusAndReservedDateAndUserNameContainingOrUserEmailContaining(
                status, date, search, search, pageable);
        }
        return reservationRepository.findByStatusAndReservedDate(status, date, pageable);
    }

    public Page<Reservation> findBySearch(String search, Pageable pageable) {
        return reservationRepository.findByUserNameContainingOrUserEmailContaining(search, search, pageable);
    }

    public Page<Reservation> findByStatusAndDateAndUserInfo(ReservationStatus statusEnum, LocalDate date, String search, Pageable pageable) {
        if (search != null && !search.isEmpty()) {
            return reservationRepository.findByStatusAndReservedDateAndUserNameContainingOrUserEmailContaining(
                statusEnum, date, search, search, pageable);
        }
        return reservationRepository.findByStatusAndReservedDate(statusEnum, date, pageable);
    }

    public Page<Reservation> findByStatusAndUserInfo(ReservationStatus statusEnum, String search, Pageable pageable) {
        if (search != null && !search.isEmpty()) {
            return reservationRepository.findByStatusAndUserNameContainingOrUserEmailContaining(
                statusEnum, search, search, pageable);
        }
        return reservationRepository.findByStatus(statusEnum, pageable);
    }

    public Page<Reservation> findByDateAndUserInfo(LocalDate date, String search, Pageable pageable) {
        if (search != null && !search.isEmpty()) {
            return reservationRepository.findByReservedDateAndUserNameContainingOrUserEmailContaining(
                date, search, search, pageable);
        }
        return reservationRepository.findByReservedDate(date, pageable);
    }

    // 날짜 범위로 예약 검색
    public Page<Reservation> findByDateRange(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        return reservationRepository.findByReservedDateBetween(startDate, endDate, pageable);
    }

    // 상태와 날짜 범위로 예약 검색
    public Page<Reservation> findByStatusAndDateRange(ReservationStatus status, LocalDate startDate, LocalDate endDate, Pageable pageable) {
        return reservationRepository.findByStatusAndReservedDateBetween(status, startDate, endDate, pageable);
    }

    // 메시지 내용으로 예약 검색
    public Page<Reservation> findByMessageContaining(String message, Pageable pageable) {
        return reservationRepository.findByMessageContaining(message, pageable);
    }

    // 관리자 메모로 예약 검색
    public Page<Reservation> findByAdminNotesContaining(String adminNotes, Pageable pageable) {
        return reservationRepository.findByAdminNotesContaining(adminNotes, pageable);
    }

    // 상태와 메시지 내용으로 예약 검색
    public Page<Reservation> findByStatusAndMessageContaining(ReservationStatus status, String message, Pageable pageable) {
        return reservationRepository.findByStatusAndMessageContaining(status, message, pageable);
    }

    // 상태와 관리자 메모로 예약 검색
    public Page<Reservation> findByStatusAndAdminNotesContaining(ReservationStatus status, String adminNotes, Pageable pageable) {
        return reservationRepository.findByStatusAndAdminNotesContaining(status, adminNotes, pageable);
    }

    // 날짜 범위와 메시지 내용으로 예약 검색
    public Page<Reservation> findByDateRangeAndMessageContaining(LocalDate startDate, LocalDate endDate, String message, Pageable pageable) {
        return reservationRepository.findByReservedDateBetweenAndMessageContaining(startDate, endDate, message, pageable);
    }

    // 날짜 범위와 관리자 메모로 예약 검색
    public Page<Reservation> findByDateRangeAndAdminNotesContaining(LocalDate startDate, LocalDate endDate, String adminNotes, Pageable pageable) {
        return reservationRepository.findByReservedDateBetweenAndAdminNotesContaining(startDate, endDate, adminNotes, pageable);
    }

    // 날짜 범위와 사용자 정보로 예약 검색
    public Page<Reservation> findByDateRangeAndUserInfo(LocalDate startDate, LocalDate endDate, String search, Pageable pageable) {
        return reservationRepository.findByReservedDateBetweenAndUserNameContainingOrReservedDateBetweenAndUserEmailContaining(
            startDate, endDate, search, startDate, endDate, search, pageable);
    }

    // 상태, 날짜 범위, 메시지 내용으로 예약 검색
    public Page<Reservation> findByStatusAndDateRangeAndMessageContaining(ReservationStatus status, LocalDate startDate, LocalDate endDate, String message, Pageable pageable) {
        return reservationRepository.findByStatusAndReservedDateBetweenAndMessageContaining(status, startDate, endDate, message, pageable);
    }

    // 상태, 날짜 범위, 관리자 메모로 예약 검색
    public Page<Reservation> findByStatusAndDateRangeAndAdminNotesContaining(ReservationStatus status, LocalDate startDate, LocalDate endDate, String adminNotes, Pageable pageable) {
        return reservationRepository.findByStatusAndReservedDateBetweenAndAdminNotesContaining(status, startDate, endDate, adminNotes, pageable);
    }

    // 상태, 날짜 범위, 사용자 정보로 예약 검색
    public Page<Reservation> findByStatusAndDateRangeAndUserInfo(ReservationStatus status, LocalDate startDate, LocalDate endDate, String search, Pageable pageable) {
        return reservationRepository.findByStatusAndReservedDateBetweenAndUserNameContainingOrStatusAndReservedDateBetweenAndUserEmailContaining(
            status, startDate, endDate, search, status, startDate, endDate, search, pageable);
    }

    // 예약 ID로 검색
    public Page<Reservation> findByReservationId(Long reservationId, Pageable pageable) {
        Optional<Reservation> reservation = reservationRepository.findById(reservationId);
        if (reservation.isPresent()) {
            // 단일 결과를 페이지로 변환
            return new PageImpl<>(List.of(reservation.get()), pageable, 1);
        } else {
            return Page.empty(pageable);
        }
    }

    // 매물 정보(제목, 위치)로 검색
    public Page<Reservation> findByPropertyTitleOrLocation(String search, Pageable pageable) {
        return reservationRepository.findByPropertiesTitleContainingOrPropertiesLocationContaining(search, search, pageable);
    }

    // 상태별 예약 개수 조회
    public long countByStatus(ReservationStatus status) {
        return reservationRepository.countByStatus(status);
    }

    // 여러 상태에 해당하는 예약 개수 조회
    public long countByStatusIn(List<ReservationStatus> statuses) {
        return reservationRepository.countByStatusIn(statuses);
    }

    /**
     * 특정 날짜 범위 내의 모든 예약 수 조회 (새로운 방식)
     */
    public long countByDateRange(LocalDate startDate, LocalDate endDate) {
        return reservationRepository.countAllReservationsByDateRange(startDate, endDate);
    }

    /**
     * 특정 날짜 범위 내의 모든 예약이 있는 날짜들 조회 (새로운 방식)
     */
    public List<LocalDate> findDistinctDatesInRange(LocalDate startDate, LocalDate endDate) {
        return reservationRepository.findDistinctDatesWithReservations(startDate, endDate);
    }

    /**
     * 관리자가 선택한 예약을 취소하고 매물을 다시 등록합니다.
     * 이 메서드는 예약을 실제로 삭제하고 취소 카운터를 증가시킵니다.
     */
    @Transactional
    public int adminCancelReservations(List<Long> reservationIds) {
        if (reservationIds == null || reservationIds.isEmpty()) {
            return 0;
        }
        
        List<Reservation> reservations = reservationRepository.findAllById(reservationIds);
        int cancelledCount = 0;
        
        for (Reservation reservation : reservations) {
            // 매물을 다시 사용 가능한 상태로 변경
            if (reservation.getProperties() != null) {
                for (Property property : reservation.getProperties()) {
                    if (property != null) {
                        property.setReserved(false);
                        propertyService.saveProperty(property);
                    }
                }
            }
            
            // 취소 카운터 증가
            incrementCancellationCounter();
            
            // 예약 삭제
            reservationRepository.delete(reservation);
            
            cancelledCount++;
        }
        
        return cancelledCount;
    }

    /**
     * 예약 취소 카운터를 증가시킵니다.
     */
    private void incrementCancellationCounter() {
        // 현재 월의 카운터 조회
        YearMonth currentMonth = YearMonth.now();
        CancellationCounter counter = cancellationCounterRepository
            .findByYearAndMonth(currentMonth.getYear(), currentMonth.getMonthValue())
            .orElseGet(() -> {
                // 없으면 새로 생성
                CancellationCounter newCounter = new CancellationCounter();
                newCounter.setYear(currentMonth.getYear());
                newCounter.setMonth(currentMonth.getMonthValue());
                newCounter.setCount(0);
                return newCounter;
            });
        
        // 카운터 증가
        counter.setCount(counter.getCount() + 1);
        cancellationCounterRepository.save(counter);
    }

    // 특정 상태가 아닌 예약 목록 조회
    public Page<Reservation> findByStatusNot(ReservationStatus status, Pageable pageable) {
        return reservationRepository.findByStatusNot(status, pageable);
    }

    // 사용자 이름으로 검색
    public Page<Reservation> findByUserNameContaining(String name, Pageable pageable) {
        return reservationRepository.findByUserNameContaining(name, pageable);
    }

    // 사용자 이메일로 검색
    public Page<Reservation> findByUserEmailContaining(String email, Pageable pageable) {
        return reservationRepository.findByUserEmailContaining(email, pageable);
    }

    // 매물 제목으로 검색
    public Page<Reservation> findByPropertyTitleContaining(String title, Pageable pageable) {
        return reservationRepository.findByPropertyTitleContaining(title, pageable);
    }

    // 날짜 범위로 검색
    public Page<Reservation> findByReservedDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        return reservationRepository.findByReservedDateBetween(startDate, endDate, pageable);
    }

    /**
     * 예약을 삭제하고 관련 매물을 다시 이용 가능한 상태로 변경
     */
    @Transactional
    public int deleteReservationsAndMakePropertiesAvailable(List<Long> reservationIds) {
        if (reservationIds == null || reservationIds.isEmpty()) {
            return 0;
        }
        
        int cancelledCount = 0;
        
        for (Long id : reservationIds) {
            Optional<Reservation> optionalReservation = reservationRepository.findById(id);
            if (optionalReservation.isPresent()) {
                Reservation reservation = optionalReservation.get();
                
                try {
                    // 매물을 다시 이용 가능한 상태로 변경
                    // properties의 null check와 isEmpty check를 분리하여 안전하게 처리
                    if (reservation.getProperties() != null) {
                        for (Property property : reservation.getProperties()) {
                            if (property != null) {
                                // 예약 상태를 해제하고 매물 정보 업데이트
                                property.setReserved(false);
                                propertyRepository.save(property);
                            }
                        }
                    }
                } catch (Exception e) {
                    // 로그 출력으로 예외 추적
                    System.err.println("매물 정보 업데이트 중 오류 발생: " + e.getMessage());
                    e.printStackTrace();
                }
                
                // 취소된 예약 통계 업데이트
                updateCancellationStatistics();
                
                // 예약 삭제
                reservationRepository.delete(reservation);
                
                cancelledCount++;
            }
        }
        
        return cancelledCount;
    }

    /**
     * 취소된 예약 통계 업데이트
     */
    private void updateCancellationStatistics() {
        try {
            // 현재 연도와 월 가져오기
            LocalDate now = LocalDate.now();
            int year = now.getYear();
            int month = now.getMonthValue();
            
            // 취소 통계 조회 또는 생성
            CancellationStatistics statistics = cancellationStatisticsRepository
                .findByYearAndMonth(year, month)
                .orElseGet(() -> {
                    CancellationStatistics newStats = new CancellationStatistics();
                    newStats.setYear(year);
                    newStats.setMonth(month);
                    newStats.setCount(0);
                    return newStats;
                });
            
            // 취소 횟수 증가
            statistics.setCount(statistics.getCount() + 1);
            
            // 저장
            cancellationStatisticsRepository.save(statistics);
        } catch (Exception e) {
            System.err.println("취소 통계 업데이트 중 오류 발생: " + e.getMessage());
        }
    }

    /**
     * 모든 예약 개수 조회
     */
    public long countAll() {
        return reservationRepository.count();
    }

    /**
     * 특정 날짜 범위 내 예약 수 조회 (직접 쿼리 사용)
     */
    public long countByDateRangeDirect(LocalDate startDate, LocalDate endDate) {
        return reservationRepository.countByDateRangeDirect(startDate, endDate);
    }

    /**
     * 특정 날짜 범위 내 예약 날짜 조회 (직접 쿼리 사용)
     */
    public List<LocalDate> findDistinctDatesByRangeDirect(LocalDate startDate, LocalDate endDate) {
        return reservationRepository.findDistinctDatesByRangeDirect(startDate, endDate);
    }

    /**
     * 특정 날짜의 예약 목록 조회 (직접 쿼리 사용)
     */
    public List<Reservation> findByDateDirect(LocalDate date) {
        return reservationRepository.findByDateDirect(date);
    }

    public List<LocalDate> findDistinctReservedDatesByDateRange(LocalDate startDate, LocalDate endDate) {
        return reservationRepository.findDistinctDatesByRangeDirect(startDate, endDate);
    }

    public List<Reservation> findByUser(User user) {
        return reservationRepository.findByUser(user);
    }
    
    // 날짜 범위 내 전체 예약 수 - 반환 타입을 long으로 변경
    public long countReservationsByDateRange(LocalDate startDate, LocalDate endDate) {
        return reservationRepository.countByReservedDateBetween(startDate, endDate);
    }
    
    // 날짜 범위와 상태에 따른 예약 수 - 반환 타입을 long으로 변경 
    public long countReservationsByDateRangeAndStatuses(LocalDate startDate, LocalDate endDate, List<ReservationStatus> statuses) {
        return reservationRepository.countByReservedDateBetweenAndStatusIn(startDate, endDate, statuses);
    }

    // 모든 필터를 AND 조건으로 적용하는 메서드
    public Page<Reservation> findAllWithAllFilters(
            String status, String startDate, String endDate, 
            String searchType, String search, Pageable pageable) {
        
        Specification<Reservation> spec = Specification.where(null);
        
        // 상태 필터 추가
        if (status != null && !status.isEmpty()) {
            spec = spec.and((root, query, cb) -> 
                cb.equal(root.get("status"), ReservationStatus.valueOf(status)));
        }
        
        // 날짜 범위 필터 추가
        if (startDate != null && !startDate.isEmpty()) {
            LocalDate start = LocalDate.parse(startDate);
            spec = spec.and((root, query, cb) -> 
                cb.greaterThanOrEqualTo(root.get("reservedDate"), start));
        }
        
        if (endDate != null && !endDate.isEmpty()) {
            LocalDate end = LocalDate.parse(endDate);
            spec = spec.and((root, query, cb) -> 
                cb.lessThanOrEqualTo(root.get("reservedDate"), end));
        }
        
        // 검색어 필터 추가
        if (search != null && !search.isEmpty()) {
            if ("name".equals(searchType)) {
                spec = spec.and((root, query, cb) -> {
                    Join<Reservation, User> userJoin = root.join("user");
                    return cb.like(userJoin.get("name"), "%" + search + "%");
                });
            } else if ("email".equals(searchType)) {
                spec = spec.and((root, query, cb) -> {
                    Join<Reservation, User> userJoin = root.join("user");
                    return cb.like(userJoin.get("email"), "%" + search + "%");
                });
            } else if ("reservationId".equals(searchType)) {
                try {
                    Long id = Long.parseLong(search);
                    spec = spec.and((root, query, cb) -> 
                        cb.equal(root.get("reservationId"), id));
                } catch (NumberFormatException e) {
                    // 숫자가 아닌 경우 무시
                }
            } else if ("property".equals(searchType)) {
                spec = spec.and((root, query, cb) -> {
                    Join<Reservation, Property> propertyJoin = root.join("properties", JoinType.LEFT);
                    return cb.or(
                        cb.like(propertyJoin.get("title"), "%" + search + "%"),
                        cb.like(propertyJoin.get("location"), "%" + search + "%")
                    );
                });
            }
        }
        
        // distinct 설정을 위한 추가 Specification
        Specification<Reservation> distinctSpec = (root, query, cb) -> {
            query.distinct(true);
            return cb.conjunction();
        };
        
        // 기존 조건과 distinct 조건 결합
        spec = spec.and(distinctSpec);
        
        return reservationRepository.findAll(spec, pageable);
    }

    public List<ReservationDto> getReservationsByUserAndDateRange(String userEmail, LocalDate startDate, LocalDate endDate) {
        // 수정된 메서드 이름으로 호출
        List<Reservation> reservations = reservationRepository.findByUser_EmailAndReservedDateBetween(userEmail, startDate, endDate);
        
        return reservations.stream().map(reservation -> {
            ReservationDto dto = new ReservationDto();
            dto.setReservationId(Long.valueOf(String.valueOf(reservation.getReservationId())));
            dto.setReservedDate(reservation.getReservedDate().atStartOfDay());
            dto.setStatus(reservation.getStatus().name());
            dto.setMessage(reservation.getMessage());
            // 사용자 정보 설정
            if (reservation.getUser() != null) {
                dto.setName(reservation.getUser().getName());
                dto.setEmail(reservation.getUser().getEmail());
                dto.setPhone(reservation.getUser().getPhone());
            }
            return dto;
        }).collect(Collectors.toList());
    }

    public int countReservationsByUser(String userEmail) {
        // 사용자 이메일로 예약 수 조회
        return (int) reservationRepository.countByUser_Email(userEmail);
    }

    public List<ReservationDto> getUpcomingReservationsByUser(String userEmail, LocalDate startDate, LocalDate endDate) {
        List<Reservation> reservations = reservationRepository.findByUser_EmailAndReservedDateBetween(userEmail, startDate, endDate);
        
        return reservations.stream().map(reservation -> {
            ReservationDto dto = new ReservationDto();
            dto.setReservationId(reservation.getReservationId());
            dto.setReservedDate(reservation.getReservedDate().atStartOfDay());
            dto.setStatus(reservation.getStatus().name());
            dto.setMessage(reservation.getMessage());
            
            // 사용자 정보 설정
            if (reservation.getUser() != null) {
                dto.setName(reservation.getUser().getName());
                dto.setEmail(reservation.getUser().getEmail());
                dto.setPhone(reservation.getUser().getPhone());
            }
            
            // 매물 ID와 제목, 위치만 설정
            if (reservation.getProperties() != null && !reservation.getProperties().isEmpty()) {
                List<Long> propertyIds = new ArrayList<>();
                List<String> propertyTitles = new ArrayList<>();
                List<String> propertyLocations = new ArrayList<>();
                
                for (Property property : reservation.getProperties()) {
                    propertyIds.add(property.getPropertyId());
                    propertyTitles.add(property.getTitle());
                    propertyLocations.add(property.getLocation());
                }
                
                dto.setPropertyIds(propertyIds);
                dto.setPropertyTitles(propertyTitles);
                dto.setPropertyLocations(propertyLocations);
            }
            
            return dto;
        }).collect(Collectors.toList());
    }

    public List<ReservationDto> getAllUpcomingReservations(LocalDate today, LocalDate endDate) {
        // LocalDate를 LocalDateTime으로 변환
        LocalDateTime startDateTime = today.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay().minusNanos(1); // 날짜의 마지막 순간으로 설정
        
        // LocalDateTime을 사용하여 메서드 호출
        // 기존 메서드 사용:
        List<Reservation> reservations = reservationRepository.findByReservedDateBetween(startDateTime, endDateTime);
        
        // 또는 새로 추가한 메서드 사용:
        // List<Reservation> reservations = reservationRepository.findByDateRange(today, endDate);
        
        // 예약 정보를 DTO로 변환
        return reservations.stream().map(reservation -> {
            ReservationDto dto = new ReservationDto();
            dto.setReservationId(reservation.getReservationId());
            dto.setReservedDate(reservation.getReservedDate().atStartOfDay());
            dto.setStatus(reservation.getStatus().name());
            dto.setMessage(reservation.getMessage());
            
            // 사용자 정보 설정
            if (reservation.getUser() != null) {
                dto.setName(reservation.getUser().getName());
                dto.setEmail(reservation.getUser().getEmail());
                dto.setPhone(reservation.getUser().getPhone());
            }
            
            // 매물 정보를 ID, 제목, 위치로만 설정
            if (reservation.getProperties() != null && !reservation.getProperties().isEmpty()) {
                List<Long> propertyIds = new ArrayList<>();
                List<String> propertyTitles = new ArrayList<>();
                List<String> propertyLocations = new ArrayList<>();
                
                for (Property property : reservation.getProperties()) {
                    propertyIds.add(property.getPropertyId());
                    propertyTitles.add(property.getTitle());
                    propertyLocations.add(property.getLocation());
                }
                
                dto.setPropertyIds(propertyIds);
                dto.setPropertyTitles(propertyTitles);
                dto.setPropertyLocations(propertyLocations);
            }
            
            return dto;
        }).collect(Collectors.toList());
    }
}
