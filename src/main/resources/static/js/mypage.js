document.addEventListener('DOMContentLoaded', function() {
    // 전체 선택 체크박스 기능
    const selectAllCheckbox = document.getElementById('selectAll');
    const selectAllHistory = document.getElementById('selectAllHistory');

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.reservation-table tbody input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
    }

    if (selectAllHistory) {
        selectAllHistory.addEventListener('change', function() {
            const checkboxes = document.querySelector('.history-table tbody')
                .querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => checkbox.checked = this.checked);
        });
    }

    // 취소 버튼 클릭 이벤트
    const cancelButton = document.querySelector('.cancel-btn');
    if (cancelButton) {
        cancelButton.addEventListener('click', function() {
            const checkedBoxes = document.querySelectorAll('.reservation-table tbody input[type="checkbox"]:checked');

            if (checkedBoxes.length === 0) {
                alert('취소할 예약을 선택해주세요.');
                return;
            }

            if (confirm(checkedBoxes.length + '개의 예약을 취소하시겠습니까?')) {
                const reservationIds = Array.from(checkedBoxes).map(cb => cb.value);

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

                fetch('/mypage/cancel-reservations', {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({ reservationIds: reservationIds })
                })
                    .then(response => {
                        if (response.ok) {
                            alert('선택한 예약이 취소되었습니다.');
                            window.location.reload();
                        } else {
                            throw new Error('예약 취소 처리 중 오류가 발생했습니다.');
                        }
                    })
                    .catch(error => {
                        alert(error.message);
                    });
            }
        });
    }

    const deleteBtn = document.querySelector('.delete-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            const checked = document.querySelector('.history-table tbody')
                .querySelectorAll('input[type="checkbox"]:checked');
            if (checked.length > 0) {
                if (confirm('선택한 상담 내역을 삭제하시겠습니까?')) {
                    // 실제 삭제 API 호출
                    const reservationIds = Array.from(checked).map(cb => parseInt(cb.value));
                    deleteReservations(reservationIds);
                }
            } else {
                alert('삭제할 상담 내역을 선택해주세요.');
            }
        });
    }

    // 예약 삭제 API 호출 함수
    function deleteReservations(reservationIds) {
        // CSRF 토큰 가져오기 (폼에서 직접 가져오는 방식으로 변경)
        const headers = {
            'Content-Type': 'application/json'
        };

        // 폼에서 CSRF 토큰 찾기
        const csrfToken = document.querySelector('input[name="_csrf"]');
        if (csrfToken) {
            headers['X-CSRF-TOKEN'] = csrfToken.value;
        }

        fetch('/mypage/delete-reservations', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ reservationIds: reservationIds })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);
                    // 페이지 새로고침
                    window.location.reload();
                } else {
                    alert(data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('서버 통신 중 오류가 발생했습니다.');
            });
    }
});