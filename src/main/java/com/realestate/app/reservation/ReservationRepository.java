package com.realestate.app.reservation;

import com.realestate.app.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long>, JpaSpecificationExecutor<Reservation> {
  List<Reservation> findByUser_UserId(Long userId);

  @Query("SELECT r FROM Reservation r JOIN r.properties p WHERE p.propertyId = :propertyId")
  List<Reservation> findByPropertyId(@Param("propertyId") Long propertyId);

  List<Reservation> findByStatus(ReservationStatus status);

  List<Reservation> findByReservedDateBetween(LocalDateTime start, LocalDateTime end);

  List<Reservation> findByUser_UserIdAndStatus(Long userId, ReservationStatus status);

  @Query("SELECT r FROM Reservation r JOIN r.properties p WHERE r.user.userId = :userId AND p.propertyId = :propertyId")
  List<Reservation> findByUser_UserIdAndPropertyId(@Param("userId") Long userId, @Param("propertyId") Long propertyId);

  List<Reservation> findByUser_UserIdAndStatusAndReservedDateBetween(Long userId, ReservationStatus status, LocalDateTime start, LocalDateTime end);

  List<Reservation> findByUser_UserIdAndStatusIn(Long userId, List<ReservationStatus> statuses);

  List<Reservation> findByUserUserId(Long userId);

  List<Reservation> findByUserUserIdAndStatus(Long userId, ReservationStatus status);

  List<Reservation> findByUserUserIdAndStatusIn(Long userId, List<ReservationStatus> statuses);

  Page<Reservation> findByStatus(ReservationStatus status, Pageable pageable);

  Page<Reservation> findByReservedDateBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);

  Page<Reservation> findByUserNameContainingOrUserEmailContaining(String name, String email, Pageable pageable);

  Page<Reservation> findByReservedDate(LocalDate date, Pageable pageable);

  Page<Reservation> findAll(Pageable pageable);

  Page<Reservation> findByStatusAndReservedDate(ReservationStatus status, LocalDate date, Pageable pageable);

  Page<Reservation> findByStatusAndUserNameContainingOrUserEmailContaining(
          ReservationStatus status, String name, String email, Pageable pageable);

  Page<Reservation> findByReservedDateAndUserNameContainingOrUserEmailContaining(
          LocalDate date, String name, String email, Pageable pageable);

  Page<Reservation> findByStatusAndReservedDateAndUserNameContainingOrUserEmailContaining(
          ReservationStatus status, LocalDate date, String name, String email, Pageable pageable);

  Page<Reservation> findByReservedDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable);

  Page<Reservation> findByStatusAndReservedDateBetween(ReservationStatus status, LocalDate startDate, LocalDate endDate, Pageable pageable);

  Page<Reservation> findByMessageContaining(String message, Pageable pageable);

  Page<Reservation> findByAdminNotesContaining(String adminNotes, Pageable pageable);

  Page<Reservation> findByStatusAndMessageContaining(ReservationStatus status, String message, Pageable pageable);

  Page<Reservation> findByStatusAndAdminNotesContaining(ReservationStatus status, String adminNotes, Pageable pageable);

  Page<Reservation> findByReservedDateBetweenAndMessageContaining(LocalDate startDate, LocalDate endDate, String message, Pageable pageable);

  Page<Reservation> findByReservedDateBetweenAndAdminNotesContaining(LocalDate startDate, LocalDate endDate, String adminNotes, Pageable pageable);

  Page<Reservation> findByReservedDateBetweenAndUserNameContainingOrReservedDateBetweenAndUserEmailContaining(
          LocalDate startDate1, LocalDate endDate1, String name,
          LocalDate startDate2, LocalDate endDate2, String email, Pageable pageable);

  Page<Reservation> findByStatusAndReservedDateBetweenAndMessageContaining(
          ReservationStatus status, LocalDate startDate, LocalDate endDate, String message, Pageable pageable);

  Page<Reservation> findByStatusAndReservedDateBetweenAndAdminNotesContaining(
          ReservationStatus status, LocalDate startDate, LocalDate endDate, String adminNotes, Pageable pageable);

  Page<Reservation> findByStatusAndReservedDateBetweenAndUserNameContainingOrStatusAndReservedDateBetweenAndUserEmailContaining(
          ReservationStatus status1, LocalDate startDate1, LocalDate endDate1, String name,
          ReservationStatus status2, LocalDate startDate2, LocalDate endDate2, String email, Pageable pageable);

  Page<Reservation> findByPropertiesTitleContainingOrPropertiesLocationContaining(
          String title, String location, Pageable pageable);

  // 상태별 예약 개수 조회
  long countByStatus(ReservationStatus status);

  // 여러 상태에 해당하는 예약 개수 조회
  long countByStatusIn(List<ReservationStatus> statuses);

  // 기간 내 예약 개수 조회
  long countByReservedDateBetween(LocalDate startDate, LocalDate endDate);

  // 특정 날짜의 예약 목록 조회
  List<Reservation> findByReservedDate(LocalDate date);

  /**
   * 지정된 날짜 범위 내에서 예약이 있는 모든 고유 날짜를 조회합니다.
   */
  @Query("SELECT DISTINCT r.reservedDate FROM Reservation r WHERE r.reservedDate BETWEEN :startDate AND :endDate")
  List<LocalDate> findDistinctReservedDatesByReservedDateBetween(LocalDate startDate, LocalDate endDate);

  // 특정 상태가 아닌 예약 조회
  Page<Reservation> findByStatusNot(ReservationStatus status, Pageable pageable);

  // 사용자 이름으로 검색
  @Query("SELECT r FROM Reservation r JOIN r.user u WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :name, '%'))")
  Page<Reservation> findByUserNameContaining(String name, Pageable pageable);

  // 사용자 이메일로 검색
  @Query("SELECT r FROM Reservation r JOIN r.user u WHERE LOWER(u.email) LIKE LOWER(CONCAT('%', :email, '%'))")
  Page<Reservation> findByUserEmailContaining(String email, Pageable pageable);

  // 매물 제목으로 검색
  @Query("SELECT DISTINCT r FROM Reservation r JOIN r.properties p WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :title, '%'))")
  Page<Reservation> findByPropertyTitleContaining(String title, Pageable pageable);

  /**
   * 특정 날짜 범위 내의 모든 예약 수 조회 - LocalDateTime 파라미터 사용
   */
  long countByReservedDateBetween(LocalDateTime startDate, LocalDateTime endDate);

  /**
   * 특정 날짜 범위 내의 모든 예약 날짜 조회 (중복 가능) - LocalDateTime 파라미터 사용
   */
  @Query("SELECT r.reservedDate FROM Reservation r WHERE r.reservedDate BETWEEN :startDate AND :endDate")
  List<LocalDateTime> findDistinctReservedDatesByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

  @Query("SELECT COUNT(r) FROM Reservation r WHERE DATE(r.reservedDate) BETWEEN :startDate AND :endDate")
  long countAllReservationsByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

  @Query("SELECT DISTINCT DATE(r.reservedDate) FROM Reservation r WHERE DATE(r.reservedDate) BETWEEN :startDate AND :endDate")
  List<LocalDate> findDistinctDatesWithReservations(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

  // 날짜 범위로 예약 수 조회 - @Query 사용
  @Query("SELECT COUNT(r) FROM Reservation r WHERE CAST(r.reservedDate AS date) BETWEEN CAST(:startDate AS date) AND CAST(:endDate AS date)")
  long countByDateRangeDirect(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

  // 날짜 범위 내 예약 날짜 조회 - @Query 사용
  @Query("SELECT DISTINCT CAST(r.reservedDate AS date) FROM Reservation r WHERE CAST(r.reservedDate AS date) BETWEEN CAST(:startDate AS date) AND CAST(:endDate AS date)")
  List<LocalDate> findDistinctDatesByRangeDirect(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

  // 특정 날짜의 예약 조회 - @Query 사용
  @Query("SELECT r FROM Reservation r WHERE CAST(r.reservedDate AS date) = CAST(:date AS date)")
  List<Reservation> findByDateDirect(@Param("date") LocalDate date);

  List<Reservation> findByUser(User user);

  // 날짜 범위와 상태에 따른 예약 수 조회
  int countByReservedDateBetweenAndStatusIn(LocalDate startDate, LocalDate endDate, List<ReservationStatus> statuses);

  List<Reservation> findByUser_EmailAndReservedDateBetween(String userEmail, LocalDate startDate, LocalDate endDate);

  long countByUser_Email(String email);

  @Query("SELECT r FROM Reservation r WHERE r.reservedDate >= :startDate AND r.reservedDate <= :endDate")
  List<Reservation> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
