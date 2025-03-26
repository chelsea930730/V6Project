package com.realestate.app.reservation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
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
}
