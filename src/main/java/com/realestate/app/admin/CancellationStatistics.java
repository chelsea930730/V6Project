package com.realestate.app.admin;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 월별 예약 취소 통계
 */
@Entity
@Table(name = "cancellation_statistics", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"year", "month"})
})
@Getter
@Setter
@NoArgsConstructor
public class CancellationStatistics {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int year;
    private int month;
    private int count;
}