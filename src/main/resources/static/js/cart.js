document.addEventListener("DOMContentLoaded", function () {
    // 상세보기 버튼 클릭 이벤트
    const detailButtons = document.querySelectorAll('.detail-btn');
    detailButtons.forEach(button => {
        button.addEventListener('click', function () {
            alert('상세보기 페이지로 이동합니다.');
            // 상세보기 페이지로 이동하는 로직 추가
        });
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

    // 전체 선택 체크박스 기능 수정
    const selectAllCheckbox = document.getElementById('select-all-checkbox');
    
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const isChecked = this.checked;
            
            // 모든 개별 체크박스 선택 (현재 페이지에 있는 체크박스들)
            document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                if (checkbox.id !== 'select-all-checkbox') {
                    checkbox.checked = isChecked;
                }
            });
        });
    }
    
    // 문서에 이벤트 위임 방식으로 체크박스 변경 감지
    document.addEventListener('change', function(event) {
        if (event.target.type === 'checkbox' && event.target.id !== 'select-all-checkbox') {
            updateSelectAllCheckbox();
        }
    });
    
    // 전체 선택 체크박스 상태 업데이트 함수
    function updateSelectAllCheckbox() {
        if (!selectAllCheckbox) return;
        
        const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'))
            .filter(cb => cb.id !== 'select-all-checkbox');
        
        const allChecked = checkboxes.every(cb => cb.checked);
        const someChecked = checkboxes.some(cb => cb.checked);
        
        selectAllCheckbox.checked = allChecked;
        selectAllCheckbox.indeterminate = !allChecked && someChecked;
    }
    
    // 페이지 로드 시 초기 상태 설정
    updateSelectAllCheckbox();

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