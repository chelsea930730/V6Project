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

document.addEventListener('DOMContentLoaded', function() {
    // Bootstrap 모달 초기화
    const reservationModal = new bootstrap.Modal(document.getElementById('reservationModal'));

    // 이미지 캐러셀 초기화
    const propertyImageCarousel = new bootstrap.Carousel(document.getElementById('propertyImageCarousel'), {
        interval: 5000, // 5초마다 슬라이드 변경
        wrap: true // 마지막 슬라이드에서 첫 슬라이드로 순환
    });
    
    // 타입별 이미지 캐러셀 초기화
    const floorplanCarousel = document.getElementById('floorplanImageCarousel');
    if (floorplanCarousel) {
        new bootstrap.Carousel(floorplanCarousel, {
            interval: false // 자동 슬라이드 비활성화
        });
    }

    const buildingCarousel = document.getElementById('buildingImageCarousel');
    if (buildingCarousel) {
        new bootstrap.Carousel(buildingCarousel, {
            interval: false
        });
    }

    const interiorCarousel = document.getElementById('interiorImageCarousel');
    if (interiorCarousel) {
        new bootstrap.Carousel(interiorCarousel, {
            interval: false
        });
    }

    // 탭 클릭 이벤트에 따른 캐러셀 설정
    const imageTabs = document.querySelectorAll('[data-bs-toggle="tab"]');
    imageTabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', function (event) {
            // 활성화된 탭의 캐러셀 재설정
            const targetId = event.target.getAttribute('data-bs-target');
            const carousel = document.querySelector(targetId + ' .carousel');
            if (carousel) {
                const bsCarousel = bootstrap.Carousel.getInstance(carousel);
                if (bsCarousel) {
                    bsCarousel.pause();
                }
            }
        });
    });

    // 예약 버튼 클릭 이벤트
    const reservationBtn = document.getElementById('reservationBtn');
    if (reservationBtn) {
        reservationBtn.addEventListener('click', function() {
            reservationModal.show();
        });
    }

    // 찜하기 버튼 클릭 이벤트
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            const propertyId = this.dataset.propertyId;
            addToCart(propertyId);
        });
    }
    
    // 예약 폼 제출 이벤트
    const submitReservationBtn = document.getElementById('submitReservation');
    if (submitReservationBtn) {
        submitReservationBtn.addEventListener('click', function() {
            const propertyId = document.getElementById('reservationBtn').dataset.propertyId;
            const date = document.getElementById('reservationDate').value;
            const time = document.getElementById('reservationTime').value;
            const note = document.getElementById('reservationNote').value;

            if (!date || !time) {
                alert('날짜와 시간을 선택해주세요.');
                return;
            }

            submitReservation(propertyId, date, time, note);
        });
    }
    
    // 매물 찜하기 함수
    function addToCart(propertyId) {
        fetch(`/cart/add/${propertyId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            if (response.status === 401) {
                // 로그인이 필요한 경우
                window.location.href = '/user/login';
                throw new Error('로그인이 필요합니다.');
            }
            throw new Error('매물 찜하기에 실패했습니다.');
        })
        .then(data => {
            if (data.success) {
                alert('매물이 찜 목록에 추가되었습니다.');
                // 버튼 스타일 변경 (선택사항)
                addToCartBtn.classList.add('added');
                addToCartBtn.innerHTML = '<i class="fas fa-heart"></i> 찜완료';
            } else {
                alert(data.message || '매물 찜하기에 실패했습니다.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            if (error.message !== '로그인이 필요합니다.') {
                alert(error.message);
            }
        });
    }

    // 매물 예약 함수
    function submitReservation(propertyId, date, time, note) {
        const reservationData = {
            propertyId: propertyId,
            reservationDate: date,
            reservationTime: time,
            note: note
        };

        fetch('/reservation/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reservationData)
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            if (response.status === 401) {
                // 로그인이 필요한 경우
                window.location.href = '/user/login';
                throw new Error('로그인이 필요합니다.');
            }
            throw new Error('예약 신청에 실패했습니다.');
        })
        .then(data => {
            if (data.success) {
                alert('예약이 신청되었습니다. 담당자 확인 후 연락드리겠습니다.');
                reservationModal.hide();
                // 폼 초기화
                document.getElementById('reservationForm').reset();
            } else {
                alert(data.message || '예약 신청에 실패했습니다.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            if (error.message !== '로그인이 필요합니다.') {
                alert(error.message);
            }
        });
    }
});
