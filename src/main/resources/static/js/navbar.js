// 네비게이션과 푸터 연결
document.addEventListener("DOMContentLoaded", function () {
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
				navbarPlaceholder.innerHTML = header.outerHTML;
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
	fetch("/user/index")
		.then(response => response.json())
		.then(data => {
			console.log("Login Status Response:", data); // 응답 로그 추가
			const navMenu = document.getElementById("nav-menu");

			if (data.isLoggedIn) {
				navMenu.innerHTML = `
                    <a href="/cart/cart.html" class="nav-link">🛒 Cart</a>
                    <a href="/chat.html" class="nav-link">채팅</a>
                    <a href="/mypage/alarm.html" class="nav-link">알림</a>
                    <a href="/mypage/mypage.html" class="nav-link">마이페이지</a>
                    <button class="logout-btn">LOGOUT</button>
                `;
			} else {
				navMenu.innerHTML = `
                    <a href="/user/login" class="nav-link login-btn">LOGIN</a>
                `;
			}
		})
		.catch(error => console.error("❌ 로그인 상태 확인 실패:", error));
}

// 로그아웃 처리 함수
document.body.addEventListener("click", function (event) {
	if (event.target.classList.contains("logout-btn")) {
		fetch("/user/logout", { method: "POST" }) // ✅ 서버에 로그아웃 요청
			.then(() => {
				checkLoginStatus(); // ✅ 네비게이션 업데이트
				window.location.href = "/"; // 메인 페이지로 이동
			})
			.catch(error => console.error("❌ 로그아웃 실패:", error));
	}
});

// ✅ 로그인 버튼 클릭 시 `/user/login` 페이지로 이동 (동적으로 생성된 요소 대응)
document.addEventListener("click", function (event) {
	if (event.target.classList.contains("login-btn")) {
		window.location.href = "/user/login";
	}
});

// 페이지 로드 시 로그인 상태 확인
document.addEventListener("DOMContentLoaded", checkLoginStatus);
