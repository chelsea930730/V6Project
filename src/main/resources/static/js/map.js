// 노선명 매핑 객체 (한 번만 정의)
const lineMapping = {
    '야마노테': 'JR山手線・JR야마노테선',
    '츄오- 소부': 'JR中央総武線',
    '사이쿄': 'JR埼京線',
    '죠반': 'JR常磐線・JR죠반선',
    '타카사키': 'JR高崎線・JR타카사키선',
    '요코스카': 'JR横須賀・JR요코스카선',
    '게이힌토호쿠': 'JR京浜東北線・JR게이힌토호쿠선',
    '한조몬': '半蔵門線・한조몬선',
    '마루노우치': '丸ノ内線・마루노우치선',
    '히비야': '日比谷線・히비야선',
    '치요다': '千代田線・치요다선',
    '후쿠토신': '副都心線・후쿠토신선',
    '긴자': '銀座線・긴자선',
    '난보쿠': '南北線・난보쿠선',
    '유라쿠쵸': '有楽町線・유라쿠쵸선',
    '토자이': '東西線・토자이선'
};

// 노선 버튼 클릭 이벤트
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll(".line").forEach(button => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            const line = button.textContent.trim();
            const convertedLine = lineMapping[line] || line;
            window.location.href = `/property/list?line=${encodeURIComponent(convertedLine)}`;
        });
    });
});

// 노선명 변환 함수 (기존 매핑 객체 재사용)
function convertLineName(line) {
    return lineMapping[line] || line;
}

// 지역 이름 매핑 객체 추가
const districtMapping = {
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

// 지역 버튼 클릭 이벤트 처리
document.addEventListener('DOMContentLoaded', function() {
    const districtButtons = document.querySelectorAll('.district-button');
    
    districtButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const japaneseDistrict = this.getAttribute('href').split('district=')[1];
            const decodedJapaneseDistrict = decodeURIComponent(japaneseDistrict);
            window.location.href = `/property/list?district=${encodeURIComponent(decodedJapaneseDistrict)}`;
        });
    });
});

function resizeMap() {
    let img = document.getElementById("mapImage");

    if (!img.complete) {
        img.onload = resizeMap;
        return;
    }

    // 원본 대비 렌더링 크기의 비율 계산
    let scaleFactorX = 579.21 / 953;  // 가로 비율
    let scaleFactorY = 505.24 / 963;  // 세로 비율

    let areas = document.querySelectorAll("area");
    areas.forEach(area => {
        if (area.dataset.originalCoords) {
            let originalCoords = area.dataset.originalCoords.split(",").map(Number);
            let scaledCoords = originalCoords.map((coord, index) => {
                // 짝수 인덱스는 X좌표, 홀수 인덱스는 Y좌표
                return Math.round(coord * (index % 2 === 0 ? scaleFactorX : scaleFactorY));
            });
            area.coords = scaledCoords.join(",");
        }
    });
}

// 페이지 로드 및 리사이즈시 지도 크기 유지
window.addEventListener('DOMContentLoaded', function() {
    resizeMap();

    // 이미지 크기를 정확히 지정
    fixMapImageSize();
});

window.addEventListener('resize', function() {
    resizeMap();

    // 윈도우 크기가 변경되어도 이미지 크기는 고정
    fixMapImageSize();
});

// 이미지 크기를 정확히 고정하는 함수
function fixMapImageSize() {
    const mapImage = document.getElementById('mapImage');
    if (mapImage) {
        // 정확한 픽셀 크기 설정 (로그인 전 크기로 고정)
        mapImage.style.width = '810px';
        mapImage.style.height = '728px';

        // 상대적인 % 설정 제거하고 픽셀 단위로 고정
        mapImage.style.maxWidth = 'none';

        // 지도 컨테이너도 적절히 조정
        const mapContainer = document.getElementById('mapContainer');
        if (mapContainer) {
            // 이미지가 컨테이너에 맞게 조정
            mapContainer.style.width = 'auto';
            mapContainer.style.minWidth = '810px';
            mapContainer.style.display = 'flex';
            mapContainer.style.justifyContent = 'center';
        }

        // 구역 버튼들의 위치 재조정
        adjustDistrictButtonPositions();
    }
}

// 구역 버튼 위치 재조정 함수
function adjustDistrictButtonPositions() {
    // 이미지 크기가 고정되었으므로 버튼 위치도 그에 맞게 조정
    const buttons = document.querySelectorAll('.district-button');
    if (buttons.length > 0) {
        // 각 버튼의 위치를 재계산 (필요한 경우)
        // 여기선 각 버튼의 위치를 원래대로 유지
        buttons.forEach(button => {
            // 버튼이 지도 이미지 위에 올바르게 위치하도록 z-index 설정
            button.style.zIndex = '10';
        });
    }
}

// 로그인 상태에 따른 레이아웃 조정 함수는 제거하거나 변경
function adjustLayoutForLoginState(isLoggedIn) {
    // 더 이상 부분적인 스타일 조정 대신 fixMapImageSize()가 모든 케이스를 처리
    fixMapImageSize();
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