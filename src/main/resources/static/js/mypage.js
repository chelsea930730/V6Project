document.addEventListener('DOMContentLoaded', function() {
    // 모든 상태 셀렉트 박스에 상태에 따른 클래스 부여
    document.querySelectorAll('.status-select').forEach(select => {
        const status = select.value.toLowerCase();
        select.classList.add(status); // 상태값에 따른 클래스 추가
        
        // 상태별 색상 조정
        if (status === 'compl' || status === 'confirmed') {
            select.style.color = 'white';
        }
    });

    // 모든 예약 날짜 수집하여 달력에 표시
    const reservationDates = collectReservationDates();
    const today = new Date().toISOString().split('T')[0];
    
    // 달력 초기화
    initializeCalendar(reservationDates, today);
    
    // 페이지 로드 시 오늘 날짜의 예약 표시
    loadDayReservations(today);
});

// 모든 예약 날짜를 수집하는 함수
function collectReservationDates() {
    // 활성 예약과 완료된 예약 모두에서 날짜 수집
    const activeReservations = document.querySelectorAll('.reservation-section tr');
    const completedReservations = document.querySelectorAll('.history-section tr');
    let dates = [];
    
    // 활성 예약에서 날짜 수집
    activeReservations.forEach(row => {
        if (row.querySelector('td')) {  // 헤더나 빈 메시지 행은 제외
            const dateCell = row.querySelector('td:nth-child(2)');
            if (dateCell) {
                const dateText = dateCell.textContent.trim();
                dates.push(dateText);
            }
        }
    });
    
    // 완료된 예약에서 날짜 수집
    completedReservations.forEach(row => {
        if (row.querySelector('td')) {  // 헤더나 빈 메시지 행은 제외
            const dateCell = row.querySelector('td:nth-child(2)');
            if (dateCell) {
                const dateText = dateCell.textContent.trim();
                dates.push(dateText);
            }
        }
    });
    
    // 중복 제거
    return [...new Set(dates)];
}

// 전역 변수로 현재 날짜 정보 설정
let currentDate, currentMonth, currentYear;

// 달력 초기화 함수
function initializeCalendar(reservationDates = [], todayString = '') {
    // URL에서 날짜 파라미터가 있으면 해당 날짜로 설정, 없으면 현재 날짜
    const urlParams = new URLSearchParams(window.location.search);
    const dateParam = urlParams.get('date');
    
    const today = dateParam ? new Date(dateParam) : new Date(todayString || new Date());
    currentDate = today.getDate();
    currentMonth = today.getMonth();
    currentYear = today.getFullYear();

    // 달력 컨테이너
    const calendarContainer = document.getElementById('calendarContainer');
    if (!calendarContainer) return;
    
    // 달력 업데이트
    updateCalendar(reservationDates, todayString || today.toISOString().split('T')[0]);

    // 이전/다음 달 버튼 이벤트
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');

    if (prevMonthBtn) {
        // 이전 클릭 이벤트 리스너 제거 후 다시 추가 (중복 방지)
        prevMonthBtn.removeEventListener('click', handlePrevMonth);
        prevMonthBtn.addEventListener('click', handlePrevMonth);
    }

    if (nextMonthBtn) {
        // 다음 클릭 이벤트 리스너 제거 후 다시 추가 (중복 방지)
        nextMonthBtn.removeEventListener('click', handleNextMonth);
        nextMonthBtn.addEventListener('click', handleNextMonth);
    }
}

// 이전 달 이동 핸들러
function handlePrevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    
    // 달력 업데이트
    const reservationDates = collectReservationDates();
    updateCalendar(reservationDates, new Date().toISOString().split('T')[0]);
    
    // 날짜 표시 업데이트
    updateDateDisplay();
}

// 다음 달 이동 핸들러
function handleNextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    
    // 달력 업데이트
    const reservationDates = collectReservationDates();
    updateCalendar(reservationDates, new Date().toISOString().split('T')[0]);
    
    // 날짜 표시 업데이트
    updateDateDisplay();
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
            .replace(/\./g, function(match, offset, string) {
                if (offset === 4) return '년 ';
                if (offset === 8) return '월 ';
                return '일';
            });
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
            <div class="col day-name">일</div>
            <div class="col day-name">월</div>
            <div class="col day-name">화</div>
            <div class="col day-name">수</div>
            <div class="col day-name">목</div>
            <div class="col day-name">금</div>
            <div class="col day-name">토</div>
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
                        ${hasReservation ? '<div class="reservation-dot"></div>' : ''}
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
                            ${hasReservation ? '<div class="reservation-dot"></div>' : ''}
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
                // 모든 셀에서 selected 클래스 제거
                document.querySelectorAll('.day-cell').forEach(c => {
                    c.classList.remove('selected');
                });
                
                // 현재 셀에 selected 클래스 추가
                this.classList.add('selected');
                
                const dateStr = this.getAttribute('data-date');
                if (dateStr) {
                    // 날짜 선택 시 날짜 표시 업데이트
                    currentDate = parseInt(this.textContent.trim());
                    updateDateDisplay();
                    
                    // 선택한 날짜의 예약 정보 가져와서 표시
                    loadDayReservations(dateStr);
                }
            });
        }
    });
}

// 선택한 날짜의 예약 정보를 화면에 표시하는 함수
function loadDayReservations(dateStr) {
    // 해당 날짜의 예약 정보를 찾기 위해 activeReservations와 completedReservations에서 필터링
    const activeReservations = document.querySelectorAll('.reservation-section tr');
    const completedReservations = document.querySelectorAll('.history-section tr');
    let matchingReservations = [];
    
    // 활성 예약에서 선택한 날짜와 일치하는 예약 찾기
    activeReservations.forEach(row => {
        if (row.querySelector('td')) {  // 헤더나 빈 메시지 행은 제외
            const dateCell = row.querySelector('td:nth-child(2)');
            if (dateCell && dateCell.textContent.trim() === dateStr) {
                matchingReservations.push(row);
            }
        }
    });
    
    // 완료된 예약에서 선택한 날짜와 일치하는 예약 찾기
    completedReservations.forEach(row => {
        if (row.querySelector('td')) {  // 헤더나 빈 메시지 행은 제외
            const dateCell = row.querySelector('td:nth-child(2)');
            if (dateCell && dateCell.textContent.trim() === dateStr) {
                matchingReservations.push(row);
            }
        }
    });
    
    const noReservationsMessage = document.getElementById('noReservationsMessage');
    const dayReservationsContainer = document.getElementById('dayReservationsContainer');
    
    if (matchingReservations.length === 0) {
        // 예약이 없는 경우
        noReservationsMessage.style.display = 'block';
        dayReservationsContainer.style.display = 'none';
        return;
    }
    
    // 예약이 있는 경우
    noReservationsMessage.style.display = 'none';
    dayReservationsContainer.style.display = 'block';
    
    // 예약 항목 HTML 생성
    let reservationsHTML = '';
    matchingReservations.forEach(row => {
        const reservationId = row.querySelector('td:nth-child(1)').textContent;
        const reservationDate = row.querySelector('td:nth-child(2)').textContent;
        const statusSelect = row.querySelector('select.status-select');
        const message = row.querySelector('td:nth-child(4)').textContent;
        
        const status = statusSelect.value.toLowerCase();
        const statusText = statusSelect.options[statusSelect.selectedIndex].text;
        
        const statusClass = 
            status === 'pending' ? 'bg-warning text-dark' : 
            status === 'confirmed' ? 'bg-primary' :
            status === 'compl' ? 'bg-success' :
            'bg-orange';
            
        reservationsHTML += `
            <div class="reservation-item mb-3 p-3 border rounded">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">예약 정보</h6>
                        <small class="text-muted">${reservationDate}</small>
                        <div class="mt-2">
                            <small class="text-muted">문의사항: ${message}</small>
                        </div>
                    </div>
                    <div>
                        <span class="badge ${statusClass}">${statusText}</span>
                        <div class="reservation-number mt-2 text-muted">${reservationId}</div>
                        <a href="/mypage/reservation/${reservationId.replace('NO.', '')}" class="btn btn-sm btn-outline-primary mt-2">
                            <i class="fas fa-eye"></i> 상세보기
                        </a>
                    </div>
                </div>
            </div>
        `;
    });
    
    dayReservationsContainer.innerHTML = reservationsHTML;
}