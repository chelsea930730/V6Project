package com.realestate.app.reservation;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 월별 예약 취소 횟수를 저장하는 엔티티
 */
@Entity
@Table(name = "cancellation_counter", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"year", "month"})
})
@Getter
@Setter
@NoArgsConstructor
public class CancellationCounter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int year;
    private int month;
    private int count;
}