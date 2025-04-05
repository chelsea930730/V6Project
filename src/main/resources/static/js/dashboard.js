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
    
    // 현재 선택된 월 (기본값: 현재 월)
    let selectedMonth = new Date().getMonth();
    let selectedYear = new Date().getFullYear();
    
    // 연/월 선택기 추가 (통계 카드 위에)
    addYearMonthSelector();
    
    // 차트 범위 선택기 추가 (차트 위에)
    addChartRangeSelector();
    
    // 초기 차트 로드 (기본 1년 범위)
    updateChartByDateRange('1year');
    
    // 그래프에 마우스 오버 시 포인터로 변경 (힌트 텍스트 없이)
    document.querySelector("#reservationChart").style.cursor = "pointer";

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
            height: 300,
            fontFamily: 'Cafe24 Ssurround air OTF Light',
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
                animateGradually: {
                    enabled: true,
                    delay: 150
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 350
                }
            },
            dropShadow: {
                enabled: true,
                color: '#111',
                top: 7,
                left: 1,
                blur: 5,
                opacity: 0.2
            }
        },
        labels: ['계약 완료', '진행 중인 상담', '계약 불가'],
        colors: ['#36b9cc', '#4e73df', '#f6c23e'],
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'dark',
                type: 'vertical',
                shadeIntensity: 0.5,
                gradientToColors: ['#1cc88a', '#2653d4', '#f6ad5a'],
                inverseColors: false,
                opacityFrom: 1,
                opacityTo: 0.8,
                stops: [0, 100]
            }
        },
        stroke: {
            width: 0,
            colors: ['#fff']
        },
        legend: {
            position: 'bottom',
            fontFamily: 'Cafe24 Ssurround air OTF Light',
            fontSize: '14px'
        },
        tooltip: {
            theme: 'dark',
            y: {
                formatter: function(val) {
                    return val + " 건";
                }
            }
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '70%',
                    background: 'transparent',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            showAlways: true,
                            label: '총 예약',
                            fontSize: '22px',
                            fontWeight: 600,
                            fontFamily: 'Cafe24 Ssurround air OTF Light',
                            color: '#373d3f',
                            formatter: function(w) {
                                return w.globals.seriesTotals.reduce((a, b) => a + b, 0) + "건";
                            }
                        },
                        value: {
                            show: true,
                            fontSize: '16px',
                            fontFamily: 'Cafe24 Ssurround air OTF Light',
                            fontWeight: 400,
                            color: '#373d3f',
                            offsetY: 8,
                            formatter: function (val) {
                                return val + "건";
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
    
    // 전역 변수에 차트 인스턴스 저장
    window.propertyChart = propertyChart;
    
    // 달력 초기화
    initializeCalendar();
    
    // 초기 데이터 로드 및 현재 월 통계 표시
    const today = new Date();
    updateStatCards(today.getFullYear(), today.getMonth());
    
    // 관리자 대시보드 제목 변경 (연도와 월 표시로 업데이트)
    updateSelectedMonthDisplay(today.getFullYear(), today.getMonth());
});

// 대시보드 제목에서 연도와 월 표시를 제거하는 함수
function updateDashboardTitle() {
    const dashboardTitle = document.querySelector('.d-flex h2');
    if (dashboardTitle) {
        dashboardTitle.textContent = '관리자 대시보드';
    }
}

// 연도와 월 선택기 추가 함수
function addYearMonthSelector() {
    // 통계 카드 섹션 앞에 선택기 추가
    const statsRow = document.querySelector('.row.g-4.mb-4');
    if (!statsRow) return;
    
    // 선택기 컨테이너 생성
    const selectorContainer = document.createElement('div');
    selectorContainer.className = 'month-selector-container mb-3';
    selectorContainer.style.display = 'flex';
    selectorContainer.style.justifyContent = 'flex-end';
    selectorContainer.style.alignItems = 'center';
    
    // 현재 날짜 및 전후 6개월 계산
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // 현재 월부터 전후 6개월을 포함하는 셀렉트 박스 생성
    let selectorHTML = `
        <div class="d-flex align-items-center">
            <label for="monthRangeSelector" class="me-2">통계 기간 선택:</label>
            <select id="monthRangeSelector" class="form-select form-select-sm" style="width: auto;">
    `;
    
    // 이전 6개월부터 현재 월 포함 이후 6개월까지 옵션 생성 (총 13개월)
    for (let i = -6; i <= 6; i++) {
        const targetDate = new Date(currentYear, currentMonth + i, 1);
        const year = targetDate.getFullYear();
        const month = targetDate.getMonth();
        const optionValue = `${year}-${month}`;
        const optionText = `${year}년 ${month + 1}월`;
        const isSelected = i === 0; // 현재 월 선택
        
        selectorHTML += `
            <option value="${optionValue}" ${isSelected ? 'selected' : ''}>
                ${optionText}
            </option>
        `;
    }
    
    selectorHTML += `
            </select>
        </div>
    `;
    
    // 선택기 컨테이너에 HTML 추가
    selectorContainer.innerHTML = selectorHTML;
    
    // 통계 카드 섹션 앞에 삽입
    statsRow.parentNode.insertBefore(selectorContainer, statsRow);
    
    // 선택기 이벤트 리스너 추가
    const monthRangeSelector = document.getElementById('monthRangeSelector');
    
    if (monthRangeSelector) {
        // 월 범위 변경 이벤트
        monthRangeSelector.addEventListener('change', function() {
            const [selectedYear, selectedMonth] = this.value.split('-').map(Number);
            updateStatCards(selectedYear, selectedMonth);
        });
    }
}

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
            
            // 월 범위 선택기 값 업데이트
            const monthRangeSelector = document.getElementById('monthRangeSelector');
            if (monthRangeSelector) {
                monthRangeSelector.value = `${currentYear}-${currentMonth}`;
                
                // 통계 카드도 업데이트
                updateStatCards(currentYear, currentMonth);
            }
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
            
            // 월 범위 선택기 값 업데이트
            const monthRangeSelector = document.getElementById('monthRangeSelector');
            if (monthRangeSelector) {
                monthRangeSelector.value = `${currentYear}-${currentMonth}`;
                
                // 통계 카드도 업데이트
                updateStatCards(currentYear, currentMonth);
            }
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

// 달력 업데이트 함수
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

// 차트 기간 선택기 추가 함수
function addChartRangeSelector() {
    const chartCard = document.querySelector('#reservationChart').closest('.card-body');
    if (!chartCard) return;
    
    // 차트 제목 요소 선택
    const chartTitle = chartCard.querySelector('.card-title');
    if (!chartTitle) return;
    
    // 원래 차트 제목 텍스트 저장
    const originalTitleText = chartTitle.textContent;
    
    // 기간 선택기 컨테이너 생성
    const rangeContainer = document.createElement('div');
    rangeContainer.className = 'd-flex justify-content-between align-items-center mb-3';
    
    // 기존 제목을 컨테이너에 추가
    const titleDiv = document.createElement('div');
    titleDiv.id = 'chartTitleContainer'; // 제목 컨테이너에 ID 추가
    titleDiv.innerHTML = `<h5 class="card-title">${originalTitleText}</h5>`;
    
    // 기간 선택기 생성
    const rangeSelector = document.createElement('div');
    rangeSelector.className = 'btn-group btn-group-sm';
    rangeSelector.setAttribute('role', 'group');
    rangeSelector.innerHTML = `
        <button type="button" class="btn btn-outline-secondary chart-range active" data-range="1year">1년</button>
        <button type="button" class="btn btn-outline-secondary chart-range" data-range="6months">±6개월</button>
        <button type="button" class="btn btn-outline-secondary chart-range" data-range="3months">±3개월</button>
    `;
    
    // 컨테이너에 제목과 선택기 추가
    rangeContainer.appendChild(titleDiv);
    rangeContainer.appendChild(rangeSelector);
    
    // 기존 제목 대신 새로운 컨테이너 삽입
    chartCard.insertBefore(rangeContainer, chartCard.firstChild);
    chartTitle.remove(); // 기존 제목 제거
    
    // 기간 선택기 이벤트 리스너 추가
    const rangeButtons = rangeContainer.querySelectorAll('.chart-range');
    rangeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 현재 활성화된 버튼 비활성화
            rangeButtons.forEach(btn => btn.classList.remove('active'));
            
            // 클릭한 버튼 활성화
            this.classList.add('active');
            
            // 선택한 범위에 따라 차트 업데이트
            const selectedRange = this.getAttribute('data-range');
            updateChartByDateRange(selectedRange);
        });
    });
}

// 선택한 날짜 범위에 따라 차트 업데이트
function updateChartByDateRange(range) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    let months = [];
    let categories = [];
    
    switch(range) {
        case '3months':
            // 현재 월 기준 3개월 전부터 3개월 후까지 (총 7개월)
            for (let i = -3; i <= 3; i++) {
                let date = new Date(currentYear, currentMonth + i, 1);
                let formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                months.push(formattedDate);
                categories.push(`${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`);
            }
            break;
            
        case '6months':
            // 현재 월 기준 6개월 전부터 6개월 후까지 (총 13개월)
            for (let i = -6; i <= 6; i++) {
                let date = new Date(currentYear, currentMonth + i, 1);
                let formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                months.push(formattedDate);
                categories.push(`${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`);
            }
            break;
            
        case '1year':
        default:
            // 현재 연도의 1월부터 12월까지
            for (let i = 0; i < 12; i++) {
                months.push(`${currentYear}-${String(i + 1).padStart(2, '0')}`);
            }
            categories = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
            break;
    }
    
    // 각 월의 예약 건수 가져오기
    fetchMonthlyReservationStats(months, categories, range);
}

// 각 월의 예약 통계 가져오기
function fetchMonthlyReservationStats(months, categories, rangeType) {
    // 차트 요소 참조
    const chartElement = document.querySelector('#reservationChart');
    
    // 모든 월의 데이터를 저장할 배열
    let monthlyData = Array(months.length).fill(0);
    let fetchCompleted = 0;
    
    // 총계를 위한 변수들
    let totalReservationsCount = 0;
    let activeReservationsCount = 0;
    let completedReservationsCount = 0;
    let cancelledReservationsCount = 0;
    
    // 각 월에 대해 API 호출
    months.forEach((month, index) => {
        const [year, monthNum] = month.split('-');
        
        fetch(`/api/admin/statistics/year/${year}/month/${monthNum}`)
            .then(response => {
                if (!response.ok) {
                    // 대체 API 시도
                    return fetch(`/api/admin/reservations/month?year=${year}&month=${monthNum}`);
                }
                return response.json();
            })
            .then(data => {
                if (data) {
                    // API 응답 형식에 따라 예약 건수 추출
                    if (data.totalReservationsCount !== undefined) {
                        monthlyData[index] = data.totalReservationsCount;
                        
                        // 총계에 추가
                        totalReservationsCount += data.totalReservationsCount;
                        activeReservationsCount += data.activeReservationsCount;
                        completedReservationsCount += data.completedReservationsCount;
                        cancelledReservationsCount += data.cancelledReservationsCount;
                    } else if (Array.isArray(data)) {
                        monthlyData[index] = data.length;
                        
                        // 배열 데이터인 경우 상태별로 계산
                        let active = 0, completed = 0, cancelled = 0;
                        data.forEach(reservation => {
                            if (reservation.status === 'COMPL') {
                                completed++;
                            } else if (reservation.status === 'PENDING' || reservation.status === 'CONFIRMED') {
                                active++;
                            } else if (reservation.status === 'CANCELLED') {
                                cancelled++;
                            }
                        });
                        
                        // 총계에 추가
                        totalReservationsCount += data.length;
                        activeReservationsCount += active;
                        completedReservationsCount += completed;
                        cancelledReservationsCount += cancelled;
                    }
                }
            })
            .catch(error => {
                console.error(`${year}년 ${monthNum}월 데이터 가져오기 오류:`, error);
            })
            .finally(() => {
                fetchCompleted++;
                
                // 모든 달의 데이터를 가져왔으면 차트와 통계 카드 업데이트
                if (fetchCompleted === months.length) {
                    updateChartData(monthlyData, categories, rangeType);
                    updateRangeStatistics({
                        totalReservationsCount,
                        activeReservationsCount,
                        completedReservationsCount,
                        cancelledReservationsCount
                    });
                }
            });
    });
    
    // 일정 시간이 지난 후에도 데이터가 완전히 로드되지 않았다면,
    // 현재까지 받은 데이터로 차트 업데이트
    setTimeout(() => {
        if (fetchCompleted < months.length) {
            updateChartData(monthlyData, categories, rangeType);
            updateRangeStatistics({
                totalReservationsCount,
                activeReservationsCount,
                completedReservationsCount,
                cancelledReservationsCount
            });
        }
    }, 5000);
}

// 범위 전체 통계 업데이트
function updateRangeStatistics(data) {
    const cardTitles = document.querySelectorAll('.card-title');
    cardTitles.forEach(title => {
        const parentElement = title.closest('.card-body');
        if (!parentElement) return;
        
        const subtitleElement = parentElement.querySelector('.card-subtitle');
        if (!subtitleElement) return;
        
        const subtitleText = subtitleElement.textContent.trim();
        
        if (subtitleText.includes('총 상담 예약 건수')) {
            title.textContent = `${data.totalReservationsCount}건`;
        } else if (subtitleText.includes('진행 중인 상담')) {
            title.textContent = `${data.activeReservationsCount}건`;
        } else if (subtitleText.includes('계약 완료')) {
            title.textContent = `${data.completedReservationsCount}건`;
        } else if (subtitleText.includes('계약불가 예약건수')) {
            title.textContent = `${data.cancelledReservationsCount}건`;
        }
    });
    
    // 도넛 차트 업데이트
    try {
        if (window.propertyChart && typeof window.propertyChart.updateSeries === 'function') {
            window.propertyChart.updateSeries([
                data.completedReservationsCount,
                data.activeReservationsCount,
                data.cancelledReservationsCount
            ]);
        }
    } catch (error) {
        console.error('도넛 차트 업데이트 오류:', error);
    }
}

// 차트 데이터 업데이트
function updateChartData(data, categories, rangeType) {
    const chartElement = document.querySelector('#reservationChart');
    if (!chartElement) {
        console.error('차트 요소를 찾을 수 없습니다.');
        return;
    }
    
    // 차트 제목 업데이트
    let titleText = '예약 증감 현황';
    switch(rangeType) {
        case '3months': titleText = '예약 증감 현황 (±3개월)'; break;
        case '6months': titleText = '예약 증감 현황 (±6개월)'; break;
        case '1year': titleText = '1년간 예약 증감 현황'; break;
    }
    
    // 차트 엘리먼트 초기화
    chartElement.innerHTML = '';
    
    // 새로운 차트 옵션으로 차트 생성
    const chartOptions = {
        series: [{
            name: '예약 건수',
            data: data,
            color: '#4e73df'
        }],
        chart: {
            height: 350,
            type: 'area',
            fontFamily: 'Cafe24 Ssurround air OTF Light',
            toolbar: {
                show: false
            },
            dropShadow: {
                enabled: true,
                color: '#000',
                top: 18,
                left: 7,
                blur: 10,
                opacity: 0.2
            },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
                animateGradually: {
                    enabled: true,
                    delay: 150
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 350
                }
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 3
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'dark',
                gradientToColors: ['#1cc88a'],
                shadeIntensity: 1,
                type: 'horizontal',
                opacityFrom: 0.7,
                opacityTo: 0.3,
                stops: [0, 100]
            }
        },
        title: {
            text: titleText,
            align: 'left',
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
                fontFamily: 'Cafe24 Ssurround air OTF Light',
                color: '#5a5c69'
            }
        },
        grid: {
            borderColor: '#e7e7e7',
            row: {
                colors: ['#f3f3f3', 'transparent'],
                opacity: 0.5
            }
        },
        markers: {
            size: 6,
            colors: ['#4e73df'],
            strokeColors: '#fff',
            strokeWidth: 2,
            hover: {
                size: 8
            }
        },
        xaxis: {
            categories: categories,
            labels: {
                style: {
                    colors: '#5a5c69',
                    fontSize: '12px',
                    fontFamily: 'Cafe24 Ssurround air OTF Light'
                }
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#5a5c69',
                    fontSize: '12px',
                    fontFamily: 'Cafe24 Ssurround air OTF Light'
                },
                formatter: function(val) {
                    return Math.round(val) + "건";
                }
            }
        },
        tooltip: {
            theme: 'dark',
            y: {
                formatter: function(val) {
                    return val + " 건";
                }
            }
        },
        legend: {
            position: 'top',
            horizontalAlign: 'right',
            floating: true,
            offsetY: -25,
            offsetX: -5,
            fontFamily: 'Cafe24 Ssurround air OTF Light'
        }
    };
    
    // 새 차트 인스턴스 생성
    window.reservationChart = new ApexCharts(chartElement, chartOptions);
    window.reservationChart.render();
}

// 날짜 형식 변환 유틸리티 함수
function formatDate(date, format) {
    const year = date.getFullYear().toString().slice(-2); // 2자리 연도
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return format.replace('yy', year).replace('MM', month).replace('dd', day);
}

// 통계 카드 업데이트 함수
function updateStatCards(year, month) {
    console.log(`${year}년 ${month+1}월 통계 데이터 업데이트 중...`);
    
    // API 호출하여 선택한 월의 데이터 가져오기
    fetch(`/api/admin/statistics/year/${year}/month/${month + 1}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('월별 통계 데이터를 가져오는데 실패했습니다.');
            }
            return response.json();
        })
        .then(data => {
            // 통계 카드 업데이트
            updateStatisticsCards(data);
            
            // 도넛 차트 데이터 업데이트
            updateDonutChart(data);
            
            // 월 선택기에서 해당 월 선택
            setYearMonthSelectorValue(year, month);
            
            // 선택된 월 표시 업데이트
            updateSelectedMonthDisplay(year, month);
        })
        .catch(error => {
            console.error('통계 데이터 업데이트 오류:', error);
            
            // 오류 발생 시 서버에서 전달받은 초기 데이터 표시
            displayInitialData();
            
            // 오류 메시지 표시
            showErrorMessage('통계 데이터를 불러오는 중 오류가 발생했습니다.');
        });
}

// 통계 카드에 로딩 표시 추가
function showLoadingOnCards() {
    const cardTitles = document.querySelectorAll('.card-title');
    cardTitles.forEach(title => {
        title.innerHTML = '<div class="spinner-border spinner-border-sm text-primary" role="status"></div>';
    });
}

// 오류 메시지 표시
function showErrorMessage(message) {
    // 임시 알림 요소 생성
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // 문서에 알림 추가
    document.body.appendChild(alertDiv);
    
    // 5초 후 자동 제거
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 300);
    }, 5000);
}

// 선택된 월 표시 업데이트
function updateSelectedMonthDisplay(year, month) {
    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    const dashboardTitle = document.querySelector('.d-flex h2');
    if (dashboardTitle) {
        dashboardTitle.textContent = `관리자 대시보드 (${year}년 ${monthNames[month]})`;
    }
}

// 초기 데이터 표시 함수 (API 호출 실패 시)
function displayInitialData() {
    const propertyChartElement = document.querySelector("#propertyChart");
    if (!propertyChartElement) return;
    
    const completedCount = parseInt(propertyChartElement.getAttribute("data-completed") || "0");
    const pendingCount = parseInt(propertyChartElement.getAttribute("data-pending") || "0");
    const cancelledCount = parseInt(propertyChartElement.getAttribute("data-cancelled") || "0");
    const totalCount = completedCount + pendingCount + cancelledCount;
    
    // 통계 카드 업데이트
    const cardTitles = document.querySelectorAll('.card-title');
    cardTitles.forEach(title => {
        const parentElement = title.closest('.card-body');
        if (!parentElement) return;
        
        const subtitleElement = parentElement.querySelector('.card-subtitle');
        if (!subtitleElement) return;
        
        const subtitleText = subtitleElement.textContent.trim();
        
        if (subtitleText.includes('총 상담 예약 건수')) {
            title.textContent = `${totalCount}건`;
        } else if (subtitleText.includes('진행 중인 상담')) {
            title.textContent = `${pendingCount}건`;
        } else if (subtitleText.includes('계약 완료')) {
            title.textContent = `${completedCount}건`;
        } else if (subtitleText.includes('계약불가 예약건수')) {
            title.textContent = `${cancelledCount}건`;
        }
    });
    
    // 도넛 차트 업데이트
    if (window.propertyChart) {
        try {
            window.propertyChart.updateSeries([completedCount, pendingCount, cancelledCount]);
        } catch (error) {
            console.error('도넛 차트 업데이트 오류:', error);
        }
    }
}

// 통계 카드 업데이트 함수
function updateStatisticsCards(data) {
    const cardTitles = document.querySelectorAll('.card-title');
    cardTitles.forEach(title => {
        const parentElement = title.closest('.card-body');
        if (!parentElement) return;
        
        const subtitleElement = parentElement.querySelector('.card-subtitle');
        if (!subtitleElement) return;
        
        const subtitleText = subtitleElement.textContent.trim();
        
        if (subtitleText.includes('총 상담 예약 건수')) {
            title.textContent = `${data.totalReservationsCount}건`;
        } else if (subtitleText.includes('진행 중인 상담')) {
            title.textContent = `${data.activeReservationsCount}건`;
        } else if (subtitleText.includes('계약 완료')) {
            title.textContent = `${data.completedReservationsCount}건`;
        } else if (subtitleText.includes('계약불가 예약건수')) {
            title.textContent = `${data.cancelledReservationsCount}건`;
        }
    });
}

// 도넛 차트 업데이트 함수
function updateDonutChart(data) {
    try {
        if (window.propertyChart && typeof window.propertyChart.updateSeries === 'function') {
            window.propertyChart.updateSeries([
                data.completedReservationsCount,
                data.activeReservationsCount,
                data.cancelledReservationsCount
            ]);
        }
    } catch (error) {
        console.error('도넛 차트 업데이트 오류:', error);
    }
}

// 연/월 선택기 값 설정 함수
function setYearMonthSelectorValue(year, month) {
    const monthRangeSelector = document.getElementById('monthRangeSelector');
    if (monthRangeSelector) {
        // 옵션 값 생성
        const optionValue = `${year}-${month}`;
        
        // 해당 옵션이 있는지 확인
        let optionExists = false;
        for (let i = 0; i < monthRangeSelector.options.length; i++) {
            if (monthRangeSelector.options[i].value === optionValue) {
                optionExists = true;
                monthRangeSelector.selectedIndex = i;
                break;
            }
        }
        
        // 옵션이 없으면 새로 추가
        if (!optionExists) {
            const option = document.createElement('option');
            option.value = optionValue;
            option.text = `${year}년 ${month + 1}월`;
            monthRangeSelector.appendChild(option);
            monthRangeSelector.value = optionValue;
            
            // 옵션 재정렬
            sortSelectOptions(monthRangeSelector);
        }
    }
}

// 셀렉트 옵션 재정렬 함수
function sortSelectOptions(selectElement) {
    const options = Array.from(selectElement.options);
    options.sort((a, b) => {
        const [yearA, monthA] = a.value.split('-').map(Number);
        const [yearB, monthB] = b.value.split('-').map(Number);
        
        if (yearA === yearB) {
            return monthA - monthB;
        }
        return yearA - yearB;
    });
    
    // 정렬된 옵션으로 교체
    while (selectElement.options.length > 0) {
        selectElement.remove(0);
    }
    
    options.forEach(option => {
        selectElement.add(option);
    });
}