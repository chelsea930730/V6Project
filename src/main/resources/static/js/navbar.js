document.addEventListener("DOMContentLoaded", function () {
	console.log("⭐️ 네비게이션 스크립트 로딩 시작");
	fetch("/navi.html")
		.then(response => {
			if (!response.ok) {
				throw new Error("네비게이션 파일을 찾을 수 없습니다.");
			}
			return response.text();
		})
		.then(data => {
			// HTML 파싱
			const parser = new DOMParser();
			const doc = parser.parseFromString(data, 'text/html');

			// 헤더와 푸터, 스타일, 위젯 가져오기
			const header = doc.querySelector('header');
			const footer = doc.querySelector('footer');
			const style = doc.querySelector('style');
			const widget = doc.getElementById('reservation-widget');

			// 헤더 삽입
			let navbarPlaceholder = document.getElementById("navbar-placeholder");
			if (navbarPlaceholder) {
				console.log("⭐️ 네비바 플레이스홀더 발견, 헤더 삽입");
				navbarPlaceholder.innerHTML = header.outerHTML;
			} else {
				console.warn("⚠️ 네비바 플레이스홀더를 찾을 수 없습니다");
			}

			// 푸터 삽입
			document.body.insertAdjacentHTML('beforeend', footer.outerHTML);
			
			// 위젯 삽입 - 이 부분이 추가됨
			if (widget) {
				document.body.insertAdjacentHTML('beforeend', widget.outerHTML);
			}

			// 스타일 삽입
			if (!document.querySelector('style[data-navi-styles]')) {
				style.setAttribute('data-navi-styles', '');
				document.head.appendChild(style);
			}

			// ✅ 네비게이션이 완전히 로드된 후 로그인 상태 확인
			checkLoginStatus();
			
			// 위젯 초기화 함수 호출 - 이 부분이 중요!
			setupReservationWidget();
		})
		.catch(error => console.error("❌ 네비게이션 로딩 오류:", error));
});

// 로그인 상태 체크 및 네비게이션 업데이트
function checkLoginStatus() {
	console.log("⭐️ 로그인 상태 확인 시작");
	fetch("/user/index")
		.then(response => response.json())
		.then(data => {
			console.log("⭐️ 사용자 데이터 수신:", data);
			const navMenu = document.getElementById("nav-menu"); // 네비게이션 메뉴 영역
			const widget = document.getElementById('reservation-widget'); // 예약 위젯
			
			if (!navMenu) {
				console.error("❌ nav-menu 요소를 찾을 수 없습니다");
				return;
			}
			
			const isAdmin = data.role === "ADMIN"; // 이메일이 아닌 role 값으로 관리자 여부 확인
			console.log("⭐️ 사용자 역할:", data.role, "관리자 여부:", isAdmin);
			
			// 관리자 여부를 body에 데이터 속성으로 저장 (다른 함수에서 사용)
			if (data.isLoggedIn) {
				document.body.setAttribute('data-role', data.role);
				document.body.setAttribute('data-logged-in', 'true');
				
				// 클래스 추가 (CSS 선택자 용도)
				if (isAdmin) {
					document.body.classList.add('admin-role');
				} else {
					document.body.classList.remove('admin-role');
				}
			} else {
				document.body.removeAttribute('data-role');
				document.body.setAttribute('data-logged-in', 'false');
				document.body.classList.remove('admin-role');
			}

			if (data.isLoggedIn) {
				// ✅ 로그인된 경우
				if (isAdmin) {
					console.log("⭐️ 관리자용 네비게이션 메뉴 설정");
					// 관리자용 네비게이션 메뉴
					navMenu.innerHTML = `
						<div class="nav-links">
							<a href="/admin/dashboard" class="nav-link">⚙️ Dashboard</a>
							<a href="/mypage/chat-list.html" class="nav-link" id="chat-link">채팅 관리</a>
							<button class="logout-btn">LOGOUT</button>
						</div>
					`;
					
					// 관리자는 위젯 표시하지 않음
					if (widget) {
						widget.style.display = 'none';
					}
				} else {
					console.log("⭐️ 일반 사용자용 네비게이션 메뉴 설정");
					// 일반 사용자용 네비게이션 메뉴
					navMenu.innerHTML = `
						<div class="nav-links">
							<a href="/cart" class="nav-link">🛒 Cart</a>
							<a href="/mypage/chat.html?user=admin@realestate.com" class="nav-link" id="chat-link">채팅</a>
							<a href="/mypage" class="nav-link">마이페이지</a>
							<button class="logout-btn">LOGOUT</button>
						</div>
					`;
					
					// 일반 사용자는 위젯 표시
					if (widget) {
						widget.style.display = 'block';
						
						// 예약 수 로드 시도
						try {
							fetch('/api/reservations/count')
								.then(response => {
									if (!response.ok) {
										throw new Error('API 호출 실패');
									}
									return response.json();
								})
								.then(data => {
									const notificationCount = widget.querySelector('.notification-count');
									if (notificationCount) {
										notificationCount.textContent = data.count || '0';
									}
								})
								.catch(error => {
									console.warn('예약 수 로드 오류, 모의 데이터 사용:', error);
									// API 호출 실패 시 임시 데이터 표시
									const notificationCount = widget.querySelector('.notification-count');
									if (notificationCount) {
										const randomCount = Math.floor(Math.random() * 6); // 0~5 사이
										notificationCount.textContent = randomCount;
									}
								});
						} catch (error) {
							console.error('예약 수 로드 중 예외 발생:', error);
						}
					}
				}
			} else {
				console.log("⭐️ 로그아웃 상태 - 로그인 버튼만 표시");
				// ✅ 로그아웃 상태일 때는 로그인 버튼만 표시
				navMenu.innerHTML = `
					<div class="auth-buttons">
						<a href="/user/login" class="login-btn">LOGIN</a>
					</div>
				`;
				
				// 위젯 숨기기 (로그아웃 상태에서)
				if (widget) {
					widget.style.display = 'none';
				}
			}
			
			console.log("⭐️ 네비게이션 메뉴 설정 완료:", navMenu.innerHTML);
		})
		.catch(error => {
			console.error("❌ 로그인 상태 확인 실패:", error);
			// 에러 발생 시 기본적으로 로그인 버튼을 표시
			const navMenu = document.getElementById("nav-menu");
			const widget = document.getElementById('reservation-widget');
			
			if (navMenu) {
				navMenu.innerHTML = `
					<div class="auth-buttons">
						<a href="/user/login" class="login-btn">LOGIN</a>
					</div>
				`;
			}
			
			// 위젯 숨기기 (오류 상태에서)
			if (widget) {
				widget.style.display = 'none';
			}
		});
}

// 로그아웃 처리 함수 수정
document.addEventListener("click", function(event) {
	if (event.target.classList.contains("logout-btn")) {
		console.log("⭐️ 로그아웃 버튼 클릭");
		
		// CSRF 토큰 설정
		const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;
		const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content;
		
		const options = { 
			method: "POST",
			credentials: 'same-origin' // 쿠키 포함
		};
		
		if (csrfToken && csrfHeader) {
			options.headers = {
				[csrfHeader]: csrfToken
			};
		}
		
		// 로그아웃 요청
		fetch("/user/logout", options)
			.then(response => {
				console.log("⭐️ 로그아웃 응답:", response);
				if (!response.ok) {
					throw new Error(`로그아웃 실패: ${response.status}`);
				}
				return response.text();
			})
			.then(() => {
				console.log("⭐️ 로그아웃 성공, 페이지 새로고침");
				// 쿠키 및 세션 초기화를 위해 페이지 새로고침
				window.location.href = "/";
			})
			.catch(error => {
				console.error("❌ 로그아웃 실패:", error);
				alert("로그아웃 처리 중 오류가 발생했습니다.");
			});
	}
});

// ✅ 로그인 버튼 클릭 시 `/user/login` 페이지로 이동 (동적으로 생성된 요소 대응)
document.addEventListener("click", function (event) {
	if (event.target.classList.contains("login-btn")) {
		console.log("⭐️ 로그인 버튼 클릭");
		window.location.href = "/user/login";
	}
});

// 위젯 관련 전역 변수 (다른 곳에서 중복 선언 없음)
// 이 변수 선언이 있으므로 다른 곳에서는 재선언하지 않음
let widgetReservations = [];
let isWidgetLoading = false;

// 위젯 토글 기능
function setupReservationWidget() {
	const widget = document.getElementById('reservation-widget');
	if (!widget) return;
	
	const toggle = widget.querySelector('.widget-toggle');
	if (!toggle) return;
	
	toggle.addEventListener('click', function() {
		widget.classList.toggle('expanded');
		widget.classList.toggle('collapsed');
		
		// 위젯이 확장될 때 데이터 로드
		if (widget.classList.contains('expanded')) {
			loadReservationData();
		}
	});
	
	// 날짜 필터 변경 이벤트
	const dateFilter = document.getElementById('widget-date-filter');
	if (dateFilter) {
		dateFilter.addEventListener('change', function() {
			loadReservationData();
		});
	}
	
	// 페이지 클릭 시 위젯 닫기 (위젯 자체 클릭은 제외)
	document.addEventListener('click', function(event) {
		if (widget.classList.contains('expanded') && 
			!widget.contains(event.target)) {
			widget.classList.remove('expanded');
			widget.classList.add('collapsed');
		}
	});
	
	// 초기 알림 횟수 설정 (서버 API 연동 전 임시 코드)
	const notificationCount = widget.querySelector('.notification-count');
	if (notificationCount) {
		try {
			fetch('/api/reservations/count')
				.then(response => {
					if (!response.ok) {
						throw new Error('API 호출 실패');
					}
					return response.json();
				})
				.then(data => {
					notificationCount.textContent = data.count || '0';
				})
				.catch(error => {
					console.warn('예약 수 로드 오류:', error);
					// API 호출 실패 시 임시로 0 표시
					notificationCount.textContent = '0';
				});
		} catch (error) {
			console.error('예약 수 로드 중 예외 발생:', error);
			notificationCount.textContent = '0';
		}
	}
	
	// 데이터 미리 로드
	loadReservationData();
}

// 예약 데이터 로드 함수
function loadReservationData() {
	const dateFilter = document.getElementById('widget-date-filter');
	if (!dateFilter) return;
	
	const days = dateFilter.value === 'today' ? 0 : parseInt(dateFilter.value);
	
	const widgetLoading = document.getElementById('widget-loading');
	const widgetList = document.getElementById('widget-reservation-list');
	const widgetNoData = document.getElementById('widget-no-data');
	
	if (!widgetLoading || !widgetList || !widgetNoData) return;
	
	// 로딩 상태 표시
	widgetLoading.style.display = 'block';
	widgetList.innerHTML = '';
	widgetNoData.style.display = 'none';
	isWidgetLoading = true;
	
	// 현재 사용자의 역할 확인 (관리자 여부)
	const isAdmin = document.body.hasAttribute('data-role') && 
				   document.body.getAttribute('data-role') === 'ADMIN';
				   
	// API URL 결정
	let url;
	if (isAdmin) {
		url = '/api/reservations/admin/upcoming';
	} else {
		url = '/api/reservations/upcoming';
	}
	
	if (days > 0) {
		url += `?days=${days}`;
	}
	
	console.log(`API 요청 URL: ${url}, 관리자 여부: ${isAdmin}`);
	
	// API 호출
	fetch(url)
		.then(response => {
			console.log('API 응답 상태:', response.status);
			if (!response.ok) {
				throw new Error('예약 데이터를 가져오는데 실패했습니다. 상태: ' + response.status);
			}
			return response.json();
		})
		.then(data => {
			console.log('받은 예약 데이터:', data);
			// 변수 재선언이 아닌 기존 변수 재사용
			widgetReservations = data || [];
			isWidgetLoading = false;
			updateWidgetUI(isAdmin);
			
			// 알림 카운트 업데이트
			const notificationCount = document.querySelector('.notification-count');
			if (notificationCount) {
				notificationCount.textContent = widgetReservations.length || '0';
			}
		})
		.catch(error => {
			console.error('예약 데이터 로드 오류:', error);
			isWidgetLoading = false;
			
			// 오류 메시지 표시
			if (widgetLoading) widgetLoading.style.display = 'none';
			if (widgetNoData) {
				widgetNoData.style.display = 'block';
				widgetNoData.textContent = '데이터를 불러올 수 없습니다.';
			}
			
			// 알림 카운트 초기화
			const notificationCount = document.querySelector('.notification-count');
			if (notificationCount) {
				notificationCount.textContent = '0';
			}
		});
}

// 위젯 UI 업데이트 함수
function updateWidgetUI(isAdmin = false) {
	const widgetLoading = document.getElementById('widget-loading');
	const widgetList = document.getElementById('widget-reservation-list');
	const widgetNoData = document.getElementById('widget-no-data');
	const notificationCount = document.querySelector('.notification-count');
	
	if (!widgetLoading || !widgetList || !widgetNoData) return;
	
	widgetLoading.style.display = 'none';
	
	if (!widgetReservations || widgetReservations.length === 0) {
		widgetList.innerHTML = '';
		widgetNoData.style.display = 'block';
		widgetNoData.textContent = '예약된 상담이 없습니다.';
		if (notificationCount) notificationCount.textContent = '0';
		return;
	}
	
	widgetNoData.style.display = 'none';
	if (notificationCount) notificationCount.textContent = widgetReservations.length || '0';
	
	// 예약 목록 생성
	widgetList.innerHTML = '';
	
	widgetReservations.forEach(reservation => {
		const reservationDate = new Date(reservation.reservedDate);
		const formattedDate = `${reservationDate.getFullYear()}-${String(reservationDate.getMonth() + 1).padStart(2, '0')}-${String(reservationDate.getDate()).padStart(2, '0')}`;
		
		// 시간 정보가 있는 경우에만 표시
		let formattedTime = '';
		if (!isNaN(reservationDate.getHours())) {
			formattedTime = `${String(reservationDate.getHours()).padStart(2, '0')}:${String(reservationDate.getMinutes()).padStart(2, '0')}`;
		}
		
		// 상태에 따른 클래스와 텍스트 결정
		let statusClass = '';
		let statusText = '';
		
		switch(reservation.status) {
			case 'PENDING': 
				statusClass = 'status-pending'; 
				statusText = '예약 대기'; 
				break;
			case 'CONFIRMED': 
				statusClass = 'status-confirmed'; 
				statusText = '예약 중'; 
				break;
			case 'COMPL': 
				statusClass = 'status-compl'; 
				statusText = '계약 완료'; 
				break;
			case 'CANCELLED': 
				statusClass = 'status-cancelled'; 
				statusText = '계약 불가'; 
				break;
			default:
				statusClass = 'status-pending';
				statusText = '예약 대기';
				break;
		}
		
		const reservationItem = document.createElement('div');
		reservationItem.className = 'reservation-item';
		
		// 일반 사용자 UI만 표시 (관리자용 UI 제거)
		// reservationId가 null이 아닌지 확인
		const reservationId = reservation.reservationId || '';
		
		reservationItem.innerHTML = `
			<div class="reservation-date">${formattedDate} ${formattedTime}</div>
			<div class="reservation-status ${statusClass}">${statusText}</div>
			${reservation.properties && reservation.properties.length > 0 ? 
				`<div class="reservation-property">${reservation.properties[0].title}</div>` : 
				'<div class="reservation-property">매물 정보 없음</div>'}
			<a href="/mypage" class="reservation-link">상세보기</a>
		`;
		
		widgetList.appendChild(reservationItem);
	});
}

// 기존 페이지 로드 시 로그인 상태 확인 로직은 그대로 유지
document.addEventListener("DOMContentLoaded", function() {
	console.log("⭐️ 페이지 로드 완료, 로그인 상태 확인 예정");
	// 약간의 지연 후 로그인 상태 확인 (네비게이션 로딩 후)
	setTimeout(checkLoginStatus, 100);
});