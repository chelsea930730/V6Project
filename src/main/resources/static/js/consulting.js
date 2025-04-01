document.addEventListener('DOMContentLoaded', function() {
    // 전체 선택 체크박스 기능
    const selectAllCheckbox = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('tbody .form-check-input');
    const cancelSelectedBtn = document.getElementById('cancelSelectedBtn');

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
            updateSelectedCount();
            updateCancelButtonState();
        });
    }

    if (checkboxes && checkboxes.length > 0) {
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                updateSelectedCount();
                updateCancelButtonState();

                // 모든 체크박스가 선택되었는지 확인하여 selectAll 상태 업데이트
                const allChecked = Array.from(checkboxes).every(cb => cb.checked);
                if (selectAllCheckbox) {
                    selectAllCheckbox.checked = allChecked;
                }
            });
        });
    }

    // 선택된 항목 수 업데이트 - 체크박스 레이블 변경
    function updateSelectedCount() {
        const selectedCount = document.querySelectorAll('tbody .form-check-input:checked').length;
        const label = document.querySelector('label[for="selectAll"]');
        if (label) {
            label.textContent = `${selectedCount} selected`;
        }
    }

    // 취소 버튼 활성화/비활성화 상태 업데이트
    function updateCancelButtonState() {
        if (cancelSelectedBtn) {
            const selectedCount = document.querySelectorAll('tbody .form-check-input:checked').length;
            cancelSelectedBtn.disabled = selectedCount === 0;

            // 버튼 텍스트는 항상 "선택한 예약 삭제"로 유지
            if (selectedCount > 0) {
                cancelSelectedBtn.innerHTML = `<i class="fas fa-trash-alt"></i> 선택한 예약 삭제 (${selectedCount})`;
            } else {
                cancelSelectedBtn.innerHTML = `<i class="fas fa-trash-alt"></i> 선택한 예약 삭제`;
            }
        }
    }

    // 예약 취소 버튼 이벤트
    if (cancelSelectedBtn) {
        cancelSelectedBtn.addEventListener('click', function() {
            const selectedCheckboxes = document.querySelectorAll('tbody .form-check-input:checked');
            const selectedIds = Array.from(selectedCheckboxes).map(cb => cb.value);

            if (selectedIds.length === 0) {
                return;
            }

            if (confirm(`선택한 ${selectedIds.length}개의 예약을 취소하고 목록에서 삭제하시겠습니까?`)) {
                adminCancelReservations(selectedIds);
            }
        });
    }

    // 관리자 예약 취소 API 호출 (실제 삭제를 위한 함수)
    function adminCancelReservations(reservationIds) {
        const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content;
        const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;

        const headers = {
            'Content-Type': 'application/json'
        };

        if (csrfHeader && csrfToken) {
            headers[csrfHeader] = csrfToken;
        }

        fetch('/admin/reservations/cancel', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ reservationIds: reservationIds })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || '예약 취소 처리 중 오류가 발생했습니다.');
                });
            }
            return response.json();
        })
        .then(data => {
            alert(data.message || '선택한 예약이 성공적으로 취소되었습니다.');
            window.location.reload(); // 페이지 새로고침
        })
        .catch(error => {
            alert('오류: ' + error.message);
        });
    }

    // 상태 변경 처리 - 새로운 방식 (계약 불가는 삭제하지 않고 상태만 변경)
    setupStatusButtons();

    // 필터 적용 버튼 클릭 이벤트
    const applyFilterButton = document.getElementById('applyFilterButton');
    if (applyFilterButton) {
        applyFilterButton.addEventListener('click', function() {
            applyFilters();
        });
    }

    // 필터 초기화 버튼
    const resetFilterButton = document.getElementById('resetFilterButton');
    if (resetFilterButton) {
        resetFilterButton.addEventListener('click', function() {
            // 모든 필터 입력 필드 초기화
            const statusFilter = document.getElementById('statusFilter');
            const startDateFilter = document.getElementById('startDateFilter');
            const endDateFilter = document.getElementById('endDateFilter');
            const searchType = document.getElementById('searchType');
            const searchQuery = document.getElementById('searchQuery');

            if (statusFilter) statusFilter.value = '';
            if (startDateFilter) startDateFilter.value = '';
            if (endDateFilter) endDateFilter.value = '';
            if (searchType) searchType.value = 'name';
            if (searchQuery) searchQuery.value = '';

            // 페이지 리로드 (모든 파라미터 제거)
            window.location.href = window.location.pathname;
        });
    }

    // 상태 필터 변경 이벤트
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            // 필터가 자동으로 적용되지 않도록 변경, 버튼 클릭 시 적용되도록 함
        });
    }

    // 검색 버튼 클릭 이벤트
    const searchButton = document.getElementById('searchButton');
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            applyFilters();
        });
    }

    // 검색어 입력 필드에서 Enter 키 이벤트
    const searchQuery = document.getElementById('searchQuery');
    if (searchQuery) {
        searchQuery.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyFilters();
            }
        });
    }

    // 필터 적용 함수 수정 - 모든 조건을 충족해야만 결과가 나오도록 변경 (AND 조건)
    function applyFilters() {
        const status = document.getElementById('statusFilter').value;
        const startDate = document.getElementById('startDateFilter').value;
        const endDate = document.getElementById('endDateFilter').value;
        const searchType = document.getElementById('searchType').value;
        const search = document.getElementById('searchQuery').value;

        // 날짜 유효성 검증 (시작일이 종료일보다 이후면 제출 불가)
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            if (start > end) {
                alert('종료일은 시작일보다 이후여야 합니다.');
                return; // 함수 종료
            }
        }

        // 현재 URL 가져오기
        let url = new URL(window.location.href);

        // 모든 검색 파라미터 초기화 (페이지 번호는 항상 0으로 초기화)
        url.search = '';
        url.searchParams.set('page', '0'); // 필터 변경 시 항상 첫 페이지로

        // 각 조건별로 파라미터 추가 - 값이 있는 경우에만
        if (status) {
            url.searchParams.set('status', status);
        }

        if (startDate) {
            url.searchParams.set('startDate', startDate);
        }

        if (endDate) {
            url.searchParams.set('endDate', endDate);
        }

        if (search) {
            url.searchParams.set('search', search);
            if (searchType) {
                url.searchParams.set('searchType', searchType);
        } else {
                url.searchParams.set('searchType', 'name'); // 기본값 설정
            }
        }

        // 항상 AND 조건을 적용
        url.searchParams.set('filterCondition', 'AND');

        // 변경된 URL로 이동
        window.location.href = url.toString();
    }

    // 상세보기 버튼 클릭 이벤트
    document.querySelectorAll('.view-btn').forEach(button => {
        button.addEventListener('click', () => {
            const reservationId = button.getAttribute('data-id');
            loadReservationDetails(reservationId);
        });
    });

    // 검색 유형 변경 시 입력 필드 placeholder 업데이트
    const searchTypeSelect = document.getElementById('searchType');
    const searchQueryInput = document.getElementById('searchQuery');

    if (searchTypeSelect && searchQueryInput) {
        searchTypeSelect.addEventListener('change', function() {
            switch(this.value) {
                case 'name':
                    searchQueryInput.placeholder = '고객 이름 검색...';
                    break;
                case 'email':
                    searchQueryInput.placeholder = '이메일 검색...';
                    break;
                case 'reservationId':
                    searchQueryInput.placeholder = '예약번호 입력...';
                    break;
                case 'property':
                    searchQueryInput.placeholder = '매물 제목 또는 위치 검색...';
                    break;
                default:
                    searchQueryInput.placeholder = '검색어 입력...';
            }
        });

        // 페이지 로드 시 초기 placeholder 설정
        const currentSearchType = searchTypeSelect.value;
        if (currentSearchType) {
            const event = new Event('change');
            searchTypeSelect.dispatchEvent(event);
        }
    }

    // 날짜 필터 및 검색 입력 필드에 Enter 키 이벤트 추가
    function setupEnterKeyListeners() {
        const filterInputs = [
            'startDateFilter',
            'endDateFilter',
            'searchQuery'
        ];

        filterInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        applyFilters();
                    }
                });
            }
        });
    }

    // 날짜 범위 유효성 검사 함수
    function validateDateRange() {
        const startDateInput = document.getElementById('startDateFilter');
        const endDateInput = document.getElementById('endDateFilter');

        if (!startDateInput || !endDateInput) return;

        // 종료일 변경 시 유효성 검사
        endDateInput.addEventListener('change', function() {
            if (!startDateInput.value) return; // 시작일이 비어있으면 검사하지 않음

            const startDate = new Date(startDateInput.value);
            const endDate = new Date(this.value);

            if (endDate < startDate) {
                alert('종료일은 시작일보다 이후여야 합니다.');
                this.value = ''; // 종료일 입력값 초기화
            }
        });

        // 시작일 변경 시 유효성 검사
        startDateInput.addEventListener('change', function() {
            if (!endDateInput.value) return; // 종료일이 비어있으면 검사하지 않음

            const startDate = new Date(this.value);
            const endDate = new Date(endDateInput.value);

            if (startDate > endDate) {
                alert('시작일은 종료일보다 이전이어야 합니다.');
                this.value = ''; // 시작일 입력값 초기화
            }
        });
    }

    // 필터 결과 요약 정보 표시
    function updateFilterSummary() {
        const summaryElement = document.createElement('div');
        summaryElement.className = 'filter-summary mt-2';

        const url = new URL(window.location.href);
        const params = url.searchParams;

        let filterCount = 0;
        let summaryText = '';

        // 상태 필터
        if (params.has('status') && params.get('status')) {
            filterCount++;
            const statusText = getStatusText(params.get('status'));
            summaryText += `상태: ${statusText}, `;
        }

        // 날짜 필터
        if (params.has('startDate') && params.get('startDate')) {
            filterCount++;
            summaryText += `시작일: ${params.get('startDate')}, `;
        }

        if (params.has('endDate') && params.get('endDate')) {
            filterCount++;
            summaryText += `종료일: ${params.get('endDate')}, `;
        }

        // 검색 필터
        if (params.has('search') && params.get('search')) {
            filterCount++;
            const searchTypeText = params.has('searchType') ?
                getSearchTypeText(params.get('searchType')) : '전체';
            summaryText += `검색(${searchTypeText}): ${params.get('search')}, `;
        }

        // 필터 요약 정보가 있는 경우에만 표시
        if (filterCount > 0) {
            summaryText = summaryText.slice(0, -2); // 마지막 쉼표와 공백 제거

            const filterSection = document.querySelector('.filter-section');
            if (filterSection) {
                summaryElement.innerHTML = `
                    <div class="filter-info">
                        <span class="filter-count">${filterCount}개의 필터 적용됨:</span>
                        <span class="filter-text">${summaryText}</span>
                    </div>
                `;

                // 기존 요약 정보가 있으면 제거
                const existingSummary = filterSection.querySelector('.filter-summary');
                if (existingSummary) {
                    existingSummary.remove();
                }

                // 새 요약 정보 추가
                filterSection.appendChild(summaryElement);
            }
        }
    }

    // 상태 텍스트 변환 함수
    function getStatusText(status) {
        switch(status) {
            case 'PENDING': return '예약 대기';
            case 'CONFIRMED': return '예약 중';
            case 'COMPL': return '계약 완료';
            case 'CANCELLED': return '계약 불가';
            default: return status;
        }
    }

    // 검색 유형 텍스트 변환 함수
    function getSearchTypeText(searchType) {
        switch(searchType) {
            case 'name': return '이름';
            case 'email': return '이메일';
            case 'reservationId': return '예약번호';
            case 'property': return '매물정보';
            default: return searchType;
        }
    }

    // 날짜 형식 변환 함수 (YYYY-MM-DD)
    function formatDate(date) {
        const d = new Date(date);
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${d.getFullYear()}-${month}-${day}`;
    }

    // 페이지 로드시 실행되는 초기화 함수
    document.addEventListener('DOMContentLoaded', function() {
        // ... (기존 코드)

        // 필터 적용 버튼 클릭 이벤트
        const applyFilterButton = document.getElementById('applyFilterButton');
        if (applyFilterButton) {
            applyFilterButton.addEventListener('click', function() {
                applyFilters();
            });
        }

        // 필터 초기화 버튼
        const resetFilterButton = document.getElementById('resetFilterButton');
        if (resetFilterButton) {
            resetFilterButton.addEventListener('click', function() {
                // 모든 필터 입력 필드 초기화
                document.getElementById('statusFilter').value = '';
                document.getElementById('startDateFilter').value = '';
                document.getElementById('endDateFilter').value = '';
                document.getElementById('searchType').value = 'name'; // 기본값
                document.getElementById('searchQuery').value = '';

                // 페이지 리로드 (모든 파라미터 제거)
                window.location.href = window.location.pathname;
            });
        }

        // 상태 필터 변경 시 스타일 업데이트
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', function() {
                highlightActiveFilter(this);
            });
        }

        // 날짜 필터 변경 시 스타일 업데이트
        const dateFilters = ['startDateFilter', 'endDateFilter'];
        dateFilters.forEach(id => {
            const filter = document.getElementById(id);
            if (filter) {
                filter.addEventListener('change', function() {
                    highlightActiveFilter(this);
                });
            }
        });

        // 검색 타입 변경 시 스타일 업데이트
        const searchType = document.getElementById('searchType');
        if (searchType) {
            searchType.addEventListener('change', function() {
                highlightActiveFilter(this);
                // 검색 유형에 맞게 placeholder 업데이트
                updateSearchPlaceholder();
            });
        }

        // 검색어 입력 시 스타일 업데이트
        const searchQuery = document.getElementById('searchQuery');
        if (searchQuery) {
            searchQuery.addEventListener('input', function() {
                highlightActiveFilter(this);
            });

            // Enter 키로 검색 가능하도록
            searchQuery.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    applyFilters();
                }
            });
        }

        // 날짜 범위 유효성 검사 설정
        validateDateRange();

        // 엔터 키 이벤트 리스너 설정
        setupEnterKeyListeners();

        // 활성화된 필터에 스타일 적용
        styleActiveFilters();

        // 활성화된 필터 배지 표시
        displayActiveFilters();

        // 필터 요약 정보 업데이트
        updateFilterSummary();

        // 선택한 예약 삭제 버튼 텍스트 수정
        const cancelSelectedBtn = document.getElementById('cancelSelectedBtn');
        if (cancelSelectedBtn) {
            cancelSelectedBtn.innerHTML = `<i class="fas fa-trash-alt"></i> 선택한 예약 삭제`;

            // 버튼 클릭 이벤트
            cancelSelectedBtn.addEventListener('click', function() {
                const selectedCheckboxes = document.querySelectorAll('tbody .form-check-input:checked');
                const selectedIds = Array.from(selectedCheckboxes).map(cb => cb.value);

                if (selectedIds.length === 0) {
                    return;
                }

                if (confirm(`선택한 ${selectedIds.length}개의 예약을 목록에서 삭제하시겠습니까? (데이터베이스에서는 삭제되지 않습니다)`)) {
                    hideReservations(selectedIds);
                }
            });
        }

        // 필터 조건 라디오 버튼 이벤트 리스너
        const filterConditionRadios = document.querySelectorAll('input[name="filterCondition"]');
        if (filterConditionRadios.length > 0) {
            filterConditionRadios.forEach(radio => {
                radio.addEventListener('change', function() {
                    // 조건 변경 시 CSS 클래스 업데이트
                    if (this.value === 'AND') {
                        document.querySelector('.filter-condition').classList.add('filter-condition-and');
                        document.querySelector('.filter-condition').classList.remove('filter-condition-or');
                    } else {
                        document.querySelector('.filter-condition').classList.add('filter-condition-or');
                        document.querySelector('.filter-condition').classList.remove('filter-condition-and');
                    }
                });
            });
        }
    });

    // 필터 요소에 활성화 스타일 적용
    function highlightActiveFilter(element) {
        if (element.value) {
            element.classList.add('filter-active');
        } else {
            element.classList.remove('filter-active');
        }
    }

    // 검색 유형에 따라 placeholder 업데이트
    function updateSearchPlaceholder() {
        const searchType = document.getElementById('searchType');
        const searchQuery = document.getElementById('searchQuery');

        if (searchType && searchQuery) {
            switch(searchType.value) {
                case 'name':
                    searchQuery.placeholder = '고객 이름 검색...';
                    break;
                case 'email':
                    searchQuery.placeholder = '이메일 검색...';
                    break;
                case 'reservationId':
                    searchQuery.placeholder = '예약번호 입력...';
                    break;
                case 'property':
                    searchQuery.placeholder = '매물 제목 또는 위치 검색...';
                    break;
                default:
                    searchQuery.placeholder = '검색어 입력...';
            }
        }
    }

    // 활성화된 필터에 스타일 적용
    function styleActiveFilters() {
        const url = new URL(window.location.href);
        const params = url.searchParams;

        // 상태 필터
        if (params.has('status') && params.get('status')) {
            const statusFilter = document.getElementById('statusFilter');
            if (statusFilter) {
                statusFilter.classList.add('filter-active');
                statusFilter.value = params.get('status');
            }
        }

        // 날짜 필터
        if (params.has('startDate') && params.get('startDate')) {
            const startDateFilter = document.getElementById('startDateFilter');
            if (startDateFilter) {
                startDateFilter.classList.add('filter-active');
                startDateFilter.value = params.get('startDate');
            }
        }

        if (params.has('endDate') && params.get('endDate')) {
            const endDateFilter = document.getElementById('endDateFilter');
            if (endDateFilter) {
                endDateFilter.classList.add('filter-active');
                endDateFilter.value = params.get('endDate');
            }
        }

        // 검색 필터
        if (params.has('search') && params.get('search')) {
            const searchQuery = document.getElementById('searchQuery');
            if (searchQuery) {
                searchQuery.classList.add('filter-active');
                searchQuery.value = params.get('search');
            }

            if (params.has('searchType')) {
                const searchType = document.getElementById('searchType');
                if (searchType) {
                    searchType.classList.add('filter-active');
                    searchType.value = params.get('searchType');
                }
            }
        }

        // 검색 placeholder 업데이트
        updateSearchPlaceholder();
    }

    // 활성화된 필터 배지 표시
    function displayActiveFilters() {
        const activeFiltersContainer = document.getElementById('activeFilters');
        if (!activeFiltersContainer) return;

        activeFiltersContainer.innerHTML = '';

        const url = new URL(window.location.href);
        const params = url.searchParams;

        // 상태 필터
        if (params.has('status') && params.get('status')) {
            addFilterBadge('상태: ' + getStatusText(params.get('status')), () => {
                params.delete('status');
                url.search = params.toString();
                window.location.href = url.toString();
            });
        }

        // 날짜 필터
        if (params.has('startDate') && params.get('startDate')) {
            addFilterBadge('시작일: ' + params.get('startDate'), () => {
                params.delete('startDate');
                url.search = params.toString();
                window.location.href = url.toString();
            });
        }

        if (params.has('endDate') && params.get('endDate')) {
            addFilterBadge('종료일: ' + params.get('endDate'), () => {
                params.delete('endDate');
                url.search = params.toString();
                window.location.href = url.toString();
            });
        }

        // 검색 필터
        if (params.has('search') && params.get('search')) {
            const searchTypeText = params.has('searchType') ?
                getSearchTypeText(params.get('searchType')) : '전체';
            addFilterBadge(`${searchTypeText}: ${params.get('search')}`, () => {
                params.delete('search');
                params.delete('searchType');
                url.search = params.toString();
                window.location.href = url.toString();
            });
        }

        // 필터 배지 추가 함수
        function addFilterBadge(text, removeCallback) {
            const badge = document.createElement('span');
            badge.className = 'filter-badge';
            badge.innerHTML = `${text} <i class="fas fa-times"></i>`;

            badge.querySelector('i').addEventListener('click', removeCallback);

            activeFiltersContainer.appendChild(badge);
        }
    }

    // 예약 항목 숨기기 함수 (실제 삭제가 아닌 화면에서만 숨김)
    function hideReservations(reservationIds) {
        // 선택된 행들을 화면에서 숨김
        reservationIds.forEach(id => {
            const checkboxes = document.querySelectorAll(`tbody .form-check-input[value="${id}"]`);
            checkboxes.forEach(checkbox => {
                const row = checkbox.closest('tr');
                if (row) {
                    row.style.transition = 'opacity 0.5s ease, height 0.5s ease, padding 0.5s ease';
                    row.style.opacity = '0';
                    row.style.height = '0';
                    row.style.padding = '0';
                    row.style.overflow = 'hidden';

                    // 애니메이션 후 완전히 제거
                    setTimeout(() => {
                        row.remove();
                    }, 500);
                }
            });
        });

        // 선택 상태 초기화
        updateSelectedCount();
        updateCancelButtonState();

        // 성공 메시지 표시
        showNotification('선택한 예약이 목록에서 제거되었습니다.', 'success');

        // 테이블이 비어있는지 확인
        setTimeout(() => {
            const remainingRows = document.querySelectorAll('tbody tr:not([style*="height: 0"])');
            if (remainingRows.length === 0) {
                const tbody = document.querySelector('tbody');
                const emptyRow = document.createElement('tr');
                emptyRow.innerHTML = '<td colspan="9" class="text-center">예약된 상담이 없습니다.</td>';
                tbody.appendChild(emptyRow);
            }
        }, 500);
    }

    // 페이지 링크의 URL에도 filterCondition=AND를 추가하는 함수
    function updatePaginationLinks() {
        const paginationLinks = document.querySelectorAll('.pagination .page-link');
        if (paginationLinks.length > 0) {
            paginationLinks.forEach(link => {
                const url = new URL(link.href);
                url.searchParams.set('filterCondition', 'AND');
                link.href = url.toString();
            });
        }
    }

    // 필터 적용 시 메시지를 표시하는 함수
    function showFilterMessage() {
        const url = new URL(window.location.href);
        const params = url.searchParams;

        let hasFilters = false;
        let filterCount = 0;

        if (params.has('status') && params.get('status')) {
            hasFilters = true;
            filterCount++;
        }

        if (params.has('startDate') && params.get('startDate')) {
            hasFilters = true;
            filterCount++;
        }

        if (params.has('endDate') && params.get('endDate')) {
            hasFilters = true;
            filterCount++;
        }

        if (params.has('search') && params.get('search')) {
            hasFilters = true;
            filterCount++;
        }

        if (hasFilters) {
            const filterSection = document.querySelector('.filter-section');
            if (filterSection) {
                const messageElement = document.createElement('div');
                messageElement.className = 'filter-message mt-2';
                messageElement.innerHTML = `
                    <div class="alert alert-info" role="alert">
                        <i class="fas fa-info-circle me-2"></i>
                        <strong>${filterCount}개의 필터</strong>가 적용되었습니다. 모든 조건을 충족하는 결과만 표시됩니다.
                    </div>
                `;

                const existingMessage = document.querySelector('.filter-message');
                if (existingMessage) {
                    existingMessage.replaceWith(messageElement);
                } else {
                    filterSection.parentNode.insertBefore(messageElement, filterSection.nextSibling);
                }
            }
        }
    }

    // 필터 조건 라디오 버튼 영역 제거 (항상 AND 조건을 사용하므로 불필요)
    const filterConditionArea = document.querySelector('.filter-condition');
    if (filterConditionArea) {
        filterConditionArea.remove();
    }

    // 날짜 범위 필터 개선 함수
    function enhanceDateRangeFilter() {
        const startDateInput = document.getElementById('startDateFilter');
        const endDateInput = document.getElementById('endDateFilter');

        if (!startDateInput || !endDateInput) return;

        // 날짜 캘린더가 닫히도록 하는 함수
        function closeDatepicker(input) {
            // input 요소의 focus를 제거하여 캘린더 닫기
            input.blur();
        }

        // 시작일 선택 시 처리
        startDateInput.addEventListener('change', function() {
            // 시작일 캘린더 닫기
            closeDatepicker(this);

            if (this.value) {
                // 종료일 최소값을 시작일로 설정
                endDateInput.min = this.value;

                // 종료일 입력 필드 활성화
                endDateInput.disabled = false;

                // 종료일 캘린더 자동으로 열기
                setTimeout(() => {
                    endDateInput.focus();
                }, 100);
            }
        });

        // 종료일 선택 시 처리
        endDateInput.addEventListener('change', function() {
            // 종료일 캘린더 닫기
            closeDatepicker(this);

            if (startDateInput.value && this.value) {
                const startDate = new Date(startDateInput.value);
                const endDate = new Date(this.value);

                // 종료일이 시작일보다 이전이면 경고
                if (endDate < startDate) {
                    alert('종료일은 시작일보다 이후여야 합니다.');
                    this.value = '';

                    // 캘린더 다시 열기
                    setTimeout(() => {
                        this.focus();
                    }, 100);
                }
            }
        });

        // 초기 상태 설정
        if (!startDateInput.value) {
            endDateInput.disabled = true;
        } else {
            endDateInput.min = startDateInput.value;
        }

        // 날짜 필드에 직접 입력 시 유효성 검사
        [startDateInput, endDateInput].forEach(input => {
            input.addEventListener('blur', function() {
                if (this.value && startDateInput.value && endDateInput.value) {
                    const startDate = new Date(startDateInput.value);
                    const endDate = new Date(endDateInput.value);

                    if (this === endDateInput && endDate < startDate) {
                        alert('종료일은 시작일보다 이후여야 합니다.');
                        this.value = '';
                    }
                }
            });
        });
    }

    // DOM이 로드된 후 실행하는 함수들
    document.addEventListener('DOMContentLoaded', function() {
        // ... 기존 코드 ...

        // 날짜 범위 필터 개선 적용
        enhanceDateRangeFilter();

        // ... 기존 코드 ...
    });

    // 추가 스타일 적용
    function addCustomStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            /* 날짜 필터 스타일 개선 */
            #startDateFilter, #endDateFilter {
                transition: border-color 0.3s, box-shadow 0.3s;
            }
            
            #endDateFilter:disabled {
                background-color: #f5f5f5;
                cursor: not-allowed;
            }
            
            /* 활성화된 날짜 필드에 시각적 표시 */
            #startDateFilter:focus, #endDateFilter:focus {
                border-color: #4682B4;
                box-shadow: 0 0 0 0.2rem rgba(70, 130, 180, 0.25);
            }
        `;
        document.head.appendChild(styleElement);
    }

    // 페이지 로드 시 스타일 추가
    document.addEventListener('DOMContentLoaded', function() {
        addCustomStyles();
    });

    // 미래 기간 필터 셀렉트 이벤트 처리
    const futureDateFilter = document.getElementById('futureDateFilter');
    if (futureDateFilter) {
        futureDateFilter.addEventListener('change', function() {
            applyFutureDateFilter();
        });
    }

    // 미래 기간 필터 적용 함수
    function applyFutureDateFilter() {
        const filterValue = document.getElementById('futureDateFilter').value;

        if (!filterValue) {
            // 전체 기간 선택 시 날짜 필터 초기화
            document.getElementById('startDateFilter').value = '';
            document.getElementById('endDateFilter').value = '';
            applyFilters();
            return;
        }

        // 오늘 날짜 가져오기
        const today = new Date();
        today.setHours(0, 0, 0, 0); // 오늘 자정으로 설정

        // 시작일은 항상 오늘
        const formattedToday = formatDate(today);
        document.getElementById('startDateFilter').value = formattedToday;

        // 종료일 설정
        let endDate = new Date(today);

        if (filterValue === 'today') {
            // 오늘만 보기
            document.getElementById('endDateFilter').value = formattedToday;
        } else {
            // 지정된 일수만큼 더하기
            const days = parseInt(filterValue);
            endDate.setDate(today.getDate() + days);
            document.getElementById('endDateFilter').value = formatDate(endDate);
        }

        // 필터 적용
        applyFilters();
    }
});

// 상태 버튼 설정
function setupStatusButtons() {
    document.querySelectorAll('.status-btn').forEach(button => {
        button.addEventListener('click', function() {
            const currentStatus = this.getAttribute('data-current-status');
            const reservationId = this.getAttribute('data-id');
            const buttonRect = this.getBoundingClientRect();

            // 상태 옵션 생성 (계약 불가 색상을 주황색으로 변경)
            const options = [
                { id: 'PENDING', text: '예약 대기', class: 'status-btn btn-warning' },
                { id: 'CONFIRMED', text: '예약 중', class: 'status-btn btn-primary' },
                { id: 'COMPL', text: '계약 완료', class: 'status-btn btn-success' },
                { id: 'CANCELLED', text: '계약 불가', class: 'status-btn btn-orange' }
            ];

            // 상태 메뉴 생성
            const menu = document.createElement('div');
            menu.className = 'status-menu';
            menu.style.position = 'absolute';
            menu.style.top = `${buttonRect.bottom + window.scrollY + 5}px`;
            menu.style.left = `${buttonRect.left + window.scrollX}px`;
            menu.style.zIndex = '1000';
            menu.style.backgroundColor = 'white';
            menu.style.border = '1px solid #ddd';
            menu.style.borderRadius = '4px';
            menu.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';

            // 현재 상태를 제외한 옵션 추가
            options.forEach(option => {
                if (option.id !== currentStatus) {
                    const item = document.createElement('div');
                    item.textContent = option.text;
                    item.className = 'status-menu-item';
                    item.style.padding = '8px 16px';
                    item.style.cursor = 'pointer';
                    item.style.width = '100px';
                    item.style.textAlign = 'center';

                    item.addEventListener('mouseover', () => {
                        item.style.backgroundColor = '#f5f5f5';
                    });

                    item.addEventListener('mouseout', () => {
                        item.style.backgroundColor = 'white';
                    });

                    item.addEventListener('click', () => {
                        changeReservationStatus(reservationId, option.id, button, option.text, option.class);
                        document.body.removeChild(menu);
                    });

                    menu.appendChild(item);
                }
            });

            document.body.appendChild(menu);

            // 메뉴 외부 클릭 시 닫기
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target) && e.target !== button) {
                    if (document.body.contains(menu)) {
                        document.body.removeChild(menu);
                    }
                    document.removeEventListener('click', closeMenu);
                }
            });
        });
    });
}

// 상태 변경 함수 수정 (계약 불가는 삭제하지 않고 상태만 변경)
function changeReservationStatus(reservationId, newStatus, button, statusText, statusClass) {
    // CSRF 토큰 가져오기
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content;
    const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;

    const headers = {
        'Content-Type': 'application/json'
    };

    if (csrfHeader && csrfToken) {
        headers[csrfHeader] = csrfToken;
    }

    const requestBody = JSON.stringify({
        reservationId: reservationId,
        status: newStatus
    });

    console.log(`상태 변경 요청: ID=${reservationId}, 새 상태=${newStatus}`);

    // 상태 변경 요청 (삭제하지 않고 상태만 변경)
    fetch(`/api/reservations/update-status-only`, {
        method: 'POST',
        headers: headers,
        body: requestBody
    })
    .then(response => {
        console.log(`응답 상태: ${response.status}`);
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(text || '상태 변경에 실패했습니다.');
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('응답 데이터:', data);

        // UI 업데이트
        button.textContent = statusText;
        button.className = statusClass;
        button.setAttribute('data-current-status', newStatus);

        // 성공 메시지 표시
        showNotification('상태가 성공적으로 변경되었습니다.', 'success');
    })
    .catch(error => {
        console.error('상태 변경 오류:', error);
        showNotification(error.message || '상태 변경에 실패했습니다.', 'error');
    });
}

// 알림 표시 함수
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'success' ? 'success' : 'danger'} position-fixed`;
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '1050';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 500);
    }, 3000);
}

// 예약 상세 정보 로드
function loadReservationDetails(reservationId) {
    fetch(`/api/reservations/${reservationId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('예약 정보를 불러오는데 실패했습니다.');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('reservationId').value = data.reservationId;
            document.getElementById('reservationNumber').textContent = 'NO.' + data.reservationId;
            document.getElementById('customerName').textContent = data.user.name;
            document.getElementById('customerEmail').textContent = data.user.email;
            document.getElementById('customerPhone').textContent = data.user.phone || '연락처 없음';
            document.getElementById('reservationDate').value = formatDateForInput(data.reservedDate);
            document.getElementById('reservationStatus').value = data.status;
            document.getElementById('messageContent').value = data.message || '';
            document.getElementById('adminNotes').value = data.adminNotes || '';

            const propertyListContainer = document.getElementById('propertyList');
            propertyListContainer.innerHTML = '';

            if (data.properties && data.properties.length > 0) {
                const propertyList = document.createElement('ul');
                propertyList.className = 'list-group';

                data.properties.forEach(property => {
                    const item = document.createElement('li');
                    item.className = 'list-group-item';
                    item.innerHTML = `
                        <strong>${property.title}</strong><br>
                        ${property.location}<br>
                        월세: ${property.monthlyPrice.toLocaleString()}円
                    `;
                    propertyList.appendChild(item);
                });

                propertyListContainer.appendChild(propertyList);
            } else {
                propertyListContainer.innerHTML = '<p class="text-muted">등록된 매물 정보가 없습니다.</p>';
            }

            document.getElementById('chatLink').href = `/mypage/chat.html?user=${data.user.email}`;

            const consultingModal = new bootstrap.Modal(document.getElementById('consultingModal'));
            consultingModal.show();
        })
        .catch(error => {
            console.error('Error:', error);
            alert(error.message);
        });
}

// 날짜를 datetime-local 입력에 맞는 형식으로 변환
function formatDateForInput(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // "YYYY-MM-DDThh:mm" 형식으로 변환
}

// 저장 버튼 클릭 이벤트 핸들러 설정
document.addEventListener('DOMContentLoaded', function() {
    const saveButton = document.getElementById('saveReservation');
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            const formData = new FormData(document.getElementById('reservationForm'));
            const reservationData = {
                reservationId: formData.get('reservationId'),
                reservedDate: formData.get('reservedDate'),
                status: formData.get('status'),
                message: formData.get('message'),
                adminNotes: formData.get('adminNotes')
            };

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

            fetch('/api/reservations/update-simple', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(reservationData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('예약 정보 저장에 실패했습니다.');
                }
                return response.json();
            })
            .then(data => {
                alert('예약 정보가 성공적으로 저장되었습니다.');
                window.location.reload(); // 페이지 새로고침
            })
            .catch(error => {
                console.error('Error:', error);
                alert(error.message);
            });
        });
    }
}); 