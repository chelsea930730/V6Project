document.addEventListener("DOMContentLoaded", function () {
    // 상세보기 버튼 클릭 이벤트
    const detailButtons = document.querySelectorAll('.detail-btn');
    detailButtons.forEach(button => {
        button.addEventListener('click', function () {
            alert('상세보기 페이지로 이동합니다.');
            // 상세보기 페이지로 이동하는 로직 추가
        });
    });

    // 상담 버튼 클릭 이벤트
    const consultButton = document.querySelector('.consult-btn');
    consultButton.addEventListener('click', function () {
        alert('상담 페이지로 이동합니다.');
        // 상담 페이지로 이동하는 로직 추가
    });

    // 이미지 모달 기능
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const closeBtn = document.getElementsByClassName('close')[0];

    // 모든 매물 이미지에 클릭 이벤트 추가
    document.querySelectorAll('.grid-item img').forEach(img => {
        img.onclick = function() {
            modal.style.display = "block";
            modalImg.src = this.src;
        }
    });

    // 닫기 버튼 클릭 시 모달 닫기
    closeBtn.onclick = function() {
        modal.style.display = "none";
    }

    // 모달 바깥 영역 클릭 시 모달 닫기
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
});