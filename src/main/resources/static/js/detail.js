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
//장바구니 추가

function addToCart() {
	// 서버에 인증 상태를 확인하는 요청
	fetch('/api/auth/check')
			.then(response => response.json())
			.then(data => {
					if (data.authenticated) {
							// 인증된 경우 장바구니에 추가
							const propertyId = [[${property.propertyId}]];
							// ... 기존 장바구니 추가 코드 ...
					} else {
							// 인증되지 않은 경우 로그인 페이지로 리다이렉트
							alert('로그인이 필요한 서비스입니다.');
							window.location.href = '/user/login';
					}
			});
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

// 상담 예약 페이지로 이동 함수
function goToReservation() {
    // 현재 매물 ID 가져오기
    const propertyId = document.getElementById('propertyIdValue').value; // hidden 필드에서 값 가져오기

    // 세션 스토리지에서 기존 예약 목록 가져오기
    let selectedProperties = JSON.parse(sessionStorage.getItem('selectedProperties') || '[]');
    
    // 이미 선택된 매물인지 확인
    if (!selectedProperties.includes(propertyId)) {
        selectedProperties.push(propertyId);
    }
    
    // 세션 스토리지에 저장
    sessionStorage.setItem('selectedProperties', JSON.stringify(selectedProperties));
    
    // 상담 예약 페이지로 이동
    location.href = '/reservation?propertyIds=' + selectedProperties.join(',');
}
