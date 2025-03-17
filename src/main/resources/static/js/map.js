// 노선 버튼 클릭 이벤트
document.querySelectorAll(".line").forEach(button => {
    button.addEventListener("click", () => {
        window.location.href = "/templates/property/list,html";
    });
});

// 역 링크 생성 함수
function createStationLinks() {
    // 각 노선별 역 정보
    const stations = {
        '야마노테': ["신주쿠", "이케부쿠로", "도쿄", "우에노", "시부야"],
        '츄오- 소부': ["코이와", "신코이와", "히라이", "카메이도", "킨시쵸"],
        // 다른 노선들의 역 정보도 추가...
    };

    // 노선 클릭 시 해당 노선의 역 목록 표시
    document.querySelectorAll('.line').forEach(lineLink => {
        lineLink.addEventListener('click', function(e) {
            // 링크의 기본 동작 막기
            e.preventDefault();
            
            const lineName = this.textContent.trim();
            const stationList = stations[lineName] || [];
            
            // 역 목록 컨테이너
            const stationContainer = document.createElement('div');
            stationContainer.className = 'station-list-popup';
            stationContainer.innerHTML = `<h3>${lineName} 노선 역</h3>`;
            
            // 역 목록 생성
            stationList.forEach(station => {
                const stationLink = document.createElement('a');
                stationLink.href = `/property/list?station=${station}`;
                stationLink.className = 'station-link';
                stationLink.textContent = station;
                stationContainer.appendChild(stationLink);
            });
            
            // 전체 노선 보기 링크
            const allStationsLink = document.createElement('a');
            allStationsLink.href = `/property/list?line=${lineName}`;
            allStationsLink.className = 'all-stations-link';
            allStationsLink.textContent = `${lineName} 전체 역 보기`;
            stationContainer.appendChild(allStationsLink);
            
            // 팝업 닫기 버튼
            const closeButton = document.createElement('button');
            closeButton.className = 'close-popup-btn';
            closeButton.textContent = '닫기';
            closeButton.addEventListener('click', () => {
                document.body.removeChild(stationContainer);
            });
            stationContainer.appendChild(closeButton);
            
            // 페이지에 팝업 추가
            document.body.appendChild(stationContainer);
        });
    });
}

// 페이지 로드 시 함수 실행
document.addEventListener('DOMContentLoaded', () => {
    createStationLinks();
    // 기존 코드...
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






