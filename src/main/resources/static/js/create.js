document.addEventListener('DOMContentLoaded', function() {
	// 건축년도 옵션 생성
	const buildingAgeSelect = document.getElementById('building-age');
	const currentYear = new Date().getFullYear();
	
	for (let year = currentYear; year >= 1970; year--) {
			const option = document.createElement('option');
			option.value = year + '년';
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
			'야마노테선': [
					{ name: '東京 (도쿄)', kanji: '東京' },
					{ name: '有楽町 (유라쿠초)', kanji: '有楽町' },
					{ name: '新橋 (신바시)', kanji: '新橋' },
					{ name: '浜松町 (하마마츠초)', kanji: '浜松町' },
					{ name: '田町 (다마치)', kanji: '田町' },
					{ name: '品川 (시나가와)', kanji: '品川' },
					{ name: '大崎 (오사키)', kanji: '大崎' },
					{ name: '五反田 (고탄다)', kanji: '五反田' },
					{ name: '目黒 (메구로)', kanji: '目黒' },
					{ name: '恵比寿 (에비스)', kanji: '恵比寿' },
					{ name: '渋谷 (시부야)', kanji: '渋谷' },
					{ name: '原宿 (하라주쿠)', kanji: '原宿' },
					{ name: '代々木 (요요기)', kanji: '代々木' },
					{ name: '新宿 (신주쿠)', kanji: '新宿' },
					{ name: '新大久保 (신오쿠보)', kanji: '新大久保' },
					{ name: '高田馬場 (다카다노바바)', kanji: '高田馬場' },
					{ name: '目白 (메지로)', kanji: '目白' },
					{ name: '池袋 (이케부쿠로)', kanji: '池袋' }
			],
			'마루노우치선': [
					{ name: '荻窪 (오기쿠보)', kanji: '荻窪' },
					{ name: '新中野 (신나카노)', kanji: '新中野' },
					{ name: '中野坂上 (나카노사카에)', kanji: '中野坂上' },
					{ name: '西新宿 (니시신주쿠)', kanji: '西新宿' },
					{ name: '新宿三丁目 (신주쿠산초메)', kanji: '新宿三丁目' },
					{ name: '新宿 (신주쿠)', kanji: '新宿' }
			],
			'히비야선': [
					{ name: '中目黒 (나카메구로)', kanji: '中目黒' },
					{ name: '恵比寿 (에비스)', kanji: '恵比寿' },
					{ name: '広尾 (히로오)', kanji: '広尾' },
					{ name: '六本木 (롯폰기)', kanji: '六本木' },
					{ name: '神谷町 (가미야초)', kanji: '神谷町' },
					{ name: '日比谷 (히비야)', kanji: '日比谷' },
					{ name: '銀座 (긴자)', kanji: '銀座' },
					{ name: '築地 (츠키지)', kanji: '築地' },
					{ name: '八丁堀 (하치오바리)', kanji: '八丁堀' },
					{ name: '上野 (우에노)', kanji: '上野' }
			],
			'토자이선': [
					{ name: '西葛西 (니시카사이)', kanji: '西葛西' },
					{ name: '葛西 (카사이)', kanji: '葛西' },
					{ name: '浦安 (우라야스)', kanji: '浦安' },
					{ name: '東陽町 (토요초)', kanji: '東陽町' },
					{ name: '木場 (키바)', kanji: '木場' },
					{ name: '門前仲町 (몬젠나카초)', kanji: '門前仲町' },
					{ name: '日本橋 (니혼바시)', kanji: '日本橋' },
					{ name: '大手町 (오테마치)', kanji: '大手町' }
			],
			'티요다선': [
					{ name: '代々木上原 (요요기우에하라)', kanji: '代々木上原' },
					{ name: '代々木公園 (요요기코엔)', kanji: '代々木公園' },
					{ name: '明治神宮前 (메이지진구마에)', kanji: '明治神宮前' },
					{ name: '表参道 (오모테산도)', kanji: '表参道' },
					{ name: '赤坂 (아카사카)', kanji: '赤坂' },
					{ name: '永田町 (나가타초)', kanji: '永田町' },
					{ name: '日比谷 (히비야)', kanji: '日比谷' },
					{ name: '大手町 (오테마치)', kanji: '大手町' }
			],
			'유라쿠초선': [
					{ name: '新木場 (신키바)', kanji: '新木場' },
					{ name: '東陽町 (토요초)', kanji: '東陽町' },
					{ name: '江戸橋 (에도바시)', kanji: '江戸橋' },
					{ name: '有楽町 (유라쿠초)', kanji: '有楽町' },
					{ name: '新橋 (신바시)', kanji: '新橋' },
					{ name: '桜田門 (사쿠라다몬)', kanji: '桜田門' },
					{ name: '飯田橋 (이다바시)', kanji: '飯田橋' }
			],
			'난보쿠선': [
					{ name: '目黒 (메구로)', kanji: '目黒' },
					{ name: '白金台 (시로카네다이)', kanji: '白金台' },
					{ name: '白金高輪 (시로카네타카나와)', kanji: '白金高輪' },
					{ name: '麻布十番 (아자부주반)', kanji: '麻布十番' },
					{ name: '六本木一丁目 (롯폰기잇초메)', kanji: '六本木一丁目' },
					{ name: '赤坂見附 (아카사카미츠케)', kanji: '赤坂見附' },
					{ name: '虎ノ門 (토라노몬)', kanji: '虎ノ門' }
			],
			'후쿠토신선': [
					{ name: '渋谷 (시부야)', kanji: '渋谷' },
					{ name: '明治神宮前 (메이지진구마에)', kanji: '明治神宮前' },
					{ name: '新宿三丁目 (신주쿠산초메)', kanji: '新宿三丁目' },
					{ name: '東新宿 (히가시신주쿠)', kanji: '東新宿' },
					{ name: '新宿 (신주쿠)', kanji: '新宿' }
			],
			'긴자선': [
					{ name: '渋谷 (시부야)', kanji: '渋谷' },
					{ name: '表参道 (오모테산도)', kanji: '表参道' },
					{ name: '外苑前 (가이엔마에)', kanji: '外苑前' },
					{ name: '赤坂見附 (아카사카미츠케)', kanji: '赤坂見附' },
					{ name: '銀座 (긴자)', kanji: '銀座' },
					{ name: '上野 (우에노)', kanji: '上野' },
					{ name: '浅草 (아사쿠사)', kanji: '浅草' }
			],
			'한조몬선': [
					{ name: '渋谷 (시부야)', kanji: '渋谷' },
					{ name: '表参道 (오모테산도)', kanji: '表参道' },
					{ name: '青山一丁目 (아오야마잇초메)', kanji: '青山一丁目' },
					{ name: '永田町 (나가타초)', kanji: '永田町' },
					{ name: '日比谷 (히비야)', kanji: '日比谷' },
					{ name: '大手町 (오테마치)', kanji: '大手町' }
			],
			'아사쿠사선': [
					{ name: '西馬込 (니시마고메)', kanji: '西馬込' },
					{ name: '馬込 (마고메)', kanji: '馬込' },
					{ name: '浅草 (아사쿠사)', kanji: '浅草' },
					{ name: '日本橋 (니혼바시)', kanji: '日本橋' },
					{ name: '人形町 (닌교초)', kanji: '人形町' }
			],
			'미타선': [
					{ name: '目黒 (메구로)', kanji: '目黒' },
					{ name: '白金台 (시로카네다이)', kanji: '白金台' },
					{ name: '白金高輪 (시로카네타카나와)', kanji: '白金高輪' },
					{ name: '三田 (미타)', kanji: '三田' },
					{ name: '水道橋 (스이도바시)', kanji: '水道橋' },
					{ name: '落合 (오치아이)', kanji: '落合' }
			],
			'신주쿠선': [
					{ name: '新宿 (신주쿠)', kanji: '新宿' },
					{ name: '新宿三丁目 (신주쿠산초메)', kanji: '新宿三丁目' },
					{ name: '市ヶ谷 (이치가야)', kanji: '市ヶ谷' },
					{ name: '飯田橋 (이다바시)', kanji: '飯田橋' },
					{ name: '早稲田 (와세다)', kanji: '早稲田' }
			],
			'오에도선': [
					{ name: '新宿 (신주쿠)', kanji: '新宿' },
					{ name: '東新宿 (히가시신주쿠)', kanji: '東新宿' },
					{ name: '上野御徒町 (우에노오카치마치)', kanji: '上野御徒町' },
					{ name: '六本木 (롯폰기)', kanji: '六本木' },
					{ name: '大門 (다이몬)', kanji: '大門' },
					{ name: '月島 (쓰키시마)', kanji: '月島' },
					{ name: '木場 (키바)', kanji: '木場' }
			],
			'다이토선': [
					{ name: '北千住 (기타센주)', kanji: '北千住' },
					{ name: '三ノ輪 (미노와)', kanji: '三ノ輪' },
					{ name: '鶯谷 (우구이스다니)', kanji: '鶯谷' },
					{ name: '新大久保 (신오쿠보)', kanji: '新大久保' },
					{ name: '池袋 (이케부쿠로)', kanji: '池袋' },
					{ name: '巣鴨 (스가모)', kanji: '巣鴨' },
					{ name: '西日暮里 (니시닛포리)', kanji: '西日暮里' }
			],
			'아라카와선': [
					{ name: '三ノ輪橋 (미노와바시)', kanji: '三ノ輪橋' },
					{ name: '町屋 (마치야)', kanji: '町屋' },
					{ name: '西町屋 (니시마치야)', kanji: '西町屋' },
					{ name: '王子 (오지)', kanji: '王子' },
					{ name: '王子駅前 (오지에키마에)', kanji: '王子駅前' },
					{ name: '池袋 (이케부쿠로)', kanji: '池袋' }
			]
	};

	// 노선 선택 모달
	const lineModal = new bootstrap.Modal(document.getElementById('lineModal'));
	const lineItems = document.querySelectorAll('.line-item');
	const lineChangeBtn = document.getElementById('lineChangeBtn');
	const stationChangeBtn = document.getElementById('stationChangeBtn');
	const selectedLineName = document.getElementById('selectedLineName');
	const selectedStationDisplay = document.getElementById('selectedStationDisplay');
	const lineInput = document.getElementById('subwayLine');
	const stationInput = document.getElementById('station');

	// 선택된 노선
	let selectedLine = lineInput.value || '';

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
					stationItem.textContent = station.name;

					// 역 클릭 이벤트
					stationItem.addEventListener('click', function() {
							document.querySelector('.selected-station').textContent = station.name;
							stationInput.value = station.kanji;
							stationModal.hide();
					});

					stationList.appendChild(stationItem);
			});

			stationModal.show();
	});

	// 이미지 미리보기 함수
	function handleImagePreview(input, previewContainer) {
			const container = document.getElementById(previewContainer);
			container.innerHTML = '';

			if (input.files && input.files.length > 0) {
					for (let i = 0; i < input.files.length; i++) {
							const reader = new FileReader();
							reader.onload = function(e) {
									const img = document.createElement('img');
									img.src = e.target.result;
									img.className = 'preview-image';
									container.appendChild(img);
							}
							reader.readAsDataURL(input.files[i]);
					}
			}
	}

	// 이미지 미리보기 이벤트 리스너
	document.getElementById('thumbnailImage').addEventListener('change', function() {
			handleImagePreview(this, 'thumbnailPreview');
	});

	document.getElementById('floorplanImages').addEventListener('change', function() {
			handleImagePreview(this, 'floorplanPreview');
	});

	document.getElementById('buildingImages').addEventListener('change', function() {
			handleImagePreview(this, 'buildingPreview');
	});

	document.getElementById('interiorImages').addEventListener('change', function() {
			handleImagePreview(this, 'interiorPreview');
	});

	// 추가 이미지 미리보기 이벤트 리스너
	document.getElementById('extraImage1').addEventListener('change', function() {
			handleImagePreview(this, 'extraImage1Preview');
	});

	document.getElementById('extraImage2').addEventListener('change', function() {
			handleImagePreview(this, 'extraImage2Preview');
	});

	// 폼 요소 가져오기
	const form = document.getElementById('propertyForm');

	// URL에서 매물 ID 가져오기
	const urlParams = new URLSearchParams(window.location.search);
	const propertyId = urlParams.get('id');

	// 수정 모드인 경우 버튼 텍스트 변경
	if (propertyId) {
		const submitButton = document.getElementById('submitButton');
		if (submitButton) {
			submitButton.textContent = '매물 수정하기';
		}
	}

	// 매물 ID가 있으면 기존 데이터 불러오기
	if (propertyId) {
			loadPropertyData(propertyId);
	}

	// 폼 제출 처리
	const propertyForm = document.getElementById('propertyForm');
	const submitButton = document.getElementById('submitButton');

	// 폼 초기 로드 시 기존 값으로 노선과 역 표시 업데이트
	if (lineInput.value) {
		selectedLine = lineInput.value;
		document.querySelector('.selected-line').textContent = selectedLine;

		// 역 표시 업데이트
		if (stationInput.value) {
			// 역 표시할 때는 kanji 값을 표시하거나, 필요에 따라 표시 가능한 형태로 변환
			document.querySelector('.selected-station').textContent = stationInput.value;
		}
	}

	propertyForm.addEventListener('submit', function(e) {
		// 폼은 자동으로 제출되도록 함
		// 이미 Thymeleaf에서 method와 action이 설정되어 있음
		submitButton.disabled = true;
		submitButton.textContent = '제출중...';

		// 다른 폼 관련 로직이 필요하면 여기에 추가
		// 예: 필수 필드 체크 등
		if (!lineInput.value || !stationInput.value) {
			e.preventDefault();
			alert('노선과 역을 선택해주세요.');
			submitButton.disabled = false;
			submitButton.textContent = '매물 등록하기';
			return false;
		}
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
							console.log('Loaded property data:', data);
							// 폼 필드 채우기
							form.querySelector('[name="monthlyPrice"]').value = data.monthlyPrice;
							form.querySelector('[name="managementFee"]').value = data.managementFee;
							form.querySelector('[name="initialCost"]').value = data.initialCost;
							form.querySelector('[name="area"]').value = data.area;
							form.querySelector('[name="floor"]').value = data.floor ? data.floor.replace('층', '') : '';
							form.querySelector('[name="title"]').value = data.title;
							form.querySelector('[name="address"]').value = data.location || '';  // location을 address로 매핑
							form.querySelector('[name="district"]').value = data.district || '';
							form.querySelector('[name="shikikin"]').value = data.shikikin || '';
							form.querySelector('[name="reikin"]').value = data.reikin || '';
							form.querySelector('[name="status"]').value = data.status || '';
							form.querySelector('[name="builtYear"]').value = data.builtYear || '';

							// description에서 features 부분을 제외한 텍스트 추출
							let descriptionText = data.description || '';
							const featureIndex = descriptionText.indexOf('\n\n특징:');
							if (featureIndex !== -1) {
									descriptionText = descriptionText.substring(0, featureIndex);
							}
							form.querySelector('[name="description"]').value = descriptionText;
							form.querySelector('[name="nearbyFacilities"]').value = data.nearbyFacilities || '';

							// buildingType은 객체이므로 name 속성 사용
							const buildingTypeValue = data.buildingType;
							if (buildingTypeValue) {
									const buildingTypeRadio = form.querySelector(`[name="buildingType"][value="${buildingTypeValue}"]`);
									if (buildingTypeRadio) {
											buildingTypeRadio.checked = true;
									}
							}

							// roomType 설정
							const roomTypeValue = data.roomType;
							if (roomTypeValue) {
									const roomTypeRadio = form.querySelector(`[name="roomType"][value="${roomTypeValue}"]`);
									if (roomTypeRadio) {
											roomTypeRadio.checked = true;
									}
							}

							// description에서 features 추출
							if (data.description) {
									const featuresMatch = data.description.match(/특징:[\s\S]*?-\s(.*?)$/gm);
									if (featuresMatch) {
											featuresMatch.forEach(featureText => {
													const feature = featureText.replace(/특징:[\s\S]*?-\s/, '').trim();
													const featureCheckbox = form.querySelector(`[name="features"][value="${feature}"]`);
													if (featureCheckbox) {
															featureCheckbox.checked = true;
													}
											});
									}
							}

							// 노선 및 역 설정
							if (data.station && data.subwayLine) {  // subwayLine을 line으로 사용
									selectedLine = data.subwayLine;
									lineInput.value = data.subwayLine;
									stationInput.value = data.station;

									// 표시 업데이트
									const lineItem = document.querySelector(`.line-item[data-line="${data.subwayLine}"]`);
									if (lineItem) {
											const color = lineItem.dataset.color;
											document.querySelector('.selected-line').textContent = data.subwayLine;
											document.querySelector('.selected-line').style.color = color;
											selectedLineName.textContent = data.subwayLine;
											selectedLineName.style.color = color;
									}

									document.querySelector('.selected-station').textContent = data.station;
							}

							// 이미지 설정 (서버에서 가져온 이미지 URL로 미리보기 생성)
							if (data.thumbnailImage) {
									createImagePreview('thumbnailPreview', data.thumbnailImage);
							}

							// 평면도 이미지 처리
							if (data.floorplanImage) {
									if (data.floorplanImage.includes(',')) {
											// 여러 이미지 URL이 콤마로 구분되어 있는 경우
											data.floorplanImage.split(',').forEach(url => {
													createImagePreview('floorplanPreview', url.trim());
											});
									} else {
											createImagePreview('floorplanPreview', data.floorplanImage);
									}
							}

							// 건물 이미지 처리
							if (data.buildingImage) {
									if (data.buildingImage.includes(',')) {
											data.buildingImage.split(',').forEach(url => {
													createImagePreview('buildingPreview', url.trim());
											});
									} else {
											createImagePreview('buildingPreview', data.buildingImage);
									}
							}

							// 내부 이미지 처리
							if (data.interiorImage) {
									if (data.interiorImage.includes(',')) {
											data.interiorImage.split(',').forEach(url => {
													createImagePreview('interiorPreview', url.trim());
											});
									} else {
											createImagePreview('interiorPreview', data.interiorImage);
									}
							}
					})
					.catch(error => {
							console.error('Error loading property data:', error);
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