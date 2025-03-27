package com.realestate.app.reservation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CancellationCounterRepository extends JpaRepository<CancellationCounter, Long> {
    /**
     * 특정 연도와 월에 해당하는 취소 카운터를 조회합니다.
     */
    Optional<CancellationCounter> findByYearAndMonth(int year, int month);
}