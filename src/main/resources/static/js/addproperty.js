document.addEventListener("DOMContentLoaded", function () {
  const ITEMS_PER_PAGE = 8; // 페이지당 표시할 매물 수
  let currentPage = 1;
  
  // 전체 선택 체크박스 기능
  const selectAllCheckbox = document.getElementById("selectAll");
  const checkboxes = document.querySelectorAll("tbody .form-check-input");

  // 페이지네이션 초기화
  function initializePagination() {
    const tbody = document.querySelector("tbody");
    const rows = tbody.querySelectorAll("tr");
    const totalPages = Math.ceil(rows.length / ITEMS_PER_PAGE);

    // 페이지네이션 컨테이너
    const paginationContainer = document.querySelector(".pagination");
    paginationContainer.innerHTML = "";

    // 이전 버튼
    const prevButton = document.createElement("li");
    prevButton.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
    prevButton.innerHTML = `<a class="page-link" href="#" tabindex="-1">이전</a>`;
    paginationContainer.appendChild(prevButton);

    // 페이지 번호 버튼
    for (let i = 1; i <= totalPages; i++) {
      const pageItem = document.createElement("li");
      pageItem.className = `page-item ${currentPage === i ? "active" : ""}`;
      pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
      paginationContainer.appendChild(pageItem);

      // 페이지 번호 클릭 이벤트
      pageItem.addEventListener("click", (e) => {
        e.preventDefault();
        currentPage = i;
        updatePageDisplay();
        initializePagination();
      });
    }

    // 다음 버튼
    const nextButton = document.createElement("li");
    nextButton.className = `page-item ${currentPage === totalPages ? "disabled" : ""}`;
    nextButton.innerHTML = `<a class="page-link" href="#">다음</a>`;
    paginationContainer.appendChild(nextButton);

    // 이전/다음 버튼 이벤트
    prevButton.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPage > 1) {
        currentPage--;
        updatePageDisplay();
        initializePagination();
      }
    });

    nextButton.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPage < totalPages) {
        currentPage++;
        updatePageDisplay();
        initializePagination();
      }
    });
  }

  // 현재 페이지 표시 업데이트
  function updatePageDisplay() {
    const tbody = document.querySelector("tbody");
    const rows = tbody.querySelectorAll("tr");
    
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    rows.forEach((row, index) => {
      if (index >= startIndex && index < endIndex) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  }

  // 초기 페이지네이션 설정
  initializePagination();
  updatePageDisplay();

  // 전체 선택 체크박스 기능
  selectAllCheckbox.addEventListener("change", function () {
    checkboxes.forEach((checkbox) => {
      checkbox.checked = this.checked;
    });
    updateSelectedCount();
  });

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", updateSelectedCount);
  });

  // 선택된 항목 수 업데이트
  function updateSelectedCount() {
    const selectedCount = document.querySelectorAll(
      "tbody .form-check-input:checked"
    ).length;
    const label = document.querySelector('label[for="selectAll"]');
    label.textContent = `${selectedCount} selected`;
  }

  // 매물 등록 버튼 클릭 이벤트
  const createPropertyBtn = document.getElementById("createPropertyBtn");
  createPropertyBtn.addEventListener("click", function () {
    openPopup();
  });

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
      showDeleteConfirmPopup(propertyId);
    });
  });

  // 삭제 확인 팝업창 표시 함수
  function showDeleteConfirmPopup(propertyId) {
    // 팝업 오버레이 생성
    const overlay = document.createElement("div");
    overlay.className = "popup-overlay";
    document.body.appendChild(overlay);

    // 팝업 컨테이너 생성
    const popup = document.createElement("div");
    popup.className = "popup-container delete-confirm-popup";
    popup.style.height = "auto";
    popup.style.maxHeight = "200px";
    popup.style.width = "400px";

    // 팝업 내용 추가
    popup.innerHTML = `
      <div class="popup-header">
        <h3>매물 삭제</h3>
        <button type="button" class="btn-close" aria-label="Close"></button>
      </div>
      <div class="popup-content" style="padding: 20px; text-align: center;">
        <p style="margin-bottom: 20px;">정말로 이 매물을 삭제하시겠습니까?</p>
        <div class="button-group">
          <button class="btn btn-secondary cancel-btn" style="margin-right: 10px;">취소</button>
          <button class="btn btn-danger confirm-btn">삭제</button>
        </div>
      </div>
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

    // 취소 버튼 이벤트
    const cancelBtn = popup.querySelector(".cancel-btn");
    cancelBtn.addEventListener("click", () => {
      closePopup(overlay, popup);
    });

    // 확인 버튼 이벤트
    const confirmBtn = popup.querySelector(".confirm-btn");
    confirmBtn.addEventListener("click", () => {
      // 백엔드에서 구현할 삭제 로직을 위한 propertyId 전달
      console.log("Delete property with ID:", propertyId);
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
    const header = document.createElement("div");
    header.className = "popup-header";
    header.innerHTML = `
            <h3>${propertyId ? "매물 수정" : "매물 등록"}</h3>
            <button type="button" class="btn-close" aria-label="Close"></button>
        `;
    popup.appendChild(header);

    // iframe 생성
    const iframe = document.createElement("iframe");
    iframe.style.width = "100%";
    iframe.style.height = "calc(100% - 50px)";
    iframe.style.border = "none";
    iframe.style.overflow = "auto";
    // propertyId가 있으면 수정 모드로 create.html 열기
    iframe.src = propertyId ? `create.html?id=${propertyId}` : "create.html";
    popup.appendChild(iframe);

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

    // iframe으로부터 메시지 수신
    window.addEventListener("message", function (event) {
      if (event.data.type === "propertySubmitted") {
        showNotification(propertyId ? "매물이 성공적으로 수정되었습니다." : "매물이 성공적으로 등록되었습니다.", "success");
        closePopup(overlay, popup);
        // 페이지 새로고침
        location.reload();
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
