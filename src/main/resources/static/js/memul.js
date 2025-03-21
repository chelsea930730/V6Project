// 전역 변수 설정
let selectedStation = "";
let selectedLine = "";
let currentProperties = [];

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

// 한글-일본어 매핑
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

// 페이지 로드 시 초기화
document.addEventListener("DOMContentLoaded", function() {
	// 서버에서 받은 초기 데이터 사용
	if (typeof serverProperties !== 'undefined' && serverProperties) {
		currentProperties = serverProperties;
		updatePropertyList(currentProperties);
	}

	// 필터 초기화 및 이벤트 설정
	initializePriceSliders();
	setupEventListeners();
	setupLinePopup();
});

// 매물 데이터 가져오기
function fetchProperties() {
	fetch('/property/list')
		.then(response => response.json())
		.then(data => {
			currentProperties = data;
			updatePropertyList(currentProperties);
		})
		.catch(error => console.error('매물 데이터 로드 실패:', error));
}


// 가격 슬라이더 초기화
function initializePriceSliders() {
	const minPrice = document.getElementById("minPrice");
	const maxPrice = document.getElementById("maxPrice");
	const minValue = document.getElementById("minValue");
	const maxValue = document.getElementById("maxValue");

	// 초기값 설정
	minValue.textContent = Number(minPrice.value).toLocaleString() + "円";
	maxValue.textContent = Number(maxPrice.value).toLocaleString() + "円";
}

// 이벤트 리스너 설정
function setupEventListeners() {
	// 가격 슬라이더 이벤트
	const minPrice = document.getElementById("minPrice");
	const maxPrice = document.getElementById("maxPrice");
	const minValue = document.getElementById("minValue");
	const maxValue = document.getElementById("maxValue");

	minPrice.addEventListener("input", function() {
		minValue.textContent = Number(this.value).toLocaleString() + "円";
		filterProperties();
	});

	maxPrice.addEventListener("input", function() {
		maxValue.textContent = Number(this.value).toLocaleString() + "円";
		filterProperties();
	});

	// 체크박스 이벤트
	document.querySelectorAll('.property-item input[type="checkbox"]').forEach(checkbox => {
		checkbox.addEventListener('change', function(event) {
			event.stopPropagation(); // 이벤트 버블링 방지
		});
	});

	// 건축년도 선택 이벤트
	document.getElementById('building-year').addEventListener('change', filterProperties);

	// 검색 입력 이벤트
	const searchInput = document.getElementById('searchInput');
	if (searchInput) {
		searchInput.addEventListener('input', debounce(filterProperties, 300));
	}
}

// 노선 팝업 설정
function setupLinePopup() {
	const linePopup = document.getElementById("linePopup");
	const stationListContainer = document.getElementById("stationList");

	// 팝업 열기
	document.querySelector(".line-btn").addEventListener("click", () => {
		linePopup.style.display = "block";
		document.body.style.overflow = "hidden";
	});

	// 팝업 닫기
	document.querySelector(".close-btn").addEventListener("click", () => {
		linePopup.style.display = "none";
		document.body.style.overflow = "auto";
	});

	// 팝업 외부 클릭 시 닫기
	window.addEventListener("click", (event) => {
		if (event.target === linePopup) {
			linePopup.style.display = "none";
			document.body.style.overflow = "auto";
		}
	});

	// 노선 클릭 이벤트
	document.querySelectorAll(".line").forEach(line => {
		line.addEventListener("click", function() {
			const lineName = this.textContent.trim();
			selectedLine = lineName;
			selectedLine = "";
			const stationList = stations[lineName];

			if (stationList) {
				stationListContainer.innerHTML = generateStationListHTML(lineName, stationList, this.classList[1]);
				setupStationClickEvents(linePopup);
				updateFilterMessage();
				filterProperties();
			}
		});
	});
}

// 역 목록 HTML 생성
function generateStationListHTML(lineName, stations, lineClass) {
	return `
        <h3>${lineName} 노선 역 선택</h3>
        <div class="station-list">
            ${stations.map(station => `
                <span class="station ${lineClass}">${station}</span>
            `).join('')}
        </div>
    `;
}

// 역 클릭 이벤트 설정
function setupStationClickEvents(popup) {
	document.querySelectorAll('.station').forEach(station => {
		station.addEventListener('click', function() {
			selectedStation = this.textContent;
			updateFilterMessage();
			filterProperties();
			popup.style.display = "none";
			document.body.style.overflow = "auto";
		});
	});
}

// 필터 메시지 업데이트 함수
function updateFilterMessage() {
	const filterMessageContainer = document.querySelector('.hero div');
	if (!filterMessageContainer) return;

	let message = '';
	if (selectedStation) {
		message = `<p>${selectedLine} ${selectedStation}역 매물을 보고 계십니다</p>`;
	} else if (selectedLine) {
		message = `<p>${selectedLine} 노선 매물을 보고 계십니다</p>`;
	}

	if (message) {
		filterMessageContainer.innerHTML = message;
	}
}

// 필터링 함수
function filterProperties() {
	const filterData = {
		minPrice: Number(document.getElementById('minPrice').value),
		maxPrice: Number(document.getElementById('maxPrice').value),
		buildingTypes: Array.from(document.querySelectorAll('input[name="type"]:checked'))
			.map(cb => cb.value),
		roomTypes: Array.from(document.querySelectorAll('input[name="room"]:checked'))
			.map(cb => cb.value),
		buildingYear: document.getElementById('building-year').value,
		station: selectedStation,
		keyword: document.getElementById('searchInput')?.value || ''
	};

	fetch('/property/filter', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(filterData)
	})
		.then(response => response.json())
		.then(data => {
			updatePropertyList(data);
		})
		.catch(error => {
			console.error('필터링 오류:', error);
			// 에러 발생 시 현재 데이터 유지
			updatePropertyList(currentProperties);
		});
}

// 매물 목록 업데이트
function updatePropertyList(properties) {
	const propertyList = document.querySelector('.property-list');

	if (!properties || properties.length === 0) {
		propertyList.innerHTML = `
            <h1>매물 리스트</h1>
            <!-- 정렬 옵션 -->
            <div class="sort-options">
                <select class="form-select" style="width: 200px; display: inline-block;">
                    <option value="newest">최신순</option>
                    <option value="price-low">가격 낮은순</option>
                    <option value="price-high">가격 높은순</option>
                </select>
                <!-- 장바구니 버튼 -->
                <button onclick="addSelectedToCart()" class="add-cart-button" style="margin-left: 15px;">
                    선택한 매물 장바구니에 담기
                </button>
            </div>
            <!-- 폼 -->
            <form id="cartForm" action="/cart/add" method="post" style="display: none;"></form>
            <div class="empty-message">검색 결과가 없습니다.</div>`;
		return;
	}

	let html = `
        <h1>매물 리스트</h1>
        <!-- 정렬 옵션 -->
        <div class="sort-options">
            <select class="form-select" style="width: 200px; display: inline-block;">
                <option value="newest">최신순</option>
                <option value="price-low">가격 낮은순</option>
                <option value="price-high">가격 높은순</option>
            </select>
            <!-- 장바구니 버튼 -->
            <button onclick="addSelectedToCart()" class="add-cart-button" style="margin-left: 15px;">
                선택한 매물 장바구니에 담기
            </button>
        </div>
        <!-- 폼 -->
        <form id="cartForm" action="/cart/add" method="post" style="display: none;"></form>
    `;

	html += properties.map(property => `
        <div class="property-item">
            <div class="property-header">
                <div class="header-left">
                    <input type="checkbox" value="${property.propertyId}">
                    <span class="property-no">NO.${property.propertyId}</span>
                    <span>${property.title}</span>
                </div>
            </div>
            <table class="property-info-table">
                <tr>
                    <td>
                        <div class="no-image-container" style="width: 150px; height: 100px; background-color: #f5f5f5; display: flex; align-items: center; justify-content: center;">
                            <span>이미지 준비중</span>
                        </div>
                    </td>
                    <td>
                        <div>${Number(property.monthlyPrice).toLocaleString()}円</div>
                        <div>${Number(property.managementFee).toLocaleString()}円</div>
                    </td>
                    <td>
                        <div>${Number(property.shikikin).toLocaleString()} / ${Number(property.reikin).toLocaleString()}</div>
                    </td>
                    <td>
                        <div>${property.roomType}</div>
                        <div>${property.area}m²</div>
                        <div>${property.buildingType}</div>
                    </td>
                    <td>${property.builtYear}</td>
                    <td>
                        <div class="status-available">${property.status}</div>
                    </td>
                    <td>
                        <a href="/property/${property.propertyId}" class="detail-button">상세보기</a>
                    </td>
                </tr>
            </table>
            <div class="address-info">
                <div>${property.location}</div>
                <div>${property.subwayLine}</div>
            </div>
        </div>
    `).join('');

	propertyList.innerHTML = html;
}

// 디바운스 함수
function debounce(func, wait) {
	let timeout;
	return function(...args) {
		clearTimeout(timeout);
		timeout = setTimeout(() => func.apply(this, args), wait);
	};
}



//카트 함수
console.log("서버에서 받은 매물 수:", serverProperties.length);

// JavaScript 필터링 비활성화 (서버 필터링 사용)
window.useServerFilter = true;

function addSelectedToCart() {
	// 체크된 체크박스 찾기
	const checkboxes = document.querySelectorAll('.property-item input[type="checkbox"]:checked');

	if (checkboxes.length === 0) {
		alert('장바구니에 담을 매물을 선택해주세요.');
		return;
	}

	// form 요소 가져오기
	const form = document.getElementById('cartForm');

	// 기존 input 요소들 제거
	form.innerHTML = '';

	// 선택된 체크박스의 값을 폼에 추가
	checkboxes.forEach(checkbox => {
		const input = document.createElement('input');
		input.type = 'hidden';
		input.name = 'propertyIds';
		input.value = checkbox.value;
		form.appendChild(input);
	});



	// 폼 제출
	form.submit();
}
