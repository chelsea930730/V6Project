document.addEventListener("DOMContentLoaded", function () {
    // 전체 선택 체크박스 기능
    const selectAllCheckbox = document.getElementById("selectAll");
    const checkboxes = document.querySelectorAll("tbody .form-check-input");

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener("change", function () {
            checkboxes.forEach((checkbox) => {
                checkbox.checked = this.checked;
            });
            updateSelectedCount();
        });
    }

    if (checkboxes) {
        checkboxes.forEach((checkbox) => {
            checkbox.addEventListener("change", updateSelectedCount);
        });
    }

    // 검색 폼 이벤트 처리
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('.search-input');
    const searchType = document.querySelector('.search-select');

    if (searchForm) {
        // 검색어 입력 필드에서 Enter 키 누르면 검색 실행
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (searchInput.value.trim()) {
                    searchForm.submit();
                }
            }
        });

        // 검색 전 유효성 검사
        searchForm.addEventListener('submit', function(e) {
            if (!searchInput.value.trim()) {
                e.preventDefault();
                alert('검색어를 입력해주세요.');
                searchInput.focus();
            } else if (searchType.value === 'id' && !/^\d+$/.test(searchInput.value.trim())) {
                // ID 검색인 경우 숫자만 허용
                if (!confirm('매물 ID는 숫자만 입력 가능합니다. 입력한 값으로 제목 검색을 수행하시겠습니까?')) {
                    e.preventDefault();
                    searchInput.focus();
                } else {
                    // 사용자가 확인하면 검색 유형을 '제목'으로 변경
                    searchType.value = 'title';
                }
            }
        });

        // 검색 타입 변경 시 입력창 placeholder 변경
        searchType.addEventListener('change', function() {
            switch(this.value) {
                case 'id':
                    searchInput.placeholder = '매물 ID 입력 (숫자만)';
                    break;
                case 'title':
                    searchInput.placeholder = '매물 제목 검색';
                    break;
                default:
                    searchInput.placeholder = '검색어를 입력하세요';
            }
            searchInput.focus();
        });
    }

    // 검색 초기화 링크에 이벤트 리스너 추가
    const resetSearchLink = document.querySelector('.search-status a');
    if (resetSearchLink) {
        resetSearchLink.addEventListener('click', function(e) {
            // 애니메이션 효과 추가
            const searchStatus = document.querySelector('.search-status');
            if (searchStatus) {
                e.preventDefault();
                searchStatus.style.transition = 'opacity 0.3s';
                searchStatus.style.opacity = '0';
                setTimeout(() => {
                    window.location.href = this.getAttribute('href');
                }, 300);
            }
        });
    }

    // 선택된 항목 수 업데이트
    function updateSelectedCount() {
        const selectedCount = document.querySelectorAll(
            "tbody .form-check-input:checked"
        ).length;
        const label = document.querySelector('label[for="selectAll"]');
        if (label) {
            label.textContent = `${selectedCount} selected`;
        }
    }

    // 매물 등록 버튼 클릭 이벤트
    const createPropertyBtn = document.getElementById("createPropertyBtn");
    if (createPropertyBtn) {
        createPropertyBtn.addEventListener("click", function () {
            openPopup();
        });
    }

    // 수정 버튼 클릭 이벤트
    const editButtons = document.querySelectorAll(".edit-btn");
    editButtons.forEach((button) => {
        button.addEventListener("click", function () {
            const propertyId = this.getAttribute("data-id");
            openPopup(propertyId);
        });
    });

    // 삭제 버튼 클릭 이벤트
    const deleteButtons = document.querySelectorAll(".delete-btn");
    deleteButtons.forEach((button) => {
        button.addEventListener("click", function () {
            const propertyId = this.getAttribute("data-id");
            if (confirm("정말로 이 매물을 삭제하시겠습니까?")) {
                deleteProperty(propertyId);
            }
        });
    });

    // 매물 삭제 함수
    function deleteProperty(propertyId) {
        fetch(`/api/properties/${propertyId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message || '매물 삭제에 실패했습니다.');
                });
            }
            return response.json();
        })
        .then(data => {
            showNotification(data.message || "매물이 성공적으로 삭제되었습니다.", "success");
            location.reload();
        })
        .catch(error => {
            showNotification(error.message, "error");
        });
    }

    // 팝업창 열기 함수
    function openPopup(propertyId = null) {
        // 팝업 오버레이 생성
        const overlay = document.createElement("div");
        overlay.className = "popup-overlay";
        document.body.appendChild(overlay);

        // 팝업 컨테이너 생성
        const popup = document.createElement("div");
        popup.className = "popup-container";

        // 팝업 헤더 추가
        popup.innerHTML = `
            <div class="popup-header">
                <h3>${propertyId ? "매물 수정" : "매물 등록"}</h3>
                <button type="button" class="btn-close" aria-label="Close"></button>
            </div>
            <iframe src="/admin/create${propertyId ? '?id=' + propertyId : ''}" 
                    style="width: 100%; height: calc(100% - 60px); border: none;"></iframe>
        `;

        document.body.appendChild(popup);

        // 팝업 표시
        setTimeout(() => {
            overlay.style.display = "block";
            popup.style.display = "block";
            setTimeout(() => {
                overlay.style.opacity = "1";
                popup.style.opacity = "1";
            }, 10);
        }, 100);

        // 닫기 버튼 이벤트
        const closeBtn = popup.querySelector(".btn-close");
        closeBtn.addEventListener("click", () => {
            closePopup(overlay, popup);
        });

        // 오버레이 클릭 시 팝업 닫기
        overlay.addEventListener("click", () => {
            closePopup(overlay, popup);
        });

        // ESC 키 누를 때 팝업 닫기
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                closePopup(overlay, popup);
            }
        });
    }

    // 팝업창 닫기 함수
    function closePopup(overlay, popup) {
        overlay.style.opacity = "0";
        popup.style.opacity = "0";
        setTimeout(() => {
            overlay.remove();
            popup.remove();
        }, 300);
    }

    // 알림 메시지 표시 함수
    function showNotification(message, type) {
        const notification = document.createElement("div");
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = "0";
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
});
