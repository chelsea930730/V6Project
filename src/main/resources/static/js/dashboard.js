document.addEventListener('DOMContentLoaded', function() {
    // 월별 통계 데이터 가져오기
    const reservationChartElement = document.querySelector("#reservationChart");
    let monthlyStats = [];
    
    if (reservationChartElement && reservationChartElement.dataset.monthlyStats) {
        try {
            monthlyStats = JSON.parse(reservationChartElement.dataset.monthlyStats);
        } catch (e) {
            console.error("월별 통계 데이터 파싱 오류:", e);
            monthlyStats = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        }
    } else {
        monthlyStats = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
    
    // 예약 증감 차트 렌더링
    const reservationChartOptions = {
        series: [{
            name: '예약 건수',
            data: monthlyStats
        }],
        chart: {
            type: 'area',
            height: 300,
            toolbar: {
                show: false
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 2
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.9,
                stops: [0, 90, 100]
            }
        },
        xaxis: {
            categories: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
        },
        colors: ['#4682B4'],
        tooltip: {
            y: {
                formatter: function(val) {
                    return val + "건";
                }
            }
        }
    };

    const reservationChart = new ApexCharts(document.querySelector("#reservationChart"), reservationChartOptions);
    reservationChart.render();

    // 예약 상태 차트 (도넛 차트)
    const propertyChartElement = document.querySelector("#propertyChart");
    let completedCount = 0;
    let pendingCount = 0;
    let cancelledCount = 0;

    if (propertyChartElement) {
        completedCount = parseInt(propertyChartElement.getAttribute("data-completed") || "0");
        pendingCount = parseInt(propertyChartElement.getAttribute("data-pending") || "0");
        cancelledCount = parseInt(propertyChartElement.getAttribute("data-cancelled") || "0");
    }

    const propertyChartOptions = {
        series: [completedCount, pendingCount, cancelledCount],
        chart: {
            type: 'donut',
            height: 300
        },
        labels: ['계약 완료', '진행 중인 상담', '계약 불가'],
        colors: ['#28a745', '#007bff', '#ff9800'],
        legend: {
            position: 'bottom'
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '70%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            showAlways: true,
                            label: '총 예약',
                            fontSize: '20px',
                            fontWeight: 600,
                            color: '#373d3f',
                            formatter: function(w) {
                                return w.globals.seriesTotals.reduce((a, b) => a + b, 0) + "건";
                            }
                        }
                    }
                }
            }
        },
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    width: 200
                },
                legend: {
                    position: 'bottom'
                }
            }
        }]
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
    // URL에서 날짜 파라미터가 있으면 해당 날짜로 설정, 없으면 현재 날짜
    const urlParams = new URLSearchParams(window.location.search);
    const dateParam = urlParams.get('date');
    
    const today = dateParam ? new Date(dateParam) : new Date();
    currentDate = today.getDate();
    currentMonth = today.getMonth();
    currentYear = today.getFullYear();

    // 달력 컨테이너
    const calendarContainer = document.getElementById('calendarContainer');
    
    // 예약이 있는 날짜 목록 가져오기
    let reservationDates = [];
    if (calendarContainer && calendarContainer.dataset.reservationDates) {
        try {
            reservationDates = JSON.parse(calendarContainer.dataset.reservationDates);
        } catch (e) {
            console.error("예약 날짜 데이터 파싱 오류:", e);
            reservationDates = [];
        }
    }
    
    // 오늘 날짜 (YYYY-MM-DD 형식)
    const todayString = calendarContainer && calendarContainer.dataset.today ? 
                        calendarContainer.dataset.today : 
                        new Date().toISOString().split('T')[0];
    
    // 달력 업데이트
    updateCalendar(reservationDates, todayString);

    // 이전/다음 달 버튼 이벤트
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');

    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', function() {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            
            // 월이 변경되면 서버에서 해당 월의 예약 정보를 새로 가져옴
            fetchMonthReservationDates();
            
            // 날짜 표시 업데이트
            updateDateDisplay();
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', function() {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            
            // 월이 변경되면 서버에서 해당 월의 예약 정보를 새로 가져옴
            fetchMonthReservationDates();
            
            // 날짜 표시 업데이트
            updateDateDisplay();
        });
    }
}

// 날짜 표시 업데이트
function updateDateDisplay() {
    const dateDisplay = document.querySelector('.calendar-header h6');
    if (dateDisplay) {
        const displayDate = new Date(currentYear, currentMonth, currentDate);
        const options = { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            weekday: 'long' 
        };
        
        dateDisplay.textContent = displayDate.toLocaleDateString('ko-KR', options)
            .replace('.', '년 ')
            .replace('.', '월 ')
            .replace('.', '일');
    }
}

// 달력 업데이트 함수 (예약 날짜와 오늘 날짜 정보 추가)
function updateCalendar(reservationDates = [], todayString = '') {
    const calendarContainer = document.getElementById('calendarContainer');
    if (!calendarContainer) return;

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // 오늘 날짜 파싱
    const today = new Date(todayString);
    const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;
    const todayDate = today.getDate();

    // 달력 HTML 생성
    let calendarHTML = `
        <div class="row text-center">
            <div class="col">일</div>
            <div class="col">월</div>
            <div class="col">화</div>
            <div class="col">수</div>
            <div class="col">목</div>
            <div class="col">금</div>
            <div class="col">토</div>
        </div>
    `;

    // 주차별 행 시작
    let dayCounter = 1;
    let weekRowHTML = '<div class="row text-center mt-2">';
    
    // 첫 주 시작 전 빈칸 채우기
    for (let i = 0; i < firstDay; i++) {
        weekRowHTML += '<div class="col"></div>';
    }
    
    // 날짜 채우기
    for (let i = firstDay; i < 7; i++) {
        if (dayCounter <= lastDate) {
            // 각 날짜의 클래스 결정
            const isToday = isCurrentMonth && dayCounter === todayDate;
            const isSelected = dayCounter === currentDate;
            
            // 예약이 있는 날짜인지 확인
            const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayCounter).padStart(2, '0')}`;
            const hasReservation = reservationDates.includes(dateString);
            
            // 클래스 조합
            let cellClass = 'day-cell';
            if (isToday) cellClass += ' today';
            if (isSelected) cellClass += ' selected';
            if (hasReservation) cellClass += ' has-reservation';
            
            weekRowHTML += `
                <div class="col">
                    <div class="${cellClass}" data-date="${dateString}">
                        ${dayCounter}
                    </div>
                </div>
            `;
            dayCounter++;
        } else {
            weekRowHTML += '<div class="col"></div>';
        }
    }
    weekRowHTML += '</div>';
    calendarHTML += weekRowHTML;
    
    // 남은 주차 추가
    while (dayCounter <= lastDate) {
        weekRowHTML = '<div class="row text-center mt-2">';
        
        for (let i = 0; i < 7; i++) {
            if (dayCounter <= lastDate) {
                // 각 날짜의 클래스 결정
                const isToday = isCurrentMonth && dayCounter === todayDate;
                const isSelected = dayCounter === currentDate;
                
                // 예약이 있는 날짜인지 확인
                const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayCounter).padStart(2, '0')}`;
                const hasReservation = reservationDates.includes(dateString);
                
                // 클래스 조합
                let cellClass = 'day-cell';
                if (isToday) cellClass += ' today';
                if (isSelected) cellClass += ' selected';
                if (hasReservation) cellClass += ' has-reservation';
                
                weekRowHTML += `
                    <div class="col">
                        <div class="${cellClass}" data-date="${dateString}">
                            ${dayCounter}
                        </div>
                    </div>
                `;
                dayCounter++;
            } else {
                weekRowHTML += '<div class="col"></div>';
            }
        }
        
        weekRowHTML += '</div>';
        calendarHTML += weekRowHTML;
    }
    
    calendarContainer.innerHTML = calendarHTML;
    
    // 날짜 셀 클릭 이벤트 추가
    document.querySelectorAll('.day-cell').forEach(cell => {
        if (cell.textContent.trim() !== '') {
            cell.addEventListener('click', function() {
                const dateStr = this.getAttribute('data-date');
                if (dateStr) {
                    window.location.href = `/admin/dashboard?date=${dateStr}`;
                }
            });
        }
    });
}

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

// 해당 월의 예약 날짜 정보를 서버에서 가져오는 함수
function fetchMonthReservationDates() {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    const formattedFirstDay = firstDay.toISOString().split('T')[0];
    const formattedLastDay = lastDay.toISOString().split('T')[0];
    
    // API 호출하여 해당 월의 예약 날짜 가져오기
    fetch(`/api/admin/reservations/dates?startDate=${formattedFirstDay}&endDate=${formattedLastDay}`)
        .then(response => response.json())
        .then(data => {
            const todayString = document.getElementById('calendarContainer').dataset.today;
            updateCalendar(data, todayString);
        })
        .catch(error => {
            console.error('예약 날짜 조회 오류:', error);
            const todayString = document.getElementById('calendarContainer').dataset.today;
            // 오류 발생 시 빈 배열로 처리
            updateCalendar([], todayString);
        });
} 