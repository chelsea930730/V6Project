document.addEventListener('DOMContentLoaded', function() {
	// 건축년도 옵션 생성
	const buildingAgeSelect = document.getElementById('building-age');
	const currentYear = new Date().getFullYear();
	
	for (let year = currentYear; year >= 1970; year--) {
			const option = document.createElement('option');
			option.value = year;
			option.textContent = year + '년';
			buildingAgeSelect.appendChild(option);
	}

	// 체크박스 단일 선택 처리
	const checkboxGroups = document.querySelectorAll('.checkbox-area');
	
	checkboxGroups.forEach(group => {
			const checkboxes = group.querySelectorAll('input[type="checkbox"]');
			
			checkboxes.forEach(checkbox => {
					checkbox.addEventListener('change', function() {
							if (this.checked) {
									checkboxes.forEach(cb => {
											if (cb !== this) cb.checked = false;
									});
							}
					});
			});
	});

	// URL에서 매물 ID 가져오기
	const urlParams = new URLSearchParams(window.location.search);
	const propertyId = urlParams.get('id');

	// 폼 요소 가져오기
	const form = document.querySelector('.create-form');

	// 매물 ID가 있으면 기존 데이터 불러오기
	if (propertyId) {
			loadPropertyData(propertyId);
	}

	// 폼 제출 이벤트
	form.addEventListener('submit', function(e) {
			e.preventDefault();
			
			// 폼 데이터 수집
			const formData = {
					monthly: form.querySelector('[name="monthly"]').value,
					maintenance: form.querySelector('[name="maintenance"]').value,
					buildingType: getCheckedValue('building-type'),
					roomType: getCheckedValue('room-type'),
					features: getCheckedValues('features'),
					title: form.querySelector('[name="title"]').value,
					status: form.querySelector('[name="status"]').value,
					propertyName: form.querySelector('[name="property-name"]').value,
			};

			// 부모 창에 메시지 전송
			window.parent.postMessage({
					type: 'propertySubmitted',
					data: formData
			}, '*');
	});

	// 체크된 값 가져오기 (단일 선택)
	function getCheckedValue(name) {
			const checked = document.querySelector(`input[name="${name}"]:checked`);
			return checked ? checked.value : '';
	}

	// 체크된 값들 가져오기 (다중 선택)
	function getCheckedValues(name) {
			const checked = document.querySelectorAll(`input[name="${name}"]:checked`);
			return Array.from(checked).map(input => input.value);
	}

	// 매물 데이터 불러오기 함수
	function loadPropertyData(propertyId) {
			// 실제로는 서버에서 데이터를 가져와야 하지만,
			// 여기서는 예시 데이터로 폼을 채웁니다.
			const exampleData = {
					monthly: '45',
					maintenance: '5',
					buildingType: '아파트',
					roomType: '1R',
					features: ['주차장', '즉시 입주'],
					title: '세이부 이케부쿠로선 네리마 역, 4층, 건축 7년',
					status: '공실',
					propertyName: '사쿠라다이 맨션 401호'
			};

			// 폼 필드 채우기
			form.querySelector('[name="monthly"]').value = exampleData.monthly;
			form.querySelector('[name="maintenance"]').value = exampleData.maintenance;
			form.querySelector('[name="title"]').value = exampleData.title;
			form.querySelector('[name="status"]').value = exampleData.status;
			form.querySelector('[name="property-name"]').value = exampleData.propertyName;

			// 체크박스 설정
			document.querySelector(`input[name="building-type"][value="${exampleData.buildingType}"]`).checked = true;
			document.querySelector(`input[name="room-type"][value="${exampleData.roomType}"]`).checked = true;
			exampleData.features.forEach(feature => {
					document.querySelector(`input[name="features"][value="${feature}"]`).checked = true;
			});
	}
}); 