document.addEventListener('DOMContentLoaded', function() {
    // 전체 선택 체크박스 기능
    const selectAllCheckbox = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('tbody .form-check-input');
    const cancelSelectedBtn = document.getElementById('cancelSelectedBtn');

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
            updateSelectedCount();
            updateCancelButtonState();
        });
    }

    if (checkboxes && checkboxes.length > 0) {
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                updateSelectedCount();
                updateCancelButtonState();
                
                // 모든 체크박스가 선택되었는지 확인하여 selectAll 상태 업데이트
                const allChecked = Array.from(checkboxes).every(cb => cb.checked);
                if (selectAllCheckbox) {
                    selectAllCheckbox.checked = allChecked;
                }
            });
        });
    }

    // 선택된 항목 수 업데이트 - 체크박스 레이블 변경
    function updateSelectedCount() {
        const selectedCount = document.querySelectorAll('tbody .form-check-input:checked').length;
        const label = document.querySelector('label[for="selectAll"]');
        if (label) {
            label.textContent = `${selectedCount} selected`;
        }
    }

    // 취소 버튼 활성화/비활성화 상태 업데이트
    function updateCancelButtonState() {
        if (cancelSelectedBtn) {
            const selectedCount = document.querySelectorAll('tbody .form-check-input:checked').length;
            cancelSelectedBtn.disabled = selectedCount === 0;
            
            // 선택된 항목이 있을 때만 텍스트 업데이트
            if (selectedCount > 0) {
                cancelSelectedBtn.innerHTML = `<i class="fas fa-trash-alt"></i> 선택한 예약 취소 (${selectedCount})`;
            } else {
                cancelSelectedBtn.innerHTML = `<i class="fas fa-trash-alt"></i> 선택한 예약 취소`;
            }
        }
    }
    
    // 예약 취소 버튼 이벤트
    if (cancelSelectedBtn) {
        cancelSelectedBtn.addEventListener('click', function() {
            const selectedCheckboxes = document.querySelectorAll('tbody .form-check-input:checked');
            const selectedIds = Array.from(selectedCheckboxes).map(cb => cb.value);
            
            if (selectedIds.length === 0) {
                return;
            }
            
            if (confirm(`선택한 ${selectedIds.length}개의 예약을 취소하고 목록에서 삭제하시겠습니까?`)) {
                adminCancelReservations(selectedIds);
            }
        });
    }
    
    // 관리자 예약 취소 API 호출 (실제 삭제를 위한 함수)
    function adminCancelReservations(reservationIds) {
        const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content;
        const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (csrfHeader && csrfToken) {
            headers[csrfHeader] = csrfToken;
        }
        
        fetch('/admin/reservations/cancel', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ reservationIds: reservationIds })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || '예약 취소 처리 중 오류가 발생했습니다.');
                });
            }
            return response.json();
        })
        .then(data => {
            alert(data.message || '선택한 예약이 성공적으로 취소되었습니다.');
            window.location.reload(); // 페이지 새로고침
        })
        .catch(error => {
            alert('오류: ' + error.message);
        });
    }
    
    // 상태 변경 처리 - 새로운 방식 (계약 불가는 삭제하지 않고 상태만 변경)
    setupStatusButtons();

    // 필터 적용 버튼 클릭 이벤트
    const applyFilterButton = document.getElementById('applyFilterButton');
    if (applyFilterButton) {
        applyFilterButton.addEventListener('click', function() {
            applyFilters();
        });
    }
    
    // 필터 초기화 버튼
    const resetFilterButton = document.getElementById('resetFilterButton');
    if (resetFilterButton) {
        resetFilterButton.addEventListener('click', function() {
            window.location.href = window.location.pathname;
        });
    }
    
    // 상태 필터 변경 이벤트
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            // 필터가 자동으로 적용되지 않도록 변경, 버튼 클릭 시 적용되도록 함
        });
    }
    
    // 검색 버튼 클릭 이벤트
    const searchButton = document.getElementById('searchButton');
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            applyFilters();
        });
    }
    
    // 검색어 입력 필드에서 Enter 키 이벤트
    const searchQuery = document.getElementById('searchQuery');
    if (searchQuery) {
        searchQuery.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyFilters();
            }
        });
    }
    
    // 필터 적용 함수
    function applyFilters() {
        const status = document.getElementById('statusFilter').value;
        const startDate = document.getElementById('startDateFilter').value;
        const endDate = document.getElementById('endDateFilter').value;
        const searchType = document.getElementById('searchType').value;
        const search = document.getElementById('searchQuery').value;
        
        // 현재 URL 가져오기
        let url = new URL(window.location.href);
        
        // 쿼리 파라미터 설정
        if (status) url.searchParams.set('status', status);
        else url.searchParams.delete('status');
        
        if (startDate) url.searchParams.set('startDate', startDate);
        else url.searchParams.delete('startDate');
        
        if (endDate) url.searchParams.set('endDate', endDate);
        else url.searchParams.delete('endDate');
        
        if (searchType && search) {
            url.searchParams.set('searchType', searchType);
            url.searchParams.set('search', search);
        } else {
            url.searchParams.delete('searchType');
            url.searchParams.delete('search');
        }
        
        // 페이지 파라미터 초기화
        url.searchParams.set('page', '0');
        
        // 변경된 URL로 이동
        window.location.href = url.toString();
    }

    // 상세보기 버튼 클릭 이벤트
    document.querySelectorAll('.view-btn').forEach(button => {
        button.addEventListener('click', () => {
            const reservationId = button.getAttribute('data-id');
            loadReservationDetails(reservationId);
        });
    });

    // 검색 유형 변경 시 입력 필드 placeholder 업데이트
    const searchTypeSelect = document.getElementById('searchType');
    const searchQueryInput = document.getElementById('searchQuery');

    if (searchTypeSelect && searchQueryInput) {
        searchTypeSelect.addEventListener('change', function() {
            switch(this.value) {
                case 'name':
                    searchQueryInput.placeholder = '고객 이름 검색...';
                    break;
                case 'email':
                    searchQueryInput.placeholder = '이메일 검색...';
                    break;
                case 'reservationId':
                    searchQueryInput.placeholder = '예약번호 입력...';
                    break;
                case 'property':
                    searchQueryInput.placeholder = '매물 제목 또는 위치 검색...';
                    break;
                default:
                    searchQueryInput.placeholder = '검색어 입력...';
            }
        });
        
        // 페이지 로드 시 초기 placeholder 설정
        const currentSearchType = searchTypeSelect.value;
        if (currentSearchType) {
            const event = new Event('change');
            searchTypeSelect.dispatchEvent(event);
        }
    }
});

// 상태 버튼 설정
function setupStatusButtons() {
    document.querySelectorAll('.status-btn').forEach(button => {
        button.addEventListener('click', function() {
            const currentStatus = this.getAttribute('data-current-status');
            const reservationId = this.getAttribute('data-id');
            const buttonRect = this.getBoundingClientRect();
            
            // 상태 옵션 생성 (계약 불가 색상을 주황색으로 변경)
            const options = [
                { id: 'PENDING', text: '예약 대기', class: 'status-btn btn-warning' },
                { id: 'CONFIRMED', text: '예약 중', class: 'status-btn btn-primary' },
                { id: 'COMPL', text: '계약 완료', class: 'status-btn btn-success' },
                { id: 'CANCELLED', text: '계약 불가', class: 'status-btn btn-orange' }
            ];
            
            // 상태 메뉴 생성
            const menu = document.createElement('div');
            menu.className = 'status-menu';
            menu.style.position = 'absolute';
            menu.style.top = `${buttonRect.bottom + window.scrollY + 5}px`;
            menu.style.left = `${buttonRect.left + window.scrollX}px`;
            menu.style.zIndex = '1000';
            menu.style.backgroundColor = 'white';
            menu.style.border = '1px solid #ddd';
            menu.style.borderRadius = '4px';
            menu.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
            
            // 현재 상태를 제외한 옵션 추가
            options.forEach(option => {
                if (option.id !== currentStatus) {
                    const item = document.createElement('div');
                    item.textContent = option.text;
                    item.className = 'status-menu-item';
                    item.style.padding = '8px 16px';
                    item.style.cursor = 'pointer';
                    item.style.width = '100px';
                    item.style.textAlign = 'center';
                    
                    item.addEventListener('mouseover', () => {
                        item.style.backgroundColor = '#f5f5f5';
                    });
                    
                    item.addEventListener('mouseout', () => {
                        item.style.backgroundColor = 'white';
                    });
                    
                    item.addEventListener('click', () => {
                        changeReservationStatus(reservationId, option.id, button, option.text, option.class);
                        document.body.removeChild(menu);
                    });
                    
                    menu.appendChild(item);
                }
            });
            
            document.body.appendChild(menu);
            
            // 메뉴 외부 클릭 시 닫기
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target) && e.target !== button) {
                    if (document.body.contains(menu)) {
                        document.body.removeChild(menu);
                    }
                    document.removeEventListener('click', closeMenu);
                }
            });
        });
    });
}

// 상태 변경 함수 수정 (계약 불가는 삭제하지 않고 상태만 변경)
function changeReservationStatus(reservationId, newStatus, button, statusText, statusClass) {
    // CSRF 토큰 가져오기
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content;
    const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;
    
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (csrfHeader && csrfToken) {
        headers[csrfHeader] = csrfToken;
    }
    
    const requestBody = JSON.stringify({ 
        reservationId: reservationId,
        status: newStatus
    });
    
    console.log(`상태 변경 요청: ID=${reservationId}, 새 상태=${newStatus}`);
    
    // 상태 변경 요청 (삭제하지 않고 상태만 변경)
    fetch(`/api/reservations/update-status-only`, {
        method: 'POST',
        headers: headers,
        body: requestBody
    })
    .then(response => {
        console.log(`응답 상태: ${response.status}`);
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(text || '상태 변경에 실패했습니다.');
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('응답 데이터:', data);
        
        // UI 업데이트
        button.textContent = statusText;
        button.className = statusClass;
        button.setAttribute('data-current-status', newStatus);
        
        // 성공 메시지 표시
        showNotification('상태가 성공적으로 변경되었습니다.', 'success');
    })
    .catch(error => {
        console.error('상태 변경 오류:', error);
        showNotification(error.message || '상태 변경에 실패했습니다.', 'error');
    });
}

// 알림 표시 함수
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'success' ? 'success' : 'danger'} position-fixed`;
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '1050';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 500);
    }, 3000);
}

// 예약 상세 정보 로드
function loadReservationDetails(reservationId) {
    fetch(`/api/reservations/${reservationId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('예약 정보를 불러오는데 실패했습니다.');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('reservationId').value = data.reservationId;
            document.getElementById('reservationNumber').textContent = 'NO.' + data.reservationId;
            document.getElementById('customerName').textContent = data.user.name;
            document.getElementById('customerEmail').textContent = data.user.email;
            document.getElementById('customerPhone').textContent = data.user.phone || '연락처 없음';
            document.getElementById('reservationDate').value = formatDateForInput(data.reservedDate);
            document.getElementById('reservationStatus').value = data.status;
            document.getElementById('messageContent').value = data.message || '';
            document.getElementById('adminNotes').value = data.adminNotes || '';
            
            const propertyListContainer = document.getElementById('propertyList');
            propertyListContainer.innerHTML = '';
            
            if (data.properties && data.properties.length > 0) {
                const propertyList = document.createElement('ul');
                propertyList.className = 'list-group';
                
                data.properties.forEach(property => {
                    const item = document.createElement('li');
                    item.className = 'list-group-item';
                    item.innerHTML = `
                        <strong>${property.title}</strong><br>
                        ${property.location}<br>
                        월세: ${property.monthlyPrice.toLocaleString()}円
                    `;
                    propertyList.appendChild(item);
                });
                
                propertyListContainer.appendChild(propertyList);
            } else {
                propertyListContainer.innerHTML = '<p class="text-muted">등록된 매물 정보가 없습니다.</p>';
            }
            
            document.getElementById('chatLink').href = `/mypage/chat.html?user=${data.user.email}`;
            
            const consultingModal = new bootstrap.Modal(document.getElementById('consultingModal'));
            consultingModal.show();
        })
        .catch(error => {
            console.error('Error:', error);
            alert(error.message);
        });
}

// 날짜를 datetime-local 입력에 맞는 형식으로 변환
function formatDateForInput(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // "YYYY-MM-DDThh:mm" 형식으로 변환
}

// 저장 버튼 클릭 이벤트 핸들러 설정
document.addEventListener('DOMContentLoaded', function() {
    const saveButton = document.getElementById('saveReservation');
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            const formData = new FormData(document.getElementById('reservationForm'));
            const reservationData = {
                reservationId: formData.get('reservationId'),
                reservedDate: formData.get('reservedDate'),
                status: formData.get('status'),
                message: formData.get('message'),
                adminNotes: formData.get('adminNotes')
            };
            
            // CSRF 토큰 가져오기
            const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content;
            const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;
            
            // 요청 헤더 설정
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (csrfHeader && csrfToken) {
                headers[csrfHeader] = csrfToken;
            }
            
            fetch('/api/reservations/update-simple', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(reservationData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('예약 정보 저장에 실패했습니다.');
                }
                return response.json();
            })
            .then(data => {
                alert('예약 정보가 성공적으로 저장되었습니다.');
                window.location.reload(); // 페이지 새로고침
            })
            .catch(error => {
                console.error('Error:', error);
                alert(error.message);
            });
        });
    }
}); 