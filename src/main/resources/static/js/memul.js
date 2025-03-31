// 전역 변수 설정
const filterState = {
	selectedStation: "",
	selectedLines: new Set(),  // 선택된 노선들을 저장하는 Set
	selectedStations: new Set(),  // 선택된 역들을 저장하는 Set
	currentProperties: [],
	isLinePopupInitialized: false
};

let selectedLine = '';
let selectedStation = '';

function formatStationName(koreanName) {
	const japanese = stationToJapanese[koreanName];
	return japanese ? `${japanese}(${koreanName})` : koreanName;
}



// 전역 변수로 이벤트 리스너가 설정되었는지 추적
let isEventListenerSet = false;

const stations = {
	"JR야마노테선": ["신주쿠", "이케부쿠로", "도쿄", "우에노", "시부야", "시나가와", "신바시", "아키하바라", "오사키", "유라쿠쵸", "타마치", "하마마츠초", "에비스", "고탄다", "닛포리", "메구로", "니시닛포리", "칸다", "스가모", "오카치마치", "요요기", "오츠카", "하라주쿠", "코마고메", "타바타", "신오쿠보", "메지로", "우구스이다니"],
	"JR츄오소부선": ["코이와","신코이와", "히라이", "카메이도", "킨시쵸", "료고쿠", "아사쿠사바시", "아키하바라", "오차노미즈","스이도바시", "이다바시", "이치가야", "요츠야", "시나노마치","센다가야", "요요기", "신주쿠","오쿠보","히가시나카노", "나카노", "코엔지","오기쿠보","니시오기쿠보"],
	"JR사이쿄선": ["오사키","에비스", "시부야야", "신주쿠", "이케부쿠로", "이타바시","주조","아카바네", "키타아카바네", "우키마후나도"],
	"JR죠반선": ["키타센주","미나미센주","미카와시마","닛포리", "우에노", "도쿄", "시나가와"],
	"JR타카사키선": ["도쿄", "우에노", "오쿠", "아카바네"],
	"JR요코스카선": ["니시오이", "시나가와", "신바시", "도쿄"],
	"JR케이힌토쿠선": ["아카바네", "히가시주조", "오지", "카미나카자토", "타바타", "니시닛포리", "닛포리", "우구이스다니", "우에노", "오카치마치", "아키하바라", "칸다", "도쿄", "유리쿠쵸", "신바시", "하마마츠초", "타마치", "타카나와 게이트웨이", "시나가와", "오이마치", "오모리", "카마타"],

	"한조몬선": ["시부야", "오모테산도", "아오야마잇초메","나카타쵸", "한조몬", "쿠단시타", "진보초", "오테마치", "미츠코시마에", "스이텐구마에", "키요스미시라카와", "스미요시", "킨시초", "오시아게"],
	"마루노우치선": ["오기쿠보","미나미아사가야","신코엔지","히가시코엔지","신나카노","나카노사카우에","니시신주쿠", "신주쿠","신주쿠산초메","신주쿠교엔마에","요츠야산초메", "요츠야", "아카사카미츠케","콧카이기지도마에","카스미가세키","긴자","도쿄","오테마치","아와지초","오차노미즈","혼고산초메","코라쿠엔", "묘가다니","신오츠카","이케부쿠로로"],
	"히비야선": ["나카메구로", "에비스", "히로오", "롯폰기", "카미야쵸", "토라노몬힐즈", "카스미가세키", "히비야", "긴자", "히가시긴자", "츠키지", "핫쵸보리", "카야바쵸", "닌교초", "코덴마쵸", "아키하바라", "나카오카치마치", "우에노", "이리야", "미노와", "미나미센주", "키타센주"],
	"치요다선": ["요요기우에하라", "요요기코엔", "메이지진구마에", "오모테산도", "노기자카", "아카사카", "콧카이기지도마에", "카스미가세키", "히비야", "니주바시마에", "오테마치", "신오차노미즈", "유시마", "네즈", "센다기", "니시닛포리", "마치야", "키타센주", "아야세", "키타야세"],
	"후쿠토신선": ["치카테츠나리마스", "치카테츠아카츠카", "헤이와다이","히카와다이", "코타케무카이하라", "센카와", "카나메초", "이케부쿠로", "조시가야","니시와세다","히가시신주쿠","신주쿠산초메", "키타산도", "메이지진구마에","시부야"],
	"긴자선": ["시부야", "오모테산도","가이엔마에", "아오야마잇초메", "아카사카미츠케", "타메이케산노", "토라노몬", "신바시", "긴자", "쿄바시", "니혼바시", "미츠코시마에", "칸다", "스에히로쵸", "우에노히로코지", "우에노", "이나리초", "타와라마치", "아사쿠사"],
	"난보쿠선": ["메구로", "시로카네다이", "시로카네타카나와", "아자주부반", "롯폰기잇초메", "타메이케산노", "나가타쵸", "요츠야","이치가야", "이다바시", "코라쿠엔", "토다이마에", "혼코마고메", "코마고메", "니시가하라", "오지", "오지카미야", "시모", "아카바네이와부치"],
	"유라쿠쵸선": ["치카테츠나리마스", "치카테츠아카츠카", "헤이와다이","히카와다이", "코타케무카이하라", "센카와", "카나메초", "이케부쿠로", "히가시이케부쿠로", "고코쿠지", "에도가와바시", "이다바시", "이치가야", "코지마치", "나가타쵸", "사쿠라다몬", "유라쿠쵸", "긴자잇초메", "신토미초", "츠키시마", "토요스", "타츠미", "신키바바"],
	"토자이선": ["나카노","오치아이", "타카다노바바", "와세다", "카구라자카", "이다바시", "쿠단시타", "타케바시", "오테마치", "니혼바시", "카야바쵸", "몬젠나카쵸", "키바", "토요쵸", "미나미스나미치","니시카사이", "카사이"]
};


// 한글-일본어 매핑
const japaneseToKorean = {
	'足立区': '아다치',
	'葛飾区': '카츠시카',
	'江戸川区': '에도가와',
	'江東区': '고토',
	'墨田区': '스미다',
	'荒川区': '아라카와',
	'台東区': '다이토',
	'北区': '키타',
	'文京区': '분쿄',
	'豊島区': '도시마',
	'板橋区': '이타바시',
	'練馬区': '네리마',
	'杉並区': '스기나미',
	'中野区': '나카노',
	'新宿区': '신주쿠',
	'千代田区': '치요다',
	'中央区': '추오',
	'渋谷区': '시부야',
	'世田谷区': '세타가야',
	'港区': '미나토',
	'目黒区': '메구로',
	'品川区': '시나가와',
	'大田区': '오타'
};

// 노선 한글-일본어 매핑 추가
const lineToJapanese = {
	"JR야마노테선": "JR山手線",
	"JR츄오소부선": "JR中央・総武線",
	"JR사이쿄선": "JR埼京線",
	"JR죠반선": "JR常磐線",
	"JR타카사키선": "JR高崎線",
	"JR요코스카선": "JR横須賀線",
	"JR케이힌토쿠선": "JR京浜東北線",
	"한조몬선": "半蔵門線",
	"마루노우치선": "丸ノ内線",
	"히비야선": "日比谷線",
	"치요다선": "千代田線",
	"후쿠토신선": "副都心線",
	"긴자선": "銀座線",
	"난보쿠선": "南北線",
	"유라쿠쵸선": "有楽町線",
	"토자이선": "東西線"
};

// 역 한글-일본어 매핑 추가
const stationToJapanese = {
	"신주쿠": "新宿",
	"이케부쿠로": "池袋",
	"도쿄": "東京",
	"우에노": "上野",
	"시부야": "渋谷",
	"시나가와": "品川",
	"신바시": "新橋",
	"아키하바라": "秋葉原",
	"오사키": "大崎",
	"유라쿠쵸": "有楽町",
	"타마치": "田町",
	"하마마츠초": "浜松町",
	"에비스": "恵比寿",
	"고탄다": "五反田",
	"닛포리": "日暮里",
	"메구로": "目黒",
	"니시닛포리": "西日暮里",
	"칸다": "神田",
	"스가모": "巣鴨",
	"오카치마치": "御徒町",
	"요요기": "代々木",
	"오츠카": "大塚",
	"하라주쿠": "原宿",
	"코마고메": "駒込",
	"타바타": "田端",
	"신오쿠보": "新大久保",
	"메지로": "目白",
	"우구스이다니": "鶯谷",
	"코이와": "小岩",
	"신코이와": "新小岩",
	"히라이": "平井",
	"카메이도": "亀戸",
	"킨시쵸": "錦糸町",
	"료고쿠": "両国",
	"아사쿠사바시": "浅草橋",
	"오차노미즈": "御茶ノ水",
	"스이도바시": "水道橋",
	"이다바시": "飯田橋",
	"이치가야": "市ヶ谷",
	"요츠야": "四ツ谷",
	"시나노마치": "信濃町",
	"센다가야": "千駄ヶ谷",
	"오쿠보": "大久保",
	"히가시나카노": "東中野",
	"나카노": "中野",
	"코엔지": "高円寺",
	"오기쿠보": "荻窪",
	"니시오기쿠보": "西荻窪",
	"이타바시": "板橋",
	"주조": "十条",
	"아카바네": "赤羽",
	"키타아카바네": "北赤羽",
	"우키마후나도": "浮間舟渡",
	"키타센주": "北千住",
	"미나미센주": "南千住",
	"미카와시마": "三河島",
	"오쿠": "尾久",
	"니시오이": "西大井",
	"히가시주조": "東十条",
	"오지": "王子",
	"카미나카자토": "上中里",
	"타카나와 게이트웨이": "高輪ゲートウェイ",
	"오이마치": "大井町",
	"오모리": "大森",
	"카마타": "蒲田",
	"오모테산도": "表参道",
	"아오야마잇초메": "青山一丁目",
	"나가타쵸": "永田町",
	"한조몬": "半蔵門",
	"쿠단시타": "九段下",
	"진보초": "神保町",
	"오테마치": "大手町",
	"미츠코시마에": "三越前",
	"스이텐구마에": "水天宮前",
	"키요스미시라카와": "清澄白河",
	"스미요시": "住吉",
	"오시아게": "押上",
	"미나미아사가야": "南阿佐ヶ谷",
	"신코엔지": "新高円寺",
	"히가시코엔지": "東高円寺",
	"신나카노": "新中野",
	"나카노사카우에": "中野坂上",
	"니시신주쿠": "西新宿",
	"신주쿠산초메": "新宿三丁目",
	"신주쿠교엔마에": "新宿御苑前",
	"요츠야산초메": "四谷三丁目",
	"아카사카미츠케": "赤坂見附",
	"콧카이기지도마에": "国会議事堂前",
	"카스미가세키": "霞ヶ関",
	"긴자": "銀座",
	"아와지초": "淡路町",
	"혼고산초메": "本郷三丁目",
	"코라쿠엔": "後楽園",
	"묘가다니": "茗荷谷",
	"신오츠카": "新大塚",
	"히로오": "広尾",
	"롯폰기": "六本木",
	"카미야쵸": "神谷町",
	"토라노몬힐즈": "虎ノ門ヒルズ",
	"히비야": "日比谷",
	"히가시긴자": "東銀座",
	"츠키지": "築地",
	"핫쵸보리": "八丁堀",
	"카야바쵸": "茅場町",
	"닌교초": "人形町",
	"코덴마쵸": "小伝馬町",
	"나카오카치마치": "仲御徒町",
	"이리야": "入谷",
	"미노와": "三ノ輪",
	"아야세": "綾瀬",
	"키타야세": "北綾瀬",
	"치카테츠나리마스": "地下鉄成増",
	"치카테츠아카츠카": "地下鉄赤塚",
	"헤이와다이": "平和台",
	"히카와다이": "氷川台",
	"코타케무카이하라": "小竹向原",
	"센카와": "千川",
	"조시가야": "雑司が谷",
	"니시와세다": "西早稲田",
	"히가시신주쿠": "東新宿",
	"키타산도": "北参道",
	"가이엔마에": "外苑前",
	"타메이케산노": "溜池山王",
	"쿄바시": "京橋",
	"니혼바시": "日本橋",
	"스에히로쵸": "末広町",
	"우에노히로코지": "上野広小路",
	"이나리초": "稲荷町",
	"타와라마치": "田原町",
	"아사쿠사": "浅草",
	"시로카네다이": "白金台",
	"시로카네타카나와": "白金高輪",
	"아자부주반": "麻布十番",
	"롯폰기잇초메": "六本木一丁目",
	"사쿠라다몬": "桜田門",
	"긴자잇초메": "銀座一丁目",
	"신토미초": "新富町",
	"츠키시마": "月島",
	"토요스": "豊洲",
	"타츠미": "辰巳",
	"신키바": "新木場",
	"오치아이": "落合",
	"타카다노바바": "高田馬場",
	"와세다": "早稲田",
	"카구라자카": "神楽坂",
	"타케바시": "竹橋",
	"몬젠나카쵸": "門前仲町",
	"키바": "木場",
	"토요쵸": "東陽町",
	"미나미스나미치": "南砂町",
	"니시카사이": "西葛西",
	"카사이": "葛西"
};

// 노선 클래스 매핑 추가
const lineClassMap = {
	'JR야마노테선': 'yamanote',
	'JR츄오소부선': 'chuuo',
	'JR사이쿄선': 'saikyou',
	'JR죠반선': 'joban',
	'JR타카사키선': 'takasaki',
	'JR요코스카선': 'yokosuka',
	'JR케이힌토쿠선': 'keitoku',
	'한조몬선': 'hanzomon',
	'마루노우치선': 'marunouchi',
	'히비야선': 'hibiya',
	'치요다선': 'chiyoda',
	'후쿠토신선': 'fukutoshin',
	'긴자선': 'ginza',
	'난보쿠선': 'namboku',
	'유라쿠쵸선': 'yurakucho',
	'토자이선': 'tozai'
};

// 노선 매핑 객체는 하나로 통일
const lineMapping = {
	'야마노테': 'JR山手線・JR야마노테선',
	'츄오- 소부': 'JR中央総武線',
	// ... 나머지 매핑
};

// stations 객체의 역 이름을 일본어(한글) 형식으로 변환
for (const line in stations) {
	if (stations.hasOwnProperty(line)) {
		stations[line] = stations[line].map(koreanName => {
			const japaneseName = stationToJapanese[koreanName];
			// DB 형식에 맞게 "일본어(한글)" 형식으로 변환
			return japaneseName ? `${japaneseName}(${koreanName})` : koreanName;
		});
	}
}

// 노선 이름 변환 함수
function convertLineName(lineName) {
	return lineName;
}

// 디바운스 함수 정의
function debounce(func, wait) {
	let timeout;
	return function executedFunction(...args) {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}

// 한글-일본어 지역명 매핑
const districtMappingKorToJp = {
    '아다치구': '足立区',
    '가쓰시카구': '葛飾区',
    '에도가와구': '江戸川区',
    '고토구': '江東区',
    '스미다구': '墨田区',
    '아라카와구': '荒川区',
    '다이토구': '台東区',
    '기타구': '北区',
    '분쿄구': '文京区',
    '도시마구': '豊島区',
    '이타바시구': '板橋区',
    '네리마구': '練馬区',
    '스기나미구': '杉並区',
    '나카노구': '中野区',
    '신주쿠구': '新宿区',
    '지요다구': '千代田区',
    '주오구': '中央区',
    '시부야구': '渋谷区',
    '세타가야구': '世田谷区',
    '미나토구': '港区',
    '메구로구': '目黒区',
    '시나가와구': '品川区',
    '오타구': '大田区'
};

// 일본어-한글 지역명 매핑 (역방향 매핑)
const districtMappingJpToKor = Object.fromEntries(
    Object.entries(districtMappingKorToJp).map(([k, v]) => [v, k])
);

// 지역명 변환 함수 (한글 -> 일본어)
function convertDistrictToJapanese(koreanDistrict) {
    return districtMappingKorToJp[koreanDistrict] || koreanDistrict;
}

// 지역명 변환 함수 (일본어 -> 한글)
function convertDistrictToKorean(japaneseDistrict) {
    return districtMappingJpToKor[japaneseDistrict] || japaneseDistrict;
}

// 현재 정렬 상태를 저장할 전역 변수
let currentSortType = 'newest'; // 기본값은 최신순

// 필터 데이터 수집 함수
function getCurrentFilterData() {
	const urlParams = new URLSearchParams(window.location.search);
	const district = urlParams.get('district');
	const line = urlParams.get('line');
	
	// 상세조건 체크박스 값을 정확하게 가져오기
	const detailTypes = Array.from(document.querySelectorAll('input[name="detail"]:checked'))
		.map(cb => cb.value);
	
	console.log('상세조건 필터:', detailTypes); // 디버깅용 로그
	
	return {
			minPrice: document.getElementById('minPrice')?.value || '',
			maxPrice: document.getElementById('maxPrice')?.value || '',
			buildingTypes: Array.from(document.querySelectorAll('input[name="type"]:checked')).map(cb => cb.value),
			roomTypes: Array.from(document.querySelectorAll('input[name="room"]:checked')).map(cb => cb.value),
			buildingYear: document.getElementById('building-year')?.value || '',
			detailTypes: detailTypes, // 상세조건 추가
			keyword: document.getElementById('searchInput')?.value || '',
			sortType: document.getElementById('sortSelect')?.value || 'newest',
			district: district,
			line: line,
			selectedLines: Array.from(filterState.selectedLines),
			selectedStations: Array.from(filterState.selectedStations)
	};
}

// 필터 적용 함수
function filterProperties() {
	const filterData = getCurrentFilterData();
	console.log('필터 데이터:', filterData); // 디버깅용 로그
	
	fetch('/api/properties/filter', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(filterData)
	})
	.then(response => {
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return response.json();
	})
	.then(data => {
		console.log('서버 응답 데이터:', data); // 디버깅용 로그
		updatePropertyList(data);
		
		// URL 업데이트 (페이지 새로고침 없이)
		const params = new URLSearchParams();
		if (filterData.district) params.set('district', filterData.district);
		if (filterData.line) params.set('line', filterData.line);
		const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
		window.history.pushState({}, '', newUrl);
	})
	.catch(error => {
		console.error('필터 적용 에러:', error);
	});
}

// 매물 목록 업데이트 함수
function updatePropertyList(properties) {
	const propertyListContainer = document.querySelector('.property-items-container');
	if (!propertyListContainer) return;

	propertyListContainer.innerHTML = '';

	if (!Array.isArray(properties) || properties.length === 0) {
		propertyListContainer.innerHTML = '<div class="no-results">검색 결과가 없습니다.</div>';
		return;
	}

	properties.forEach(property => {
		const propertyElement = createPropertyElement(property);
		propertyListContainer.appendChild(propertyElement);
	});
}

// 매물 요소 생성 함수
function createPropertyElement(property) {
	const div = document.createElement('div');
	div.className = 'property-item';
	
	// HTML 템플릿 생성
	div.innerHTML = `
		<div class="property-header">
			<div class="header-left">
				<input type="checkbox" value="${property.propertyId}">
				<span class="property-no">NO.${property.propertyId}</span>
				<span>${property.title}</span>
			</div>
		</div>
		<table class="property-info-table">
			<tr>
				<th>사진</th>
				<th>월세/관리비</th>
				<th>시키킹/레이킹</th>
				<th>방 타입/면적</th>
				<th>건축년도</th>
				<th>예약상태</th>
				<th>상세보기</th>
			</tr>
			<tr>
				<td>
					${property.thumbnailImage 
						? `<div class="property-image-container">
							 <img src="${property.thumbnailImage}" alt="매물 이미지" 
								  style="width: 150px; height: 100px; object-fit: cover;">
						   </div>`
						: `<div class="no-image-container"
							 style="width: 150px; height: 100px; background-color: #f5f5f5; display: flex; align-items: center; justify-content: center;">
							 <span>이미지 준비중</span>
						   </div>`
					}
				</td>
				<td>
					<div>${property.monthlyPrice?.toLocaleString()}円</div>
					<div>${property.managementFee?.toLocaleString()}円</div>
				</td>
				<td>
					<div>${property.shikikin?.toLocaleString()} / ${property.reikin?.toLocaleString()}</div>
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
			${property.station ? `<div>${property.station}</div>` : ''}
			${property.description ? `<div>${property.description}</div>` : ''}
		</div>
	`;
	
	return div;
}

// 이벤트 리스너 설정
function setupFilterEventListeners() {
	// 가격 슬라이더 이벤트
	const priceInputs = document.querySelectorAll('#minPrice, #maxPrice');
	priceInputs.forEach(input => {
		input.addEventListener('change', filterProperties);
	});

	// 건물 유형 체크박스 이벤트
	const buildingTypeCheckboxes = document.querySelectorAll('input[name="type"]');
	buildingTypeCheckboxes.forEach(checkbox => {
		checkbox.addEventListener('change', filterProperties);
	});

	// 방 유형 체크박스 이벤트
	const roomTypeCheckboxes = document.querySelectorAll('input[name="room"]');
	roomTypeCheckboxes.forEach(checkbox => {
		checkbox.addEventListener('change', filterProperties);
	});

	// 건축년도 선택 이벤트
	const buildingYearSelect = document.getElementById('building-year');
	if (buildingYearSelect) {
		buildingYearSelect.addEventListener('change', filterProperties);
	}

	// 상세조건 체크박스 이벤트 리스너 수정
	const detailCheckboxes = document.querySelectorAll('input[name="detail"]');
	detailCheckboxes.forEach(checkbox => {
		checkbox.addEventListener('change', function(e) {
			console.log('상세조건 체크박스 변경:', this.value, this.checked);
			const filterData = getCurrentFilterData();
			console.log('전송되는 필터 데이터:', filterData);
			filterProperties();
		});
	});

	// 검색어 입력 이벤트
	const searchInput = document.getElementById('searchInput');
	if (searchInput) {
		searchInput.addEventListener('input', debounce(filterProperties, 500));
	}

	// 정렬 옵션 변경 이벤트
	const sortSelect = document.getElementById('sortSelect');
	if (sortSelect) {
		sortSelect.addEventListener('change', filterProperties);
	}
}

// 페이지 로드 시 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', () => {
	// 초기 데이터 로드
	filterProperties();
	
	// 필터 이벤트 리스너 설정
	setupFilterEventListeners();
	
	// 노선 팝업 초기화 추가
	setupLinePopup();
	
	// 가격 슬라이더 초기화
	initializePriceSliders();
}, { once: true });

// 역 선택 시 필터 적용
function applyStationFilter(selectedLine, selectedStation) {
	console.log('노선 선택:', selectedLine);
	console.log('역 선택:', selectedStation);
	
	filterState.selectedLine = selectedLine;
	filterState.selectedStation = selectedStation ? selectedStation : '';
	
	// 필터 적용 전에 상태 확인
	console.log('필터 상태:', filterState);
	
	filterProperties();
	closeLinePopup();
}

// 페이지 로드 시 한 번만 실행
document.addEventListener('DOMContentLoaded', () => {
	initializePriceSliders();
	setupFilterEventListeners();
	// 초기 필터 적용
	filterProperties();
}, { once: true });

// 가격 슬라이더 초기화 함수
function initializePriceSliders() {
	const minPriceInput = document.getElementById('minPrice');
	const maxPriceInput = document.getElementById('maxPrice');
	const priceLabel = document.getElementById('priceLabel');

	if (!minPriceInput || !maxPriceInput || !priceLabel) return;

	// 초기 값 설정
	minPriceInput.value = 50000;
	maxPriceInput.value = 150000;

	// 초기 라벨 업데이트
	updatePriceLabel();

	// 최소값이 최대값을 넘지 않도록 제한
	minPriceInput.addEventListener('input', () => {
		const minVal = parseInt(minPriceInput.value);
		const maxVal = parseInt(maxPriceInput.value);
		if (minVal > maxVal) {
			minPriceInput.value = maxVal;
		}
		updatePriceLabel();
	});

	// 최대값이 최소값보다 작아지지 않도록 제한
	maxPriceInput.addEventListener('input', () => {
		const minVal = parseInt(minPriceInput.value);
		const maxVal = parseInt(maxPriceInput.value);
		if (maxVal < minVal) {
			maxPriceInput.value = minVal;
		}
		updatePriceLabel();
	});
}

// 가격 라벨 업데이트 함수
function updatePriceLabel() {
	const minPriceInput = document.getElementById('minPrice');
	const maxPriceInput = document.getElementById('maxPrice');
	const priceLabel = document.getElementById('priceLabel');

	if (!minPriceInput || !maxPriceInput || !priceLabel) return;

	const minPrice = parseInt(minPriceInput.value).toLocaleString();
	const maxPrice = parseInt(maxPriceInput.value).toLocaleString();
	priceLabel.textContent = `${minPrice}円 ~ ${maxPrice}円`;
}

// 팝업 열기/닫기 함수 추가
function openLinePopup() {
	const linePopup = document.getElementById("linePopup");
	if (linePopup) {
		linePopup.style.display = "block";
		document.body.style.overflow = "hidden";
	}
}

function closeLinePopup() {
	const linePopup = document.getElementById("linePopup");
	if (linePopup) {
		linePopup.style.display = "none";
		document.body.style.overflow = "auto";
	}
}

// setupLinePopup 함수 수정
function setupLinePopup() {
	if (filterState.isLinePopupInitialized) return;
	
	// 노선 클릭 이벤트
	document.querySelectorAll(".line").forEach(line => {
		line.addEventListener("click", function(e) {
			e.preventDefault();
			e.stopPropagation();
			const lineName = this.textContent.trim();
			
			// 노선 토글 (선택/해제)
			if (this.classList.contains('selected')) {
				this.classList.remove('selected');
				filterState.selectedLines.delete(lineName);
			} else {
				this.classList.add('selected');
				filterState.selectedLines.add(lineName);
			}
			
			// 역 목록 업데이트
			updateStationList(lineName);
			
			// 필터 메시지 업데이트
			updateFilterMessage();
		});
	});
	
	// 확인 버튼 이벤트
	const confirmButton = document.createElement('button');
	confirmButton.className = 'confirm-button';
	confirmButton.textContent = '선택 완료';
	confirmButton.addEventListener('click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		filterProperties();  // 필터 적용
		closeLinePopup();   // 팝업 닫기
	});
	
	const popupContent = document.querySelector('.popup-content');
	if (!document.querySelector('.confirm-button')) {
		popupContent.appendChild(confirmButton);
	}
	
	filterState.isLinePopupInitialized = true;
}

// updateStationList 함수 수정
function updateStationList(lineName) {
	console.log('Updating station list for:', lineName);
	const lineStations = stations[lineName] || [];
	const stationListHTML = generateStationListHTML(lineName, lineStations);
	const stationListElement = document.getElementById('stationList');

	if (stationListElement) {
		// 기존 역 목록에 새로운 역 목록 추가
		if (!stationListElement.querySelector(`[data-line="${lineName}"]`)) {
			const lineSection = document.createElement('div');
			lineSection.setAttribute('data-line', lineName);
			lineSection.innerHTML = stationListHTML;
			stationListElement.appendChild(lineSection);
		}
		
		// 역 버튼 클릭 이벤트 설정
		stationListElement.querySelectorAll('.station').forEach(button => {
			button.addEventListener('click', function(e) {
				e.preventDefault(); // 기본 이벤트 방지
				const koreanName = this.getAttribute('data-korean');
				const stationLineName = this.closest('[data-line]').getAttribute('data-line');
				console.log('Station clicked:', koreanName, 'on line:', stationLineName);
				
				if (this.classList.contains('selected')) {
					this.classList.remove('selected');
					filterState.selectedStations.delete(koreanName);
				} else {
					this.classList.add('selected');
					filterState.selectedStations.add(koreanName);
				}
				
				// 필터 메시지 업데이트
				updateFilterMessage();
			});
		});
	}
}

// 역 목록 HTML 생성
function generateStationListHTML(lineName, stations) {
	const lineClass = lineClassMap[lineName] || 'default-line';
	return `
			<div class="line-section">
					<h3>${lineName}</h3>
					<div class="station-container">
							${stations.map(station => {
									const match = station.match(/^(.*?)\((.*?)\)$/);
									const displayName = match ? match[0] : station;
									const koreanName = match ? match[2] : station;
									const isSelected = filterState.selectedStations.has(koreanName);
									return `<button class="station ${lineClass} ${isSelected ? 'selected' : ''}" 
													data-korean="${koreanName}">${displayName}</button>`;
							}).join('')}
					</div>
			</div>
	`;
}

// 필터 메시지 업데이트
function updateFilterMessage() {
	const container = document.querySelector('.filter-message');
	if (!container) return;

	let messages = [];
	
	if (filterState.selectedLines.size > 0) {
			messages.push(`선택된 노선: ${Array.from(filterState.selectedLines).join(', ')}`);
	}
	
	if (filterState.selectedStations.size > 0) {
			messages.push(`선택된 역: ${Array.from(filterState.selectedStations).join(', ')}`);
	}

	container.innerHTML = messages.length > 0 ? messages.join('<br>') : '';
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
	setupLinePopup();
	filterProperties();
});

// 전체 매물 보기 버튼 클릭 이벤트 처리
document.addEventListener('DOMContentLoaded', function() {
    const allPropertiesBtn = document.querySelector('.all-build');
    if (allPropertiesBtn) {
        allPropertiesBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 모든 필터 초기화
            resetFilters();
            
            // 필터링 없이 전체 매물 조회
            const filterData = {
                minPrice: 50000,
                maxPrice: 150000,
                buildingTypes: [],
                roomTypes: [],
                buildingYear: '',
                detailTypes: [],
                keyword: '',
                subwayLine: '',
                station: ''
            };
            
            filterProperties(filterData);
        });
    }
});

// 필터 초기화 함수
function resetFilters() {
    // 기존 초기화 로직
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    if (minPriceInput) minPriceInput.value = 50000;
    if (maxPriceInput) maxPriceInput.value = 150000;
    updatePriceLabel();

    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });

    const buildingYear = document.getElementById('building-year');
    if (buildingYear) buildingYear.value = '';

    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';

    // 노선, 역 정보도 초기화
    filterState.selectedLine = '';
    filterState.selectedStation = '';

    // URL 파라미터 제거
    window.history.pushState({}, '', '/property/list');
    
    // 필터 적용
    filterProperties();
}

// index.html의 노선 버튼 클릭 이벤트
document.addEventListener('DOMContentLoaded', function() {
    const lineButtons = document.querySelectorAll('.line');
    lineButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const lineName = this.textContent.trim();
            const convertedLine = lineMapping[lineName] || lineName;
            window.location.href = `/property/list?line=${encodeURIComponent(convertedLine)}`;
        });
    });
});

// 검색 입력 이벤트 처리
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            const keyword = this.value.trim();
            const filterData = getCurrentFilterData();
            filterData.keyword = keyword;
            filterProperties(filterData);
        }, 500));
    }
});

// 노선 변경 버튼 클릭 이벤트 처리
document.addEventListener('DOMContentLoaded', function() {
    const lineChangeBtn = document.querySelector('.line-btn');
    if (lineChangeBtn) {
        lineChangeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openLinePopup();
        });
    }
});

// 팝업 내부 클릭 이벤트가 외부로 전파되지 않도록 처리
document.querySelector('.popup-content')?.addEventListener('click', function(e) {
    e.stopPropagation();
});

// 팝업 바깥 영역 클릭 시 닫히지 않도록 처리
document.getElementById('linePopup')?.addEventListener('click', function(e) {
    if (e.target === this) {
        e.stopPropagation();
        e.preventDefault();
    }
});
