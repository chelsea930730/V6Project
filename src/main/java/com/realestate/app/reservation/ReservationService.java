package com.realestate.app.reservation;

import com.realestate.app.property.Property;
import com.realestate.app.property.PropertyService;
import com.realestate.app.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import lombok.AllArgsConstructor;

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
        // 각 매물에 대해 별도의 예약 생성
        for (Long propertyId : propertyIds) {
            Property property = propertyService.getPropertyById(propertyId);
            
            Reservation reservation = new Reservation();
            reservation.setUser(user);
            reservation.setProperty(property);
            reservation.setReservedDate(dto.getReservedDate());
            reservation.setStatus(ReservationStatus.PENDING);
            // 나중에 필요하면 추가 정보를 예약 객체에 저장할 수 있음
            // (e.g., 메모 필드를 추가하여 dto.getMessage()를 저장)
            
            reservationRepository.save(reservation);
        }
    }
}
