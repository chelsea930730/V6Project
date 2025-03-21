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
			const navMenu = document.getElementById("nav-menu"); // 네비게이션 메뉴 영역
			const isAdmin = data.email === "admin@realestate.com";

			if (data.isLoggedIn) {
				// ✅ 로그인된 경우
				navMenu.innerHTML = `
                    <div class="nav-links">
                        <a href="/cart" class="nav-link">🛒 Cart</a>
                        <a href="/mypage/chat.html" class="nav-link" id="chat-link">채팅</a>
                        <a href="/mypage/mypage.html" class="nav-link" id="mypage-link">마이페이지</a>
                        <button class="logout-btn">LOGOUT</button>
                    </div>
                `;
                
				// 마이페이지 링크 클릭 이벤트 추가
				const mypageLink = document.getElementById("mypage-link");
				if (mypageLink) {
					mypageLink.addEventListener("click", function(event) {
						event.preventDefault(); // 기본 링크 동작 방지
						window.location.href = "/mypage/mypage.html"; // 마이페이지로 이동
					});
				}

				// 관리자 채팅 기능을 위한 이벤트 리스너 추가
				const chatLink = document.getElementById("chat-link");
				if (chatLink) {
					chatLink.addEventListener("click", function(event) {
						if (isAdmin) {
							event.preventDefault();
							window.location.href = "/mypage/chat-list.html";
						}
					});
				}
			} else {
				// ✅ 로그아웃 상태일 때는 로그인 버튼만 표시
				navMenu.innerHTML = `
                    <div class="auth-buttons">
                        <a href="/user/login" class="login-btn">LOGIN</a>
                    </div>
                `;
			}
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
