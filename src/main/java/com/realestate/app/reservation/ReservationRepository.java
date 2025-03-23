package com.realestate.app.reservation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.realestate.app.reservation.ReservationStatus;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
  List<Reservation> findByUser_UserId(Long userId);
  List<Reservation> findByProperty_PropertyId(Long propertyId);
  List<Reservation> findByStatus(ReservationStatus status);
  List<Reservation> findByReservedDateBetween(LocalDateTime start, LocalDateTime end);
  List<Reservation> findByUser_UserIdAndStatus(Long userId, ReservationStatus status);
  List<Reservation> findByUser_UserIdAndProperty_PropertyId(Long userId, Long propertyId);
  List<Reservation> findByUser_UserIdAndStatusAndReservedDateBetween(Long userId, ReservationStatus status, LocalDateTime start, LocalDateTime end);
}
