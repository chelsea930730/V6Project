package com.realestate.app.reservation;

import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Getter
@Setter
public class ReservationDto {
    private String name;
    private String email;
    private String phone;

    @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm") // HTML datetime-local 형식에 맞춤
    private LocalDateTime reservedDate;

    private String message;
}