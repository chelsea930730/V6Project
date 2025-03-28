// 네비게이션과 푸터 연결
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

			// 헤더와 푸터, 스타일 가져오기
			const header = doc.querySelector('header');
			const footer = doc.querySelector('footer');
			const style = doc.querySelector('style');

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

			// 스타일 삽입
			if (!document.querySelector('style[data-navi-styles]')) {
				style.setAttribute('data-navi-styles', '');
				document.head.appendChild(style);
			}

			// ✅ 네비게이션이 완전히 로드된 후 로그인 상태 확인
			checkLoginStatus();
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
			
			if (!navMenu) {
				console.error("❌ nav-menu 요소를 찾을 수 없습니다");
				return;
			}
			
			const isAdmin = data.role === "ADMIN"; // 이메일이 아닌 role 값으로 관리자 여부 확인
			console.log("⭐️ 사용자 역할:", data.role, "관리자 여부:", isAdmin);

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
				} else {
					console.log("⭐️ 일반 사용자용 네비게이션 메뉴 설정");
					// 일반 사용자용 네비게이션 메뉴
					navMenu.innerHTML = `
						<div class="nav-links">
							<a href="/cart" class="nav-link">🛒 Cart</a>
							<a href="/mypage/chat.html?user=admin@realestate.com" class="nav-link" id="chat-link">채팅</a>
							<a href="/mypage/mypage.html" class="nav-link">마이페이지</a>
							<button class="logout-btn">LOGOUT</button>
						</div>
					`;
				}

				// 이전의 관리자 채팅 기능 이벤트 리스너 제거 - 이제 필요 없음
				// 링크는 직접 각 페이지로 이동하게 설정됨
			} else {
				console.log("⭐️ 로그아웃 상태 - 로그인 버튼만 표시");
				// ✅ 로그아웃 상태일 때는 로그인 버튼만 표시
				navMenu.innerHTML = `
					<div class="auth-buttons">
						<a href="/user/login" class="login-btn">LOGIN</a>
					</div>
				`;
			}
			
			console.log("⭐️ 네비게이션 메뉴 설정 완료:", navMenu.innerHTML);
		})
		.catch(error => {
			console.error("❌ 로그인 상태 확인 실패:", error);
			// 에러 발생 시 기본적으로 로그인 버튼을 표시
			const navMenu = document.getElementById("nav-menu");
			if (navMenu) {
				navMenu.innerHTML = `
					<div class="auth-buttons">
						<a href="/user/login" class="login-btn">LOGIN</a>
					</div>
				`;
			}
		});
}

// 로그아웃 처리 함수
document.body.addEventListener("click", function (event) {
	if (event.target.classList.contains("logout-btn")) {
		console.log("⭐️ 로그아웃 버튼 클릭");
		fetch("/user/logout", { method: "POST" }) // ✅ 서버에 로그아웃 요청
			.then(() => {
				console.log("⭐️ 로그아웃 성공");
				checkLoginStatus(); // ✅ 네비게이션 업데이트
				window.location.href = "/"; // 메인 페이지로 이동
			})
			.catch(error => console.error("❌ 로그아웃 실패:", error));
	}
});

// ✅ 로그인 버튼 클릭 시 `/user/login` 페이지로 이동 (동적으로 생성된 요소 대응)
document.addEventListener("click", function (event) {
	if (event.target.classList.contains("login-btn")) {
		console.log("⭐️ 로그인 버튼 클릭");
		window.location.href = "/user/login";
	}
});

// 페이지 로드 시 로그인 상태 확인
document.addEventListener("DOMContentLoaded", function() {
	console.log("⭐️ 페이지 로드 완료, 로그인 상태 확인 예정");
	// 약간의 지연 후 로그인 상태 확인 (네비게이션 로딩 후)
	setTimeout(checkLoginStatus, 100);
});