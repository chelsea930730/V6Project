const stationData = {
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

document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('station-modal');
    const openBtn = document.getElementById('station-select-btn');
    const closeBtn = document.querySelector('.close-btn');
    const backBtn = document.querySelector('.back-btn');
    const step1 = document.querySelector('.step-1');
    const step2 = document.querySelector('.step-2');
    const lineList = document.querySelector('.line-list');
    const stationList = document.querySelector('.station-list');
    const selectedLine = document.getElementById('selected-line');
    const selectedStation = document.getElementById('selected-station');

    // 노선 목록 생성
    function createLineButtons() {
        lineList.innerHTML = '';
        Object.keys(stationData).forEach(line => {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = line;
            button.onclick = () => selectLine(line);
            lineList.appendChild(button);
        });
    }

    // 역 목록 생성
    function createStationButtons(line) {
        stationList.innerHTML = '';
        stationData[line].forEach(station => {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = station;
            button.onclick = () => selectStation(line, station);
            stationList.appendChild(button);
        });
    }

    // 노선 선택
    function selectLine(line) {
        createStationButtons(line);
        step1.style.display = 'none';
        step2.style.display = 'block';
    }

    // 역 선택
    function selectStation(line, station) {
        selectedLine.value = line;
        selectedStation.value = station;
        modal.style.display = 'none';
        step1.style.display = 'block';
        step2.style.display = 'none';
    }

    // 모달 열기
    openBtn.onclick = function() {
        modal.style.display = 'block';
        createLineButtons();
    }

    // 모달 닫기
    closeBtn.onclick = function() {
        modal.style.display = 'none';
        step1.style.display = 'block';
        step2.style.display = 'none';
    }

    // 뒤로 가기
    backBtn.onclick = function() {
        step2.style.display = 'none';
        step1.style.display = 'block';
    }

    // 모달 외부 클릭 시 닫기
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
            step1.style.display = 'block';
            step2.style.display = 'none';
        }
    }
}); 