// widgetReservations 변수는 한 번만 선언
let widgetReservations = [];

function setupReservationWidget() {
    const widgetToggle = document.getElementById('reservation-widget-toggle');
    const widgetContent = document.getElementById('reservation-widget-content');
    const dateFilter = document.getElementById('widget-date-filter');
    
    if (widgetToggle) {
        widgetToggle.addEventListener('click', function() {
            if (widgetContent.style.display === 'none') {
                widgetContent.style.display = 'block';
            } else {
                widgetContent.style.display = 'none';
            }
        });
    }
    
    if (dateFilter) {
        dateFilter.addEventListener('change', function() {
            loadReservationData();
        });
    }
    
    // 초기 데이터 로드
    loadReservationData();
}

function loadReservationData() {
    const dateFilter = document.getElementById('widget-date-filter');
    const reservationList = document.getElementById('widget-reservation-list');
    
    if (!dateFilter || !reservationList) return;
    
    const dateValue = dateFilter.value;
    let days = 0;
    
    if (dateValue !== 'today') {
        days = parseInt(dateValue);
    }
    
    // 사용자가 관리자인지 확인
    const isAdmin = document.body.classList.contains('admin-role');
    const apiUrl = isAdmin 
        ? `/api/reservations/all`
        : `/api/reservations/recent?days=${days}`;
    
    // 실제 API 사용 (더미 데이터 대신)
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            widgetReservations = data;
            updateReservationList();
        })
        .catch(error => {
            console.error('예약 정보를 불러오는 중 오류 발생:', error);
            reservationList.innerHTML = '<p>예약 데이터를 불러오는 중 오류가 발생했습니다.</p>';
        });
}

function updateReservationList() {
    const reservationList = document.getElementById('widget-reservation-list');
    
    if (!reservationList) return;
    
    if (widgetReservations.length === 0) {
        reservationList.innerHTML = '<p>해당 기간에 예약이 없습니다.</p>';
        return;
    }
    
    let html = '';
    const isAdmin = document.body.classList.contains('admin-role');
    
    widgetReservations.forEach(reservation => {
        const reservedDate = new Date(reservation.reservedDate).toLocaleDateString();
        
        // 매물 정보 표시 방법 수정
        let propertyInfo = '';
        if (reservation.propertyTitles && reservation.propertyTitles.length > 0) {
            propertyInfo = `<p><strong>매물:</strong> ${reservation.propertyTitles.join(", ")}</p>`;
        }
        
        if (isAdmin) {
            html += `
                <div class="reservation-item">
                    <p><strong>예약자:</strong> ${reservation.name}</p>
                    <p><strong>이메일:</strong> ${reservation.email}</p>
                    <p><strong>예약일:</strong> ${reservedDate}</p>
                    <p><strong>상태:</strong> ${reservation.status}</p>
                    ${propertyInfo}
                </div>
            `;
        } else {
            html += `
                <div class="reservation-item">
                    <p><strong>예약일:</strong> ${reservedDate}</p>
                    <p><strong>상태:</strong> ${reservation.status}</p>
                    <p><strong>메시지:</strong> ${reservation.message || '없음'}</p>
                    ${propertyInfo}
                </div>
            `;
        }
    });
    
    reservationList.innerHTML = html;
} 