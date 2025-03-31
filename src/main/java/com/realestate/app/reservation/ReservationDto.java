package com.realestate.app.reservation;

import com.realestate.app.property.PropertyDto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.validator.constraints.Length;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class ReservationDto {
    @NotBlank(message = "이름은 필수입니다")
    @Length(min = 2, max = 50, message = "이름은 2자 이상 50자 이하여야 합니다")
    private String name;
    
    @NotBlank(message = "이메일은 필수입니다")
    @Email(message = "유효한 이메일 형식이 아닙니다")
    private String email;
    
    @NotBlank(message = "전화번호는 필수입니다")
    @Pattern(regexp = "^\\d{10,11}$", message = "전화번호는 10-11자리 숫자여야 합니다")
    private String phone;
    
    @NotNull(message = "예약 날짜는 필수입니다")
    @FutureOrPresent(message = "예약 날짜는 현재 또는 미래 날짜여야 합니다")
    @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime reservedDate;
    
    @Length(max = 500, message = "문의사항은 500자를 초과할 수 없습니다")
    private String message;

    public void setReservationId(Long aLong) {
    }

    public void setStatus(String name) {
    }

    public void setProperties(List<PropertyDto> propertyDtos) {
    }
}
