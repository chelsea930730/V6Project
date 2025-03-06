//네비 연결
document.addEventListener("DOMContentLoaded", function () {
	fetch("/HTML/navi.html")  // ✅ `navi.html` 위치 확인 후 수정
			.then(response => {
					if (!response.ok) {
							throw new Error("네비게이션 파일을 찾을 수 없습니다.");
					}
					return response.text();
			})
			.then(data => {
					let navbar = document.getElementById("navbar-placeholder");
					if (navbar) {
							navbar.innerHTML = data;
					} else {
							console.error("❌ `navbar-placeholder` ID를 가진 요소가 존재하지 않습니다.");
					}
			})
			.catch(error => console.error("❌ 네비게이션 로딩 오류:", error));
});


// 로그인 상태 체크 및 네비게이션 업데이트
function checkLoginStatus() {
	const isLoggedIn = localStorage.getItem("isLoggedIn"); // 로그인 상태 확인
	const user = JSON.parse(localStorage.getItem("user")); // 유저 정보 가져오기
	const navMenu = document.getElementById("nav-menu"); // 네비게이션 메뉴 영역

	if (isLoggedIn === "true" && user) {
			// 로그인 상태일 때 표시할 메뉴
			navMenu.innerHTML = `
					<a href="/HTML/cart.html" class="nav-link">🛒 Cart</a>
					<a href="/HTML/alarm.html" class="nav-link">알림</a>
					<a href="/HTML/mypage.html" class="nav-link">마이페이지</a>
					<button class="logout-btn" onclick="handleLogout()">LOGOUT</button>
			`;
	} else {
			// 로그아웃 상태일 때 표시할 메뉴
			navMenu.innerHTML = `
					<a href="/HTML/login.html" class="nav-link">
							<button class="login-btn">LOGIN</button>
					</a>
			`;
	}
}

// 로그아웃 처리 함수
function handleLogout() {
	localStorage.removeItem("isLoggedIn"); // 로그인 상태 삭제
	localStorage.removeItem("user"); // 사용자 정보 삭제
	checkLoginStatus(); // 네비게이션 업데이트
	window.location.href = "/HTML/login.html"; // 로그인 페이지로 이동
}

//페이지 로드 시 로그인 상태 확인
document.addEventListener("DOMContentLoaded", checkLoginStatus);

