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






