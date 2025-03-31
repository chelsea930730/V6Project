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

    // 월 선택기 추가 (통계 카드 위에)
    addYearMonthSelector();

    // 통계 카드 업데이트 함수 - 로딩 중 메시지 제거 및 오류 처리 개선
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
            })
            .catch(error => {
                console.error('통계 데이터 업데이트 오류:', error);

                // 오류 발생 시 서버에서 전달받은 초기 데이터 표시
                displayInitialData();
            });
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
        const yearSelector = document.getElementById('statisticsYearSelector');
        const monthSelector = document.getElementById('statisticsMonthSelector');
        if (yearSelector && monthSelector) {
            yearSelector.value = year;
            monthSelector.value = month;
        }
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
            },
            events: {
                // 차트 데이터 포인트 클릭 이벤트 추가
                dataPointSelection: function(event, chartContext, config) {
                    const monthIndex = config.dataPointIndex;
                    // 선택기 값 업데이트 및 통계 데이터 조회
                    const yearSelector = document.getElementById('statisticsYearSelector');
                    const year = parseInt(yearSelector.value);
                    updateStatCards(year, monthIndex);
                }
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
        },
        markers: {
            size: 4,
            colors: ["#FFF"],
            strokeColors: "#4682B4",
            strokeWidth: 2,
            hover: {
                size: 7,
            }
        }
    };

    const reservationChart = new ApexCharts(document.querySelector("#reservationChart"), reservationChartOptions);
    reservationChart.render();

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

    // 전역 변수에 차트 인스턴스 저장
    window.propertyChart = propertyChart;

    // 달력 초기화
    initializeCalendar();

    // 초기 로드 시 페이지 로드 시 서버에서 제공한 데이터를 표시
    displayInitialData();

    // 관리자 대시보드 제목 변경 (연도와 월 표시 제거)
    updateDashboardTitle();

    // 연/월 선택 상태 업데이트 (현재 년/월 선택)
    setYearMonthSelectorValue(selectedYear, selectedMonth);
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

    // 현재 날짜 기준 연도와 월 설정
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const previousYear = currentYear - 1;

    // 선택기 HTML 생성
    let selectorHTML = `
        <div class="d-flex align-items-center">
            <label for="statisticsYearSelector" class="me-2">통계 조회:</label>
            <select id="statisticsYearSelector" class="form-select form-select-sm me-2" style="width: auto;">
                <option value="${previousYear}">${previousYear}년</option>
                <option value="${currentYear}" selected>${currentYear}년</option>
            </select>
            
            <select id="statisticsMonthSelector" class="form-select form-select-sm" style="width: auto;">
    `;

    // 월 옵션 생성
    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

    for (let i = 0; i < 12; i++) {
        selectorHTML += `
            <option value="${i}" ${i === currentMonth ? 'selected' : ''}>
                ${monthNames[i]}
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
    const yearSelector = document.getElementById('statisticsYearSelector');
    const monthSelector = document.getElementById('statisticsMonthSelector');

    if (yearSelector && monthSelector) {
        // 연도 변경 이벤트
        yearSelector.addEventListener('change', function() {
            const selectedYear = parseInt(this.value);
            const selectedMonth = parseInt(monthSelector.value);
            updateStatCards(selectedYear, selectedMonth);
        });

        // 월 변경 이벤트
        monthSelector.addEventListener('change', function() {
            const selectedYear = parseInt(yearSelector.value);
            const selectedMonth = parseInt(this.value);
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

            // 연/월 선택기 값 업데이트
            const yearSelector = document.getElementById('statisticsYearSelector');
            const monthSelector = document.getElementById('statisticsMonthSelector');
            if (yearSelector && monthSelector) {
                yearSelector.value = currentYear;
                monthSelector.value = currentMonth;
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

            // 연/월 선택기 값 업데이트
            const yearSelector = document.getElementById('statisticsYearSelector');
            const monthSelector = document.getElementById('statisticsMonthSelector');
            if (yearSelector && monthSelector) {
                yearSelector.value = currentYear;
                monthSelector.value = currentMonth;
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

// 통계 카드 업데이트 함수 (전역 접근용)
function updateStatCards(year, month) {
    console.log(`${year}년 ${month+1}월 통계 데이터 업데이트 중...`);

    // API를 호출하여 선택한 연/월의 데이터 가져오기
    fetch(`/api/admin/statistics/year/${year}/month/${month + 1}`)
        .then(response => {
            if (!response.ok) {
                // API 경로가 변경되었을 수 있으므로 기존 경로도 시도
                return fetch(`/api/admin/statistics/month/${month + 1}`);
            }
            return response;
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('월별 통계 데이터를 가져오는데 실패했습니다.');
            }
            return response.json();
        })
        .then(data => {
            // 통계 카드 업데이트
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

            // 도넛 차트 데이터 업데이트
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
        })
        .catch(error => {
            console.error('통계 데이터 업데이트 오류:', error);
            // 오류 시 아무 작업도 하지 않음 (기존 표시 유지)
        });
}

// 차트 기간 선택기 추가 함수
function addChartRangeSelector() {
    const chartCard = document.querySelector('#reservationChart').closest('.card-body');
    if (!chartCard) return;

    // 차트 제목 요소 선택
    const chartTitle = chartCard.querySelector('.card-title');
    if (!chartTitle) return;

    // 기간 선택기 컨테이너 생성
    const rangeContainer = document.createElement('div');
    rangeContainer.className = 'd-flex justify-content-between align-items-center mb-3';

    // 기존 제목을 컨테이너에 추가
    const titleDiv = document.createElement('div');
    titleDiv.appendChild(chartTitle.cloneNode(true));

    // 기간 선택기 생성
    const rangeSelector = document.createElement('div');
    rangeSelector.className = 'btn-group btn-group-sm';
    rangeSelector.setAttribute('role', 'group');
    rangeSelector.innerHTML = `
        <button type="button" class="btn btn-outline-secondary chart-range active" data-range="all">전체</button>
        <button type="button" class="btn btn-outline-secondary chart-range" data-range="year">1년</button>
        <button type="button" class="btn btn-outline-secondary chart-range" data-range="quarter">3개월</button>
        <button type="button" class="btn btn-outline-secondary chart-range" data-range="month">1개월</button>
        <button type="button" class="btn btn-outline-secondary chart-range" data-range="week">1주일</button>
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
            updateChartByRange(selectedRange);
        });
    });
}

// 선택한 범위에 따라 차트 업데이트
function updateChartByRange(range) {
    const today = new Date();
    let startDate, endDate;
    let categories = [];

    // 범위에 따른 날짜 계산 및 카테고리 설정
    switch(range) {
        case 'week':
            // 최근 7일
            endDate = new Date();
            startDate = new Date();
            startDate.setDate(today.getDate() - 6);
            // 일별 카테고리 생성 (최근 7일)
            for (let i = 0; i < 7; i++) {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + i);
                categories.push(formatDate(date, 'MM.dd'));
            }
            break;

        case 'month':
            // 현재 달
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            // 일주일 단위 카테고리 생성
            const daysInMonth = endDate.getDate();
            for (let i = 0; i < daysInMonth; i += 7) {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + i);
                categories.push(formatDate(date, 'MM.dd'));
            }
            // 월말 추가
            if (categories[categories.length - 1] !== formatDate(endDate, 'MM.dd')) {
                categories.push(formatDate(endDate, 'MM.dd'));
            }
            break;

        case 'quarter':
            // 최근 3개월
            endDate = new Date();
            startDate = new Date();
            startDate.setMonth(today.getMonth() - 2);
            startDate.setDate(1);
            // 월 단위 카테고리 생성 (최근 3개월)
            for (let i = 0; i < 3; i++) {
                const date = new Date(startDate);
                date.setMonth(startDate.getMonth() + i);
                categories.push(formatDate(date, 'yy.MM'));
            }
            break;

        case 'year':
            // 1년 (기본값)
            startDate = new Date(today.getFullYear(), 0, 1);
            endDate = new Date(today.getFullYear(), 11, 31);
            // 월 단위 카테고리 생성 (1년 12개월)
            categories = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
            break;

        case 'all':
        default:
            // 전체 데이터 (시작일과 종료일을 설정하지 않음)
            categories = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
            fetchAllData(); // 전체 데이터를 가져오는 함수 호출
            return; // 차트 업데이트를 여기서 종료
    }

    // API 호출하여 선택한 범위의 데이터 가져오기
    fetchChartDataByRange(startDate, endDate, range, categories);
}

// 전체 데이터 가져오기
function fetchAllData() {
    const apiUrl = `/api/admin/statistics/all`; // 전체 데이터를 가져오는 API 엔드포인트

    // 로딩 표시
    const chartElement = document.querySelector('#reservationChart');
    if (chartElement) {
        chartElement.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div><p class="mt-2">차트 데이터를 불러오는 중...</p></div>';
    }

    // API 호출
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('전체 통계 데이터를 가져오는데 실패했습니다.');
            }
            return response.json();
        })
        .then(data => {
            // 차트 업데이트
            updateReservationChart(data, categories, 'all');
        })
        .catch(error => {
            console.error('전체 데이터 가져오기 오류:', error);
            // 오류 발생 시 임시 데이터 생성
            const categories = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
            const dummyData = generateDummyData('year', categories);
            updateReservationChart(dummyData, categories, 'all');
        });
}