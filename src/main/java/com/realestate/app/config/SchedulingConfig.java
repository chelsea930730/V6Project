package com.realestate.app.config;

import com.realestate.app.reservation.CancellationCounterRepository;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDate;
import java.time.YearMonth;

@Configuration
@EnableScheduling
public class SchedulingConfig {

    private final CancellationCounterRepository cancellationCounterRepository;

    public SchedulingConfig(CancellationCounterRepository cancellationCounterRepository) {
        this.cancellationCounterRepository = cancellationCounterRepository;
    }

    /**
     * 매월 1일 0시 0분에 실행되어 취소 카운터를 초기화합니다.
     */
    @Scheduled(cron = "0 0 0 1 * ?")
    public void resetCancellationCounter() {
        // 전월 데이터 초기화
        YearMonth lastMonth = YearMonth.now().minusMonths(1);
        cancellationCounterRepository.findByYearAndMonth(lastMonth.getYear(), lastMonth.getMonthValue())
                .ifPresent(counter -> {
                    // 카운터 초기화 (새로운 월 시작)
                    counter.setCount(0);
                    cancellationCounterRepository.save(counter);
                });

        // 로그 기록
        System.out.println("Monthly cancellation counter reset completed at: " + LocalDate.now());
    }
}