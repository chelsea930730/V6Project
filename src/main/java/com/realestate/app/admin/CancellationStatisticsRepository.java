package com.realestate.app.admin;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CancellationStatisticsRepository extends JpaRepository<CancellationStatistics, Long> {
    Optional<CancellationStatistics> findByYearAndMonth(int year, int month);
}