 // 예약 증감 현황 차트
document.addEventListener('DOMContentLoaded', function() {
    // 차트 데이터 초기화
    const reservationChartElement = document.querySelector("#reservationChart");
    const monthlyStats = JSON.parse(reservationChartElement.dataset.monthlyStats || '[]');

    const reservationChartOptions = {
        series: [{
            name: '예약 건수',
            data: monthlyStats
        }],
        chart: {
            type: 'line',
            height: 300,
            toolbar: {
                show: false
            }
        },
        stroke: {
            curve: 'smooth',
            width: 3
        },
        xaxis: {
            categories: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
        },
        colors: ['#4682B4'],
        grid: {
            borderColor: '#f1f1f1'
        }
    };

    const reservationChart = new ApexCharts(document.querySelector("#reservationChart"), reservationChartOptions);
    reservationChart.render();

    // 매물 등록 현황 차트 (도넛 차트)
    const propertyChartElement = document.querySelector("#propertyChart");
    const propertyStats = JSON.parse(propertyChartElement.dataset.propertyStats || '{"completed": 0, "pending": 0, "rejected": 0}');

    const propertyChartOptions = {
        series: [propertyStats.completed, propertyStats.pending, propertyStats.rejected],
        chart: {
            type: 'donut',
            height: 300
        },
        labels: ['매물 등록 완료', '검토 진행 중', '반려'],
        colors: ['#87CEFA', '#F0E68C', '#FA8072'],
        legend: {
            position: 'bottom'
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '70%'
                }
            }
        }
    };

    const propertyChart = new ApexCharts(document.querySelector("#propertyChart"), propertyChartOptions);
    propertyChart.render();

    // 달력 초기화
    initializeCalendar();
});

// 전역 변수로 현재 날짜 정보 설정
let currentDate, currentMonth, currentYear;

// 달력 관련 코드
function initializeCalendar() {
    const today = new Date();
    currentDate = today.getDate();
    currentMonth = today.getMonth();
    currentYear = today.getFullYear();

    // 달력 요소
    const calendarDays = document.querySelector('.calendar-days');
    const dateDisplay = document.querySelector('.calendar-header h6');

    // 달력 업데이트
    updateCalendar();

    // 이전/다음 달 버튼 이벤트
    const prevMonthBtn = document.querySelector('.calendar-nav button:first-child');
    const nextMonthBtn = document.querySelector('.calendar-nav button:last-child');

    prevMonthBtn.addEventListener('click', function() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        updateCalendar();
    });

    nextMonthBtn.addEventListener('click', function() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        updateCalendar();
    });
}

// 달력 업데이트 함수
function updateCalendar() {
    const calendarDays = document.querySelector('.calendar-days');
    const dateDisplay = document.querySelector('.calendar-header h6');

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();

    // 달력 HTML 생성
    let daysHtml = `
        <div class="row text-center">
            <div class="col day-name">일</div>
            <div class="col day-name">월</div>
            <div class="col day-name">화</div>
            <div class="col day-name">수</div>
            <div class="col day-name">목</div>
            <div class="col day-name">금</div>
            <div class="col day-name">토</div>
        </div>
        <div class="row text-center mt-2">
    `;

    // 이전 달의 날짜들
    const prevMonthLastDate = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = 0; i < firstDay; i++) {
        const prevDate = prevMonthLastDate - firstDay + i + 1;
        daysHtml += `<div class="col prev-month">${prevDate}</div>`;
    }

    // 현재 달의 날짜들
    for (let i = 1; i <= lastDate; i++) {
        const isToday = i === currentDate && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
        daysHtml += `<div class="col${isToday ? ' current-day' : ''}">${i}</div>`;

        if ((i + firstDay) % 7 === 0 && i !== lastDate) {
            daysHtml += '</div><div class="row text-center mt-2">';
        }
    }

    // 다음 달의 날짜들
    const remainingDays = 7 - ((lastDate + firstDay) % 7);
    if (remainingDays < 7) {
        for (let i = 1; i <= remainingDays; i++) {
            daysHtml += `<div class="col next-month">${i}</div>`;
        }
    }

    daysHtml += '</div>';
    calendarDays.innerHTML = daysHtml;

    // 날짜 표시 업데이트
    const currentDisplayDate = new Date(currentYear, currentMonth, currentDate);
    updateDateDisplay(currentDisplayDate);

    // 날짜 클릭 이벤트 추가
    const allDays = document.querySelectorAll('.calendar-days .col');
    allDays.forEach(day => {
        if (day.textContent) {
            day.addEventListener('click', function() {
                allDays.forEach(d => d.classList.remove('current-day'));
                this.classList.add('current-day');

                let selectedDate;
                if (this.classList.contains('prev-month')) {
                    selectedDate = new Date(currentYear, currentMonth - 1, parseInt(this.textContent));
                } else if (this.classList.contains('next-month')) {
                    selectedDate = new Date(currentYear, currentMonth + 1, parseInt(this.textContent));
                } else {
                    selectedDate = new Date(currentYear, currentMonth, parseInt(this.textContent));
                }

                // 선택된 날짜로 페이지 이동
                const formattedDate = formatDateForUrl(selectedDate);
                window.location.href = `/dashboard?date=${formattedDate}`;
            });
        }
    });
}

// 날짜 표시 업데이트
function updateDateDisplay(date) {
    const dateDisplay = document.querySelector('.calendar-header h6');
    const year = date.getFullYear();
    const month = months[date.getMonth()];
    const day = date.getDate();
    const dayName = days[date.getDay()];
    dateDisplay.textContent = `${year}년 ${month} ${day}일 ${dayName}`;
}

// URL용 날짜 포맷 함수
function formatDateForUrl(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 전역 변수
const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

// 예약 건수를 가져오는 함수
async function fetchReservationCount() {
    try {
        const response = await fetch('/reservation/count', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('예약 건수를 불러오는데 실패했습니다.');
        }

        const data = await response.json();
        return data.count || 0;
    } catch (error) {
        console.error('예약 건수 조회 오류:', error);
        return 0;
    }
} 