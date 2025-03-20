document.addEventListener('DOMContentLoaded', function() {
    // 전체 선택 체크박스 기능
    const selectAll = document.getElementById('selectAll');
    const selectAllHistory = document.getElementById('selectAllHistory');

    selectAll.addEventListener('change', function() {
        const checkboxes = document.querySelector('.reservation-table tbody')
            .querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => checkbox.checked = this.checked);
    });

    selectAllHistory.addEventListener('change', function() {
        const checkboxes = document.querySelector('.history-table tbody')
            .querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => checkbox.checked = this.checked);
    });

    // 버튼 클릭 이벤트
    document.querySelector('.cancel-btn').addEventListener('click', function() {
        const checked = document.querySelector('.reservation-table tbody')
            .querySelectorAll('input[type="checkbox"]:checked');
        if (checked.length > 0) {
            if (confirm('선택한 예약을 취소하시겠습니까?')) {
                alert('예약이 취소되었습니다.');
            }
        } else {
            alert('취소할 예약을 선택해주세요.');
        }
    });

    document.querySelector('.delete-btn').addEventListener('click', function() {
        const checked = document.querySelector('.history-table tbody')
            .querySelectorAll('input[type="checkbox"]:checked');
        if (checked.length > 0) {
            if (confirm('선택한 상담 내역을 삭제하시겠습니까?')) {
                alert('상담 내역이 삭제되었습니다.');
            }
        } else {
            alert('삭제할 상담 내역을 선택해주세요.');
        }
    });
});