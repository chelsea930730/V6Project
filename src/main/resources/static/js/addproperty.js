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
            <iframe src="${propertyId ? `/admin/property/edit/${propertyId}` : '/admin/property/create'}" 
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
