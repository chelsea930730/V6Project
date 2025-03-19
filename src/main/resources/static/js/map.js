// 노선 버튼 클릭 이벤트
document.querySelectorAll(".line").forEach(button => {
    button.addEventListener("click", () => {
        window.location.href = "/templates/property/list,html";
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