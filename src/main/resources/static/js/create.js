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

	// 체크박스 단일 선택 처리 (상세조건 제외)
	const buildingTypeArea = document.querySelector('.checkbox-area:nth-child(3)');
	const roomTypeArea = document.querySelector('.checkbox-area:nth-child(4)');

	[buildingTypeArea, roomTypeArea].forEach(area => {
			if (area) {
					const checkboxes = area.querySelectorAll('input[type="checkbox"]');

					checkboxes.forEach(checkbox => {
							checkbox.addEventListener('change', function() {
									if (this.checked) {
											checkboxes.forEach(cb => {
													if (cb !== this) cb.checked = false;
											});
									}
							});
					});
			}
	});

	// 노선 및 역 데이터
	const lineStations = {
			'야마노테선': ['도쿄', '유라쿠초', '신바시', '하마마츠초', '다마치', '시나가와', '오사키', '고탄다', '메구로', '에비스', '시부야', '하라주쿠', '요요기', '신주쿠', '신오쿠보', '다카다노바바', '메지로', '이케부쿠로', '오츠카', '스가모', '고마고메', '다비타', '니시닛포리', '우구이스다니', '우에노', '오치마치', '아키하바라', '간다'],
			'마루노우치선': ['오기쿠보', '신나카노', '나카노사카에', '니시신주쿠', '신주쿠', '신주쿠-산초메', '요츠야', '요츠야-산초메', '신오차노미즈', '오차노미즈', '동경', '긴자', '도쿄', '니혼바시', '미츠코시마에', '간다', '스이도바시', '호난초', '코라쿠엔', '메지로', '이다바시', '신오차노미즈', '요츠야-산초메', '신주쿠-교엔마에', '니시신주쿠'],
			'히비야선': ['나카-메구로', '에비스', '히로오', '롯폰기', '가미야초', '히비야', '긴자', '츠키지', '하치오바리', '나카노-오치마치', '우에노', '이리야', '우구이스다니', '미노와바시', '남센다이', '북센다이'],
			'토자이선': ['니시카사이', '카사이', '우라야스', '미나미-스나마치', '토요초', '미나미-스나마치', '키바', '몬젠-나카초', '카지마치', '오테마치', '니혼바시', '카야바초', '니혼바시', '히가시-니혼바시', '오테마치', '다케바시', '나가타초', '사쿠라다몬', '가미야초', '쓰키시마', '신키바', '토요스', '기요시마', '가사이-린카이코엔'],
			'티요다선': ['요요기-우에하라', '요요기-코엔', '메이지-진구마에', '오모테산도', '아카사카', '나가타초', '히비야', '오테마치', '신오차노미즈', '요츠야', '이다바시', '가쿠슈인-다이가쿠마에', '미요시', '신카이치', '키타-아야세', '아야세'],
			'유라쿠초선': ['신키바', '토요초', '테츠도-하쿠부츠칸', '에도바시', '히가시-긴자', '긴자-입구', '유라쿠초', '신바시', '사쿠라다몬', '우시고메-야나기초', '이다바시', '고쿠류', '와코', '치카테츠-나리마스', '치카테츠-아카츠카'],
			'난보쿠선': ['메구로', '시로카네다이', '시로카네-타카나와', '아자부주반', '롯폰기 입구', '아카사카미츠케', '나가타초', '토라노몬', '토라노몬힐즈', '카미야초', '오나리몬', '미타', '스이도바시', '후나보리', '코라쿠엔', '토다이마에', '혼고-산초메', '네즈', '센다기'],
			'후쿠토신선': ['시부야', '메이지-진구마에', '기타산도', '신주쿠-산초메', '히가시-신주쿠', '키타-시나가와', '신주쿠', '체이탄지', '요츠야-케이사츠쇼마에', '이카노하타', '와세다', '히가시-신주쿠', '신주쿠-산초메'],
			'긴자선': ['시부야', '오모테산도', '가이엔마에', '아카사카미츠케', '토라노몬', '신바시', '긴자', '교바시', '니혼바시', '미츠코시마에', '수이텐구마에', '간다', '아사쿠사', '다무라마치', '아사쿠사바시', '우에노', '이나리초', '다와라마치', '아사쿠사'],
			'한조몬선': ['시부야', '오모테산도', '아오야마-입구', '아카사카미츠케', '나가타초', '히비야', '오테마치', '진보초', '미츠코시마에', '스미요시', '기요지마', '오지마', '히가시-오지마', '나카노-오차노미즈'],
			'아사쿠사선': ['니시-마고메', '마고메', '오지', '미야노마에', '아사쿠사', '도쿄-스카이트리', '혼조-아즈마바시', '쿠라마에', '아사쿠사', '타와라마치', '아사쿠사바시', '니혼바시', '히가시-니혼바시', '닌교초'],
			'미타선': ['메구로', '메구로', '시로카네다이', '시로카네-타카나와', '미타', '스이도바시', '후나보리', '이와모토초', '아크사카', '오치마치', '스이도바시', '진보초', '오치아이', '시키다', '시모-이타바시', '하스네'],
			'신주쿠선': ['신주쿠', '신주쿠-산초메', '아케보노바시', '이치가야', '이다바시', '오진보', '아카바네바시', '이와모토초', '베칸초', '오차노미즈', '다카다노바바', '와세다', '카구라자카', '이가라시', '와카바야시'],
			'오에도선': ['신주쿠', '도초마에', '나카노-사카우에', '히가시-나카노', '신에고타', '네리마', '히카리가오카', '아사카다이', '네리마-카스가초', '토요스', '가메아리', '우에노-오치마치', '신오쿠보', '스가모', '고마고메', '네즈', '우에노-오치마치', '우에노-히로코지', '신오쿠보', '히가시-신주쿠', '와카마츠-카와다', '오치아이-미나미나가사키', '신주쿠', '요요기', '요요기-우에하라', '신주쿠', '하라주쿠', '아오야마-입구', '롯폰기', '아카반에바시', '시로카네-타카나와', '다이몬', '시바코엔', '하마마츠초', '몬젠-나카초', '키요스미-시라카와', '히라노', '아사쿠사', '쿠라마에', '료고쿠', '모리시타', '키바', '히가시-오지마', '다츠미'],
			'다이토선': ['기타-센주', '미노와', '미노와바시', '이리야', '우구이스다니', '신오쿠보', '세이부-신주쿠', '미타카', '다카오산구치', '오츠카', '이케부쿠로', '스가모', '고마고메', '타비타', '니시닛포리', '다비타'],
			'아라카와선': ['미노와바시', '아라카와-샤코마에', '아라카와-이치노하시', '아라카와-니노하시', '아라카와-산노하시', '아라카와-나나하시', '마치야-에키마에', '마치야-니초메', '히가시오구-사초메', '쿠마노마에', '오지에키마에', '아스카야마', '오지-진자마에', '사카에-초', '도든지', '미야노마에', '하쿠산-시타', '셋소쿠', '카미나카자토', '오지', '나카자토', '이케부쿠로-에키마에']
	};

	// 노선 선택 모달
	const lineModal = new bootstrap.Modal(document.getElementById('lineModal'));
	const lineItems = document.querySelectorAll('.line-item');
	const lineChangeBtn = document.getElementById('lineChangeBtn');
	const stationChangeBtn = document.getElementById('stationChangeBtn');
	const selectedLineName = document.getElementById('selectedLineName');
	const selectedStationDisplay = document.getElementById('selectedStationDisplay');
	const lineInput = document.getElementById('lineInput');
	const stationInput = document.getElementById('stationInput');

	// 선택된 노선
	let selectedLine = '';
	
	// 노선 변경 버튼 클릭
	lineChangeBtn.addEventListener('click', function() {
			lineModal.show();
	});
	
	// 노선 항목 클릭 이벤트
	lineItems.forEach(item => {
			item.addEventListener('click', function() {
					const line = this.dataset.line;
					const color = this.dataset.color;
					
					// 선택된 노선 저장
					selectedLine = line;
					lineInput.value = line;
					
					// 노선 표시 업데이트
					selectedLineName.textContent = line;
					selectedLineName.style.color = color;
					document.querySelector('.selected-line').textContent = line;
					document.querySelector('.selected-line').style.color = color;
					
					// 역 선택 초기화
					document.querySelector('.selected-station').textContent = '역을 선택해주세요';
					stationInput.value = '';
					
					// 노선 모달 닫기
					lineModal.hide();
			});
	});
	
	// 역 선택 모달
	const stationModal = new bootstrap.Modal(document.getElementById('stationModal'));
	const stationList = document.getElementById('stationList');
	
	// 역 변경 버튼 클릭
	stationChangeBtn.addEventListener('click', function() {
			if (!selectedLine) {
					alert('노선을 먼저 선택해주세요.');
					return;
			}
			
			// 역 목록 생성
			stationList.innerHTML = '';
			lineStations[selectedLine].forEach(station => {
					const stationItem = document.createElement('div');
					stationItem.classList.add('station-item');
					stationItem.textContent = station;
					
					// 역 클릭 이벤트
					stationItem.addEventListener('click', function() {
							document.querySelector('.selected-station').textContent = station;
							stationInput.value = station;
							stationModal.hide();
					});
					
					stationList.appendChild(stationItem);
			});
			
			stationModal.show();
	});

	// 이미지 미리보기 처리
	setupImagePreview('thumbnailImage', 'thumbnailPreview', false);
	setupImagePreview('floorplanImages', 'floorplanPreview', true);
	setupImagePreview('buildingImages', 'buildingPreview', true);
	setupImagePreview('interiorImages', 'interiorPreview', true);

	// 이미지 미리보기 설정 함수
	function setupImagePreview(inputId, previewId, multiple) {
			const input = document.getElementById(inputId);
			const preview = document.getElementById(previewId);
			
			input.addEventListener('change', function() {
					// 단일 파일인 경우 이전 미리보기 제거
					if (!multiple) {
							preview.innerHTML = '';
					}
					
					// 선택된 파일 처리
					for (let i = 0; i < this.files.length; i++) {
							const file = this.files[i];
							
							// 이미지 파일인지 확인
							if (!file.type.startsWith('image/')) {
									continue;
							}
							
							// 미리보기 요소 생성
							const previewItem = document.createElement('div');
							previewItem.className = 'preview-item';
							
							// 이미지 요소 생성
							const img = document.createElement('img');
							img.file = file;
							previewItem.appendChild(img);
							
							// 파일 정보 저장
							previewItem.dataset.filename = file.name;
							
							// 삭제 버튼 추가
							const removeBtn = document.createElement('button');
							removeBtn.className = 'remove-btn';
							removeBtn.innerHTML = '×';
							removeBtn.addEventListener('click', function(e) {
									e.preventDefault();
									previewItem.remove();
							});
							previewItem.appendChild(removeBtn);
							
							// 미리보기 컨테이너에 추가
							preview.appendChild(previewItem);
							
							// 파일 리더로 이미지 로드
							const reader = new FileReader();
							reader.onload = (function(aImg) {
									return function(e) {
											aImg.src = e.target.result;
									};
							})(img);
							reader.readAsDataURL(file);
					}
			});
	}

	// 폼 요소 가져오기
	const form = document.getElementById('propertyForm');

	// URL에서 매물 ID 가져오기
	const urlParams = new URLSearchParams(window.location.search);
	const propertyId = urlParams.get('id');

	// 매물 ID가 있으면 기존 데이터 불러오기
	if (propertyId) {
			loadPropertyData(propertyId);
	}

	// 폼 제출 이벤트
	form.addEventListener('submit', function(e) {
			e.preventDefault();
			
			// FormData 객체 생성
			const formData = new FormData(form);
			
			// 선택된 역/노선 확인
			if (!formData.get('line') || !formData.get('station')) {
					alert('노선과 역을 선택해주세요.');
					return;
			}
			
			// API 요청 (예시)
			fetch('/api/properties' + (propertyId ? '/' + propertyId : ''), {
					method: propertyId ? 'PUT' : 'POST',
					body: formData // FormData 그대로 전송 (multipart/form-data)
			})
			.then(response => {
					if (!response.ok) {
							throw new Error('매물 등록에 실패했습니다.');
					}
					return response.json();
			})
			.then(data => {
					alert('매물이 성공적으로 등록되었습니다.');
					window.parent.location.reload(); // 부모 창 새로고침
					window.frameElement.parentElement.parentElement.querySelector('.btn-close').click(); // 팝업 닫기
			})
			.catch(error => {
					alert(error.message);
			});
	});

	// 매물 데이터 불러오기 함수
	function loadPropertyData(propertyId) {
			// 서버에서 데이터 가져오기
			fetch(`/api/properties/${propertyId}`)
					.then(response => {
							if (!response.ok) {
									throw new Error('매물 정보를 가져오는데 실패했습니다.');
							}
							return response.json();
					})
					.then(data => {
							// 폼 필드 채우기
							form.querySelector('[name="monthlyPrice"]').value = data.monthlyPrice;
							form.querySelector('[name="managementFee"]').value = data.managementFee;
							form.querySelector('[name="initialCost"]').value = data.initialCost;
							form.querySelector('[name="area"]').value = data.area;
							form.querySelector('[name="floor"]').value = data.floor;
							form.querySelector('[name="title"]').value = data.title;
							form.querySelector('[name="address"]').value = data.address;
							form.querySelector('[name="status"]').value = data.status;
							form.querySelector('[name="builtYear"]').value = data.builtYear;
							form.querySelector('[name="description"]').value = data.description;
							
							// 라디오 버튼 설정
							const buildingTypeRadio = form.querySelector(`[name="buildingType"][value="${data.buildingType}"]`);
							if (buildingTypeRadio) buildingTypeRadio.checked = true;
							
							const roomTypeRadio = form.querySelector(`[name="roomType"][value="${data.roomType}"]`);
							if (roomTypeRadio) roomTypeRadio.checked = true;
							
							// 체크박스 설정
							if (data.features && Array.isArray(data.features)) {
									data.features.forEach(feature => {
											const featureCheckbox = form.querySelector(`[name="features"][value="${feature}"]`);
											if (featureCheckbox) featureCheckbox.checked = true;
									});
							}
							
							// 노선 및 역 설정
							if (data.line && data.station) {
									selectedLine = data.line;
									lineInput.value = data.line;
									stationInput.value = data.station;
									
									// 표시 업데이트
									const lineItem = document.querySelector(`.line-item[data-line="${data.line}"]`);
									if (lineItem) {
											const color = lineItem.dataset.color;
											document.querySelector('.selected-line').textContent = data.line;
											document.querySelector('.selected-line').style.color = color;
											selectedLineName.textContent = data.line;
											selectedLineName.style.color = color;
									}
									
									document.querySelector('.selected-station').textContent = data.station;
							}
							
							// 이미지 설정 (서버에서 가져온 이미지 URL로 미리보기 생성)
							if (data.thumbnailImage) {
									createImagePreview('thumbnailPreview', data.thumbnailImage);
							}
							
							// 이미지 유형별로 미리보기 생성
							if (data.images) {
									data.images.forEach(image => {
											let previewId = '';
											switch(image.imageType) {
													case 'FLOORPLAN':
															previewId = 'floorplanPreview';
															break;
													case 'BUILDING':
															previewId = 'buildingPreview';
															break;
													case 'INTERIOR':
															previewId = 'interiorPreview';
															break;
											}
											if (previewId) {
													createImagePreview(previewId, image.imageUrl);
											}
									});
							}
					})
					.catch(error => {
							alert(error.message);
					});
	}
	
	// 이미지 URL로 미리보기 생성하는 함수
	function createImagePreview(previewId, imageUrl) {
			const preview = document.getElementById(previewId);
			
			const previewItem = document.createElement('div');
			previewItem.className = 'preview-item';
			
			const img = document.createElement('img');
			img.src = imageUrl;
			previewItem.appendChild(img);
			
			// 기존 이미지임을 표시
			previewItem.dataset.existingImage = 'true';
			previewItem.dataset.imageUrl = imageUrl;
			
			// 삭제 버튼 추가
			const removeBtn = document.createElement('button');
			removeBtn.className = 'remove-btn';
			removeBtn.innerHTML = '×';
			removeBtn.addEventListener('click', function(e) {
					e.preventDefault();
					previewItem.remove();
					
					// 기존 이미지를 삭제하려면 서버에 추가 요청해야 할 수 있음
					if (previewItem.dataset.existingImage === 'true') {
							// 삭제된 이미지 ID를 저장하는 hidden input을 추가할 수 있음
							const deletedImagesInput = document.getElementById('deletedImages') || document.createElement('input');
							deletedImagesInput.type = 'hidden';
							deletedImagesInput.id = 'deletedImages';
							deletedImagesInput.name = 'deletedImages';
							if (!deletedImagesInput.value) {
									deletedImagesInput.value = imageUrl;
							} else {
									deletedImagesInput.value += ',' + imageUrl;
							}
							form.appendChild(deletedImagesInput);
					}
			});
			previewItem.appendChild(removeBtn);
			
			preview.appendChild(previewItem);
	}
}); 