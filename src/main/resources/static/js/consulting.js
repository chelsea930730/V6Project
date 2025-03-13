document.addEventListener('DOMContentLoaded', function() {
    // 전체 선택 체크박스 기능
    const selectAllCheckbox = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('tbody .form-check-input');

    selectAllCheckbox.addEventListener('change', function() {
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
        updateSelectedCount();
    });

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedCount);
    });

    // 선택된 항목 수 업데이트
    function updateSelectedCount() {
        const selectedCount = document.querySelectorAll('tbody .form-check-input:checked').length;
        const label = document.querySelector('label[for="selectAll"]');
        label.textContent = `${selectedCount} selected`;
    }

    // 상태 버튼 클릭 이벤트
    const statusButtons = document.querySelectorAll('.status-btn');
    
    statusButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const currentStatus = this.getAttribute('data-current-status');
            const consultationId = this.getAttribute('data-id');
            showStatusDropdown(e, this, currentStatus, consultationId);
        });
    });

    // 상태 변경 드롭다운 표시
    function showStatusDropdown(event, button, currentStatus, consultationId) {
        const statuses = [
            { value: 'WAITING', text: '예약 대기', class: 'btn-warning' },
            { value: 'COMPLETED', text: '상담 완료', class: 'btn-success' },
            { value: 'CANCELLED', text: '상담 취소', class: 'btn-danger' }
        ];

        // 기존 드롭다운 제거
        const existingDropdown = document.querySelector('.status-dropdown');
        if (existingDropdown) {
            existingDropdown.remove();
        }

        // 새 드롭다운 생성
        const dropdown = document.createElement('div');
        dropdown.className = 'status-dropdown';
        dropdown.style.top = `${event.pageY}px`;
        dropdown.style.left = `${event.pageX}px`;

        statuses.forEach(status => {
            if (status.value !== currentStatus) {
                const item = document.createElement('div');
                item.className = 'status-dropdown-item';
                item.textContent = status.text;
                
                item.addEventListener('click', async () => {
                    try {
                        const response = await fetch(`/api/consultations/${consultationId}/status`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ status: status.value })
                        });

                        if (!response.ok) {
                            throw new Error('상태 변경에 실패했습니다.');
                        }

                        // 성공적으로 상태가 변경되면 UI 업데이트
                        button.textContent = status.text;
                        button.className = `btn ${status.class} btn-sm status-btn`;
                        button.setAttribute('data-current-status', status.value);
                        
                        // 알림 표시
                        showNotification('상태가 성공적으로 변경되었습니다.', 'success');
                    } catch (error) {
                        console.error('상태 변경 오류:', error);
                        showNotification('상태 변경에 실패했습니다.', 'error');
                    } finally {
                        dropdown.remove();
                    }
                });
                
                dropdown.appendChild(item);
            }
        });

        document.body.appendChild(dropdown);
        dropdown.classList.add('show');

        // 드롭다운 외부 클릭 시 닫기
        document.addEventListener('click', function closeDropdown(e) {
            if (!dropdown.contains(e.target) && e.target !== button) {
                dropdown.remove();
                document.removeEventListener('click', closeDropdown);
            }
        });
    }

    // 알림 표시 함수
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'success' ? 'success' : 'danger'} position-fixed`;
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '1050';
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}); 