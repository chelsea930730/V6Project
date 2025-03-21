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

    // 장바구니의 매물 삭제 버튼 이벤트 추가
    const deleteCartBtn = document.querySelector('.delete-cart-btn');
    if (deleteCartBtn) {
        deleteCartBtn.addEventListener('click', function() {
            deleteSelectedItems();
        });
    }

    // 선택한 매물 삭제 함수 (AJAX 방식)
    function deleteSelectedItems() {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
        
        if (checkboxes.length === 0) {
            alert('삭제할 매물을 선택해주세요.');
            return;
        }
        
        if (confirm(checkboxes.length + '개의 매물을 장바구니에서 삭제하시겠습니까?')) {
            // 선택된 매물 ID 수집
            const propertyIds = Array.from(checkboxes).map(cb => cb.value);
            
            // CSRF 토큰 가져오기 (Spring Security 사용 시)
            const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content;
            const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;
            
            // 요청 헤더 설정
            const headers = {
                'Content-Type': 'application/json'
            };
            
            // CSRF 토큰이 있으면 헤더에 추가
            if (csrfHeader && csrfToken) {
                headers[csrfHeader] = csrfToken;
            }
            
            // Fetch API로 요청
            fetch('/cart/remove-selected', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ propertyIds: propertyIds })
            })
            .then(response => {
                if (response.ok) {
                    // 성공 메시지 표시 후 페이지 새로고침
                    alert(checkboxes.length + '개의 매물이 장바구니에서 제거되었습니다.');
                    window.location.reload();
                } else {
                    alert('매물 삭제 중 오류가 발생했습니다.');
                }
            })
            .catch(error => {
                console.error('에러:', error);
                alert('매물 삭제 중 오류가 발생했습니다.');
            });
        }
    }
});