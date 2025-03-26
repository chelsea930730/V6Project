package com.realestate.app.reservation;

import com.realestate.app.property.Property;
import com.realestate.app.property.PropertyService;
import com.realestate.app.user.User;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Service
@AllArgsConstructor
@Transactional
public class ReservationService {
    private final ReservationRepository reservationRepository;
    private final PropertyService propertyService;

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
            reservation.addProperty(property);  // 단일 property 설정 대신 addProperty 메서드 사용
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
            Arrays.asList(ReservationStatus.COMPLETED, ReservationStatus.CANCELLED));
    }

    // 특정 사용자의 특정 상태 예약 조회 메소드 추가
    public List<Reservation> findByUserIdAndStatus(Long userId, ReservationStatus status) {
        return reservationRepository.findByUser_UserIdAndStatus(userId, status);
    }

    // 특정 사용자의 여러 상태 예약 조회 메소드 추가
    public List<Reservation> findByUserIdAndStatusIn(Long userId, List<ReservationStatus> statuses) {
        return reservationRepository.findByUser_UserIdAndStatusIn(userId, statuses);
    }
}
