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
});