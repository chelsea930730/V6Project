package com.realestate.app.reservation;

//import com.realestate.app.property.PropertyDto;
import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReservationDto {
    private Long reservationId;
    private String name;
    private String email;
    private String phone;
    
    @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime reservedDate;
    
    private String status;
    private String message;
    
    // PropertyDto 대신 기본 타입 리스트 사용
    private List<Long> propertyIds;
    private List<String> propertyTitles;
    private List<String> propertyLocations;
}
