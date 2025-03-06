// 먼저 로컬 스토리지의 로그인 관련 데이터를 모두 삭제
localStorage.removeItem("isLoggedIn");
localStorage.removeItem("user");

// ✅ 로그인 여부를 확인하는 함수
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const user = JSON.parse(localStorage.getItem("user"));
    const navMenu = document.getElementById("nav-menu");

    if (isLoggedIn === "true" && user) {
        // ✅ 로그인 상태일 때 - CSS 클래스 적용
        navMenu.innerHTML = `
            <a href="/HTML/cart.html" class="nav-link">🛒 Cart</a>
            <a href="/HTML/alarm.html" class="nav-link">알림</a>
            <a href="/HTML/mypage.html" class="nav-link">마이페이지</a>
            <button class="logout-btn" onclick="handleLogout(event)">LOGOUT</button>
        `;
    } else {
        // ✅ 로그아웃 상태일 때 - CSS 클래스 적용
        navMenu.innerHTML = `
            <a href="/HTML/login.html" class="nav-link"><button class="login-btn">LOGIN</button></a>
        `;
    }
}

// 페이지 로드 시 초기화
document.addEventListener("DOMContentLoaded", () => {
    checkLoginStatus();
    
    // 브라우저 뒤로가기/앞으로가기 처리
    window.addEventListener('popstate', () => {
        const currentPath = window.location.pathname;
        if (currentPath === '/HTML/memul.html') {
            loadMemulContent();
        } else if (currentPath === '/HTML/login.html') {
            loadLoginContent();
        }
    });
});

// 검색 기능 구현
function searchProperties() {
	const searchInput = document.getElementById('searchInput').value.toLowerCase();
	const propertyItems = document.querySelectorAll('.property-item');
	
	propertyItems.forEach(item => {
			const title = item.querySelector('h3').textContent.toLowerCase();
			const description = item.querySelector('p').textContent.toLowerCase();
			
			// 검색어가 제목이나 설명에 포함되어 있는지 확인
			if (title.includes(searchInput) || description.includes(searchInput)) {
					item.style.display = 'flex';
			} else {
					item.style.display = 'none';
			}
	});
}

// 실시간 검색을 위한 이벤트 리스너
document.getElementById('searchInput').addEventListener('input', function() {
	searchProperties();
});


// Enter 키 입력 시 검색 실행
document.getElementById('searchInput').addEventListener('keypress', function(e) {
	if (e.key === 'Enter') {
			searchProperties();
	}
});




document.addEventListener("DOMContentLoaded", function () {
	checkLoginStatus();

	const linePopup = document.getElementById("linePopup");
	const stationListContainer = document.getElementById("stationList");
	const propertyList = document.querySelector(".property-list");
	let selectedStation = "";


// 매물 데이터 설정
	// ✅ 가상의 매물 데이터
	let properties = [
	//일단 공백백
	];

// DB에서 매물 데이터 가져오기
async function fetchPropertiesFromDB() {
	try {
			const response = await fetch("/api/properties"); // 나중에 Spring Boot API 경로로 변경
			properties = await response.json();
			filterProperties(); // 데이터를 가져온 후 필터링 함수 실행
	} catch (error) {
			console.error("데이터를 불러오는 중 오류 발생:", error);
	}
}


	// ✅ 노선별 역 데이터
	const stations = {
			"야마노테": ["신주쿠", "이케부쿠로", "도쿄", "우에노", "시부야", "시나가와", "신바시", "아키하바라", "오사키", "유라쿠쵸", "타마치", "하마마츠초", "에비스", "고탄다", "닛포리", "메구로", "니시닛포리", "칸다", "스가모", "오카치마치", "요요기", "오츠카", "하라주쿠", "코마고메", "타바타", "신오쿠보", "메지로", "우구스이다니"],
			"츄오- 소부": ["코이와","신코이와", "히라이", "카메이도", "킨시쵸", "료고쿠", "아사쿠사바시", "아키하바라", "오차노미즈","스이도바시", "이다바시", "이치가야", "요츠야", "시나노마치","센다가야", "요요기", "신주쿠","오쿠보","히가시나카노", "나카노", "코엔지","오기쿠보","니시오기쿠보"],
			"사이쿄": ["오사키","에비스", "시부야야", "신주쿠", "이케부쿠로", "이타바시","주조","아카바네", "키타아카바네", "우키마후나도"],
			"죠반": ["키타센주","미나미센주","미카와시마","닛포리", "우에노", "도쿄", "시나가와"],
			"타카사키": ["도쿄", "우에노", "오쿠", "아카바네"],
			"요코스카": ["니시오이", "시나가와", "신바시", "도쿄"],
			"케이힌토쿠": ["아카바네", "히가시주조", "오지", "카미나카자토", "타바타", "니시닛포리", "닛포리", "우구이스다니", "우에노", "오카치마치", "아키하바라", "칸다", "도쿄", "유리쿠쵸", "신바시", "하마마츠초", "타마치", "타카나와 게이트웨이", "시나가와", "오이마치", "오모리", "카마타"],
			
			"한조몬": ["시부야", "오모테산도", "아오야마잇초메","나카타쵸", "한조몬", "쿠단시타", "진보초", "오테마치", "미츠코시마에", "스이텐구마에", "키요스미시라카와", "스미요시", "킨시초", "오시아게"],
			"마루노우치": ["오기쿠보","미나미아사가야","신코엔지","히가시코엔지","신나카노","나카노사카우에","니시신주쿠", "신주쿠","신주쿠산초메","신주쿠교엔마에","요츠야산초메", "요츠야", "아카사카미츠케","콧카이기지도마에","카스미가세키","긴자","도쿄","오테마치","아와지초","오차노미즈","혼고산초메","코라쿠엔", "묘가다니","신오츠카","이케부쿠로로"],
			"히비야": ["나카메구로", "에비스", "히로오", "롯폰기", "카미야쵸", "토라노몬힐즈", "카스미가세키", "히비야", "긴자", "히가시긴자", "츠키지", "핫쵸보리", "카야바쵸", "닌교초", "코덴마쵸", "아키하바라", "나카오카치마치", "우에노", "이리야", "미노와", "미나미센주", "키타센주"],
			"치요다": ["요요기우에하라", "요요기코엔", "메이지진구마에", "오모테산도", "노기자카", "아카사카", "콧카이기지도마에", "카스미가세키", "히비야", "니주바시마에", "오테마치", "신오차노미즈", "유시마", "네즈", "센다기", "니시닛포리", "마치야", "키타센주", "아야세", "키타아야세"],
			"후쿠토신": ["치카테츠나리마스", "치카테츠아카츠카", "헤이와다이","히카와다이", "코타케무카이하라", "센카와", "카나메초", "이케부쿠로", "조시가야","니시와세다","히가시신주쿠","신주쿠산초메", "키타산도", "메이지진구마에","시부야"],
			"긴자": ["시부야", "오모테산도","가이엔마에", "아오야마잇초메", "아카사카미츠케", "타메이케산노", "토라노몬", "신바시", "긴자", "쿄바시", "니혼바시", "미츠코시마에", "칸다", "스에히로쵸", "우에노히로코지", "우에노", "이나리초", "타와라마치", "아사쿠사"],
			"난보쿠": ["메구로", "시로카네다이", "시로카네타카나와", "아자주부반", "롯폰기잇초메", "타메이케산노", "나가타쵸", "요츠야","이치가야", "이다바시", "코라쿠엔", "토다이마에", "혼코마고메", "코마고메", "니시가하라", "오지", "오지카미야", "시모", "아카바네이와부치"],
			"유라쿠쵸": ["치카테츠나리마스", "치카테츠아카츠카", "헤이와다이","히카와다이", "코타케무카이하라", "센카와", "카나메초", "이케부쿠로", "히가시이케부쿠로", "고코쿠지", "에도가와바시", "이다바시", "이치가야", "코지마치", "나가타쵸", "사쿠라다몬", "유라쿠쵸", "긴자잇초메", "신토미초", "츠키시마", "토요스", "타츠미", "신키바바"],
			"토자이": ["나카노","오치아이", "타카다노바바", "와세다", "카구라자카", "이다바시", "쿠단시타", "타케바시", "오테마치", "니혼바시", "카야바쵸", "몬젠나카쵸", "키바", "토요쵸", "미나미스나미치","니시카사이", "카사이"]
		};

	// ✅ 팝업 열기
	document.querySelector(".line-btn").addEventListener("click", function () {
			linePopup.style.display = "block";
			document.body.style.overflow = "hidden";
	});

	// ✅ 팝업 닫기
	document.querySelector(".close-btn").addEventListener("click", function () {
			linePopup.style.display = "none";
			document.body.style.overflow = "auto";
	});

	// ✅ 팝업 외부 클릭 시 닫기
	window.addEventListener("click", function (event) {
			if (event.target === linePopup) {
					linePopup.style.display = "none";
					document.body.style.overflow = "auto";
			}
	});

	// ✅ ESC 키로 팝업 닫기
	document.addEventListener("keydown", function (event) {
			if (event.key === "Escape") {
					linePopup.style.display = "none";
					document.body.style.overflow = "auto";
			}
	});

	// ✅ 노선 클릭 시 역 버튼 생성
	document.querySelectorAll(".line").forEach(line => {
			line.addEventListener("click", function () {
					const selectedLine = this.textContent.trim();
					stationListContainer.innerHTML = `<h3>${selectedLine} 노선 역 선택</h3>`;
					
					if (stations[selectedLine]) {
							stations[selectedLine].forEach(station => {
									const stationElement = document.createElement("span");
									stationElement.classList.add("station", this.classList[1]); // 노선 색상 적용
									stationElement.textContent = station;

									stationElement.addEventListener("click", function () {
											document.querySelectorAll(".station").forEach(st => st.classList.remove("selected"));
											stationElement.classList.add("selected");
											selectedStation = station;
											console.log(`🏠 선택된 역: ${station}`);
											filterProperties();
											linePopup.style.display = "none";
											document.body.style.overflow = "auto";
									});

									stationListContainer.appendChild(stationElement);
							});
					}
			});
	});




	// ✅ 필터링 함수 (역 선택 & 월세 필터 적용)
	function filterProperties() {
			const minVal = parseInt(document.getElementById("minPrice").value);
			const maxVal = parseInt(document.getElementById("maxPrice").value);

			const selectedTypes = Array.from(document.querySelectorAll("input[name='type']:checked")).map(el => el.value);
			const selectedRooms = Array.from(document.querySelectorAll("input[name='room']:checked")).map(el => el.value);
			const buildingYear = document.getElementById("building-year").value;

			const filteredProperties = properties.filter(property => {
					if (property.rent < minVal || property.rent > maxVal) return false;
					if (selectedStation && property.station !== selectedStation) return false;
					if (selectedTypes.length > 0 && !selectedTypes.includes(property.type)) return false;
					if (selectedRooms.length > 0 && !selectedRooms.includes(property.room)) return false;

					if (buildingYear) {
							const currentYear = new Date().getFullYear();
							const propertyAge = currentYear - property.year;
							const yearLimits = { "1년 이내": 1, "5년 이내": 5, "10년 이내": 10, "15년 이내": 15, "20년 이내": 20, "25년 이내": 25, "30년 이내": 30 };
							if (propertyAge > yearLimits[buildingYear]) return false;
					}
					return true;
			});

			propertyList.innerHTML = "<h1>매물 리스트</h1>";
			if (filteredProperties.length === 0) {
					propertyList.innerHTML += "<p>검색 결과가 없습니다.</p>";
					return;
			}

			filteredProperties.forEach(property => {
					const propertyItem = document.createElement("div");
					propertyItem.classList.add("property-item");
					propertyItem.innerHTML = `
							<img src="https://via.placeholder.com/150" alt="매물 이미지">
							<div class="property-info">
									<h3>${property.title}</h3>
									<p>월세: ${property.rent.toLocaleString()}円 | ${property.room} | ${property.year}년</p>
									<p>역: ${property.station}</p>
									<a href="/*" class="detail-btn">상세보기</a>
							</div>
					`;
					propertyList.appendChild(propertyItem);
			});
	}

	filterProperties();
});



