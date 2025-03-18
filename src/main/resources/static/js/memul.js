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

// 페이지 로드 시 URL 파라미터 읽어오기
document.addEventListener("DOMContentLoaded", function() {
    // 한글-일본어 매핑 생성
    const japaneseToKorean = {
        '足立区': '아다치구',
        '葛飾区': '가쓰시카구',
        '江戸川区': '에도가와구',
        '江東区': '고토구',
        '墨田区': '스미다구',
        '荒川区': '아라카와구',
        '台東区': '다이토구',
        '北区': '기타구',
        '文京区': '분쿄구',
        '豊島区': '도시마구',
        '板橋区': '이타바시구',
        '練馬区': '네리마구',
        '杉並区': '스기나미구',
        '中野区': '나카노구',
        '新宿区': '신주쿠구',
        '千代田区': '지요다구',
        '中央区': '주오구',
        '渋谷区': '시부야구',
        '世田谷区': '세타가야구',
        '港区': '미나토구',
        '目黒区': '메구로구',
        '品川区': '시나가와구',
        '大田区': '오타구'
    };
    
    // URL 파라미터 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const district = urlParams.get('district');
    const line = urlParams.get('line');
    
    // 지역구 필터 설정
    if (district) {
        // 검색창에는 한글 이름 표시 (있는 경우)
        const koreanName = japaneseToKorean[district] || district;
        document.getElementById('searchInput').value = koreanName;
        searchProperties();
    }
    
    // 노선 필터 설정
    if (line) {
        selectedStation = line; // 기존 변수 활용
        filterProperties();
    }
    
    // 기존 초기화 코드...
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

	// 서버에서 가져온 데이터를 사용
	let properties = [];

	// 서버에서 가져온 properties 데이터가 있으면 사용
	if (typeof serverProperties !== 'undefined' && serverProperties.length > 0) {
		// 서버 데이터 형식을 JavaScript 객체로 변환
		properties = serverProperties.map(property => ({
			title: property.title,
			rent: property.monthlyPrice,
			deposit: property.shikikin,
			mangementFee: property.managementFee,
			station: property.subwayLine || "",
			district: property.district || "",
			room: property.roomType || "",
			type: property.buildingType || "",
			year: property.builtYear || 2000,
			status: property.status,
			area: property.area,
			id: property.propertyId
		}));
	}

	// URL 파라미터 확인
	const urlParams = new URLSearchParams(window.location.search);
	const districtParam = urlParams.get('district');
	const lineParam = urlParams.get('line');

	// 파라미터가 있을 경우 필터 적용
	if (districtParam) {
		document.getElementById('searchInput').value = districtParam;
	}
	
	if (lineParam) {
		selectedStation = lineParam;
		// 선택된 노선 표시 UI 업데이트
		document.querySelector('.filter-btn.line-btn').textContent = lineParam + ' 노선 선택됨';
	}

	// 필터링 함수 수정
	function filterProperties() {
		// 서버 필터링 사용 여부 확인
		if (window.useServerFilter === true) {
			console.log("서버 필터링 사용 중");
			// 서버에서 이미 필터링된 데이터가 있으므로 그대로 사용
			return;
		}
		
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

		// 필터링 이전에 콘솔에 로그를 찍어 데이터가 있는지 확인
		console.log("총 매물 수:", properties.length);
		console.log("필터링 조건:", {
			minVal, maxVal, selectedStation, 
			selectedTypes, selectedRooms, buildingYear
		});

		// 필터링 결과 디버깅
		console.log("필터링 결과 매물 수:", filteredProperties.length);

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

	// 페이지 로드 시 필터링 실행
	filterProperties();

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

	// ✅ 노선 클릭 시 역 버튼 생성 - 여기가 문제되는 부분입니다
	document.querySelectorAll(".line").forEach(line => {
			line.addEventListener("click", function (event) {
					// a 태그인 경우 기본 링크 동작을 유지
					if (this.tagName === 'A') {
							return; // a 태그의 경우 기본 동작 실행 (href로 이동)
					}
					
					// a 태그가 아닌 경우에만 팝업 동작 실행
					event.preventDefault(); // 기본 동작 방지
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
});



