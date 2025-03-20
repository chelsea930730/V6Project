// HTML에서 매물 정보 가져오기
function getPropertyFromHTML() {
	const propertyElement = document.getElementById("propertyData");

	if (!propertyElement) {
			console.error("매물 데이터를 찾을 수 없습니다.");
			return null;
	}

	return {
			id: propertyElement.dataset.id,
			title: propertyElement.dataset.title,
			rent: propertyElement.dataset.rent ? `¥${parseInt(propertyElement.dataset.rent).toLocaleString()}` : "가격 미정",
			type: propertyElement.dataset.type || "건물 유형 없음",
			room: propertyElement.dataset.room || "방 유형 없음",
			year: propertyElement.dataset.year ? `${propertyElement.dataset.year}년` : "건축년도 미정",
			details: propertyElement.dataset.details ? propertyElement.dataset.details.split(",") : ["편의시설 정보 없음"]
	};
}

// 화면에 데이터 업데이트
function updatePropertyDetails() {
	const property = getPropertyFromHTML();
	if (!property) return;

	document.getElementById("propertyTitle").textContent = property.title;
	document.getElementById("propertyPrice").textContent = property.rent;
	document.getElementById("buildingType").textContent = property.type;
	document.getElementById("roomType").textContent = property.room;
	document.getElementById("buildYear").textContent = property.year;

	// 편의시설 리스트 업데이트
	const amenitiesList = document.getElementById("amenitiesList");
	amenitiesList.innerHTML = property.details.map(detail => `<li>${detail}</li>`).join('');
}

// 페이지 로드 시 실행
window.addEventListener("DOMContentLoaded", updatePropertyDetails);
