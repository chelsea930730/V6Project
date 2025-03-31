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
		'JR山手線・JR야마노테선': [
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
				{ name: '池袋 (이케부쿠로)', kanji: '池袋' },
				{ name: '大塚 (오츠카)', kanji: '大塚' },
				{ name: '駒込 (코마고메)', kanji: '駒込' },
				{ name: '田端 (타바타)', kanji: '田端' },
				{ name: '西日暮里 (니시닛포리)', kanji: '西日暮里' },
				{ name: '日暮里 (닛포리)', kanji: '日暮里' },
				{ name: '鶯谷 (우구이스다니)', kanji: '鶯谷' },
				{ name: '御徒町 (오카치마치)', kanji: '御徒町' },
				{ name: '神田 (칸다)', kanji: '神田' },
				{ name: '巣鴨 (스가모)', kanji: '巣鴨' }
		],
		'JR中央・総武線・JR츄오소부선': [
				{ name: '小岩 (코이와)', kanji: '小岩' },
				{ name: '新小岩 (신코이와)', kanji: '新小岩' },
				{ name: '平井 (히라이)', kanji: '平井' },
				{ name: '亀戸 (카메이도)', kanji: '亀戸' },
				{ name: '錦糸町 (킨시쵸)', kanji: '錦糸町' },
				{ name: '両国 (료고쿠)', kanji: '両国' },
				{ name: '浅草橋 (아사쿠사바시)', kanji: '浅草橋' },
				{ name: '秋葉原 (아키하바라)', kanji: '秋葉原' },
				{ name: '御茶ノ水 (오차노미즈)', kanji: '御茶ノ水' },
				{ name: '水道橋 (스이도바시)', kanji: '水道橋' },
				{ name: '飯田橋 (이다바시)', kanji: '飯田橋' },
				{ name: '市ヶ谷 (이치가야)', kanji: '市ヶ谷' },
				{ name: '四ツ谷 (요츠야)', kanji: '四ツ谷' },
				{ name: '信濃町 (시나노마치)', kanji: '信濃町' },
				{ name: '千駄ヶ谷 (센다가야)', kanji: '千駄ヶ谷' },
				{ name: '代々木 (요요기)', kanji: '代々木' },
				{ name: '新宿 (신주쿠)', kanji: '新宿' },
				{ name: '大久保 (오쿠보)', kanji: '大久保' },
				{ name: '東中野 (히가시나카노)', kanji: '東中野' },
				{ name: '中野 (나카노)', kanji: '中野' },
				{ name: '高円寺 (코엔지)', kanji: '高円寺' },
				{ name: '荻窪 (오기쿠보)', kanji: '荻窪' },
				{ name: '西荻窪 (니시오기쿠보)', kanji: '西荻窪' }
		],
		'JR埼京線・JR사이쿄선': [
				{ name: '大崎 (오사키)', kanji: '大崎' },
				{ name: '恵比寿 (에비스)', kanji: '恵比寿' },
				{ name: '渋谷 (시부야)', kanji: '渋谷' },
				{ name: '新宿 (신주쿠)', kanji: '新宿' },
				{ name: '池袋 (이케부쿠로)', kanji: '池袋' },
				{ name: '板橋 (이타바시)', kanji: '板橋' },
				{ name: '十条 (주조)', kanji: '十条' },
				{ name: '赤羽 (아카바네)', kanji: '赤羽' },
				{ name: '北赤羽 (키타아카바네)', kanji: '北赤羽' },
				{ name: '浮間舟渡 (우키마후나도)', kanji: '浮間舟渡' }
		],
		'JR常磐線・JR죠반선': [
				{ name: '北千住 (키타센주)', kanji: '北千住' },
				{ name: '南千住 (미나미센주)', kanji: '南千住' },
				{ name: '三河島 (미카와시마)', kanji: '三河島' },
				{ name: '日暮里 (닛포리)', kanji: '日暮里' },
				{ name: '上野 (우에노)', kanji: '上野' },
				{ name: '東京 (도쿄)', kanji: '東京' },
				{ name: '品川 (시나가와)', kanji: '品川' }
		],
		'JR高崎線・JR타카사키선': [
				{ name: '東京 (도쿄)', kanji: '東京' },
				{ name: '上野 (우에노)', kanji: '上野' },
				{ name: '尾久 (오쿠)', kanji: '尾久' },
				{ name: '赤羽 (아카바네)', kanji: '赤羽' }
		],
		'JR横須賀線・JR요코스카선': [
				{ name: '西大井 (니시오이)', kanji: '西大井' },
				{ name: '品川 (시나가와)', kanji: '品川' },
				{ name: '新橋 (신바시)', kanji: '新橋' },
				{ name: '東京 (도쿄)', kanji: '東京' }
		],
		'JR京浜東北線・JR케이힌토쿠선': [
				{ name: '赤羽 (아카바네)', kanji: '赤羽' },
				{ name: '東十条 (히가시주조)', kanji: '東十条' },
				{ name: '王子 (오지)', kanji: '王子' },
				{ name: '上中里 (카미나카자토)', kanji: '上中里' },
				{ name: '田端 (타바타)', kanji: '田端' },
				{ name: '西日暮里 (니시닛포리)', kanji: '西日暮里' },
				{ name: '日暮里 (닛포리)', kanji: '日暮里' },
				{ name: '鶯谷 (우구이스다니)', kanji: '鶯谷' },
				{ name: '上野 (우에노)', kanji: '上野' },
				{ name: '御徒町 (오카치마치)', kanji: '御徒町' },
				{ name: '秋葉原 (아키하바라)', kanji: '秋葉原' },
				{ name: '神田 (칸다)', kanji: '神田' },
				{ name: '東京 (도쿄)', kanji: '東京' },
				{ name: '有楽町 (유라쿠초)', kanji: '有楽町' },
				{ name: '新橋 (신바시)', kanji: '新橋' },
				{ name: '浜松町 (하마마츠초)', kanji: '浜松町' },
				{ name: '田町 (다마치)', kanji: '田町' },
				{ name: '高輪ゲートウェイ (타카나와 게이트웨이)', kanji: '高輪ゲートウェイ' },
				{ name: '品川 (시나가와)', kanji: '品川' },
				{ name: '大井町 (오이마치)', kanji: '大井町' },
				{ name: '大森 (오모리)', kanji: '大森' },
				{ name: '蒲田 (카마타)', kanji: '蒲田' }
		],
		'半蔵門線・한조몬선': [
				{ name: '渋谷 (시부야)', kanji: '渋谷' },
				{ name: '表参道 (오모테산도)', kanji: '表参道' },
				{ name: '青山一丁目 (아오야마잇초메)', kanji: '青山一丁目' },
				{ name: '永田町 (나가타초)', kanji: '永田町' },
				{ name: '半蔵門 (한조몬)', kanji: '半蔵門' },
				{ name: '九段下 (쿠단시타)', kanji: '九段下' },
				{ name: '神保町 (진보초)', kanji: '神保町' },
				{ name: '大手町 (오테마치)', kanji: '大手町' },
				{ name: '三越前 (미츠코시마에)', kanji: '三越前' },
				{ name: '水天宮前 (스이텐구마에)', kanji: '水天宮前' },
				{ name: '清澄白河 (키요스미시라카와)', kanji: '清澄白河' },
				{ name: '住吉 (스미요시)', kanji: '住吉' },
				{ name: '錦糸町 (킨시초)', kanji: '錦糸町' },
				{ name: '押上 (오시아게)', kanji: '押上' }
		],
		'丸ノ内線・마루노우치선': [
				{ name: '荻窪 (오기쿠보)', kanji: '荻窪' },
				{ name: '南阿佐ヶ谷 (미나미아사가야)', kanji: '南阿佐ヶ谷' },
				{ name: '新高円寺 (신코엔지)', kanji: '新高円寺' },
				{ name: '東高円寺 (히가시코엔지)', kanji: '東高円寺' },
				{ name: '新中野 (신나카노)', kanji: '新中野' },
				{ name: '中野坂上 (나카노사카우에)', kanji: '中野坂上' },
				{ name: '西新宿 (니시신주쿠)', kanji: '西新宿' },
				{ name: '新宿 (신주쿠)', kanji: '新宿' },
				{ name: '新宿三丁目 (신주쿠산초메)', kanji: '新宿三丁目' },
				{ name: '新宿御苑前 (신주쿠교엔마에)', kanji: '新宿御苑前' },
				{ name: '四谷三丁目 (요츠야산초메)', kanji: '四谷三丁目' },
				{ name: '赤坂見附 (아카사카미츠케)', kanji: '赤坂見附' },
				{ name: '国会議事堂前 (콧카이기지도마에)', kanji: '国会議事堂前' },
				{ name: '霞ヶ関 (카스미가세키)', kanji: '霞ヶ関' },
				{ name: '銀座 (긴자)', kanji: '銀座' },
				{ name: '東京 (도쿄)', kanji: '東京' },
				{ name: '大手町 (오테마치)', kanji: '大手町' },
				{ name: '淡路町 (아와지초)', kanji: '淡路町' },
				{ name: '御茶ノ水 (오차노미즈)', kanji: '御茶ノ水' },
				{ name: '本郷三丁目 (혼고산초메)', kanji: '本郷三丁目' },
				{ name: '後楽園 (코라쿠엔)', kanji: '後楽園' },
				{ name: '茗荷谷 (묘가다니)', kanji: '茗荷谷' },
				{ name: '新大塚 (신오츠카)', kanji: '新大塚' },
				{ name: '池袋 (이케부쿠로)', kanji: '池袋' }
		],
		'日比谷線・히비야선': [
				{ name: '中目黒 (나카메구로)', kanji: '中目黒' },
				{ name: '恵比寿 (에비스)', kanji: '恵比寿' },
				{ name: '広尾 (히로오)', kanji: '広尾' },
				{ name: '六本木 (롯폰기)', kanji: '六本木' },
				{ name: '神谷町 (카미야초)', kanji: '神谷町' },
				{ name: '虎ノ門ヒルズ (토라노몬힐즈)', kanji: '虎ノ門ヒルズ' },
				{ name: '霞ヶ関 (카스미가세키)', kanji: '霞ヶ関' },
				{ name: '日比谷 (히비야)', kanji: '日比谷' },
				{ name: '銀座 (긴자)', kanji: '銀座' },
				{ name: '東銀座 (히가시긴자)', kanji: '東銀座' },
				{ name: '築地 (츠키지)', kanji: '築地' },
				{ name: '八丁堀 (핫초보리)', kanji: '八丁堀' },
				{ name: '茅場町 (카야바초)', kanji: '茅場町' },
				{ name: '人形町 (닌교초)', kanji: '人形町' },
				{ name: '小伝馬町 (코덴마초)', kanji: '小伝馬町' },
				{ name: '秋葉原 (아키하바라)', kanji: '秋葉原' },
				{ name: '仲御徒町 (나카오카치마치)', kanji: '仲御徒町' },
				{ name: '上野 (우에노)', kanji: '上野' },
				{ name: '入谷 (이리야)', kanji: '入谷' },
				{ name: '三ノ輪 (미노와)', kanji: '三ノ輪' },
				{ name: '南千住 (미나미센주)', kanji: '南千住' },
				{ name: '北千住 (키타센주)', kanji: '北千住' }
		],
		'千代田線・치요다선': [
				{ name: '代々木上原 (요요기우에하라)', kanji: '代々木上原' },
				{ name: '代々木公園 (요요기코엔)', kanji: '代々木公園' },
				{ name: '明治神宮前 (메이지진구마에)', kanji: '明治神宮前' },
				{ name: '表参道 (오모테산도)', kanji: '表参道' },
				{ name: '乃木坂 (노기자카)', kanji: '乃木坂' },
				{ name: '赤坂 (아카사카)', kanji: '赤坂' },
				{ name: '国会議事堂前 (콧카이기지도마에)', kanji: '国会議事堂前' },
				{ name: '霞ヶ関 (카스미가세키)', kanji: '霞ヶ関' },
				{ name: '日比谷 (히비야)', kanji: '日比谷' },
				{ name: '二重橋前 (니주바시마에)', kanji: '二重橋前' },
				{ name: '大手町 (오테마치)', kanji: '大手町' },
				{ name: '新御茶ノ水 (신오차노미즈)', kanji: '新御茶ノ水' },
				{ name: '湯島 (유시마)', kanji: '湯島' },
				{ name: '根津 (네즈)', kanji: '根津' },
				{ name: '千駄木 (센다기)', kanji: '千駄木' },
				{ name: '西日暮里 (니시닛포리)', kanji: '西日暮里' },
				{ name: '町屋 (마치야)', kanji: '町屋' },
				{ name: '北千住 (키타센주)', kanji: '北千住' },
				{ name: '綾瀬 (아야세)', kanji: '綾瀬' },
				{ name: '北綾瀬 (키타아야세)', kanji: '北綾瀬' }
		],
		'副都心線・후쿠토신선': [
				{ name: '地下鉄成増 (치카테츠나리마스)', kanji: '地下鉄成増' },
				{ name: '地下鉄赤塚 (치카테츠아카츠카)', kanji: '地下鉄赤塚' },
				{ name: '平和台 (헤이와다이)', kanji: '平和台' },
				{ name: '氷川台 (히카와다이)', kanji: '氷川台' },
				{ name: '小竹向原 (코타케무카이하라)', kanji: '小竹向原' },
				{ name: '千川 (센카와)', kanji: '千川' },
				{ name: '要町 (카나메초)', kanji: '要町' },
				{ name: '池袋 (이케부쿠로)', kanji: '池袋' },
				{ name: '雑司が谷 (조시가야)', kanji: '雑司が谷' },
				{ name: '西早稲田 (니시와세다)', kanji: '西早稲田' },
				{ name: '東新宿 (히가시신주쿠)', kanji: '東新宿' },
				{ name: '新宿三丁目 (신주쿠산초메)', kanji: '新宿三丁目' },
				{ name: '北参道 (키타산도)', kanji: '北参道' },
				{ name: '明治神宮前 (메이지진구마에)', kanji: '明治神宮前' },
				{ name: '渋谷 (시부야)', kanji: '渋谷' }
		],
		'銀座線・긴자선': [
				{ name: '渋谷 (시부야)', kanji: '渋谷' },
				{ name: '表参道 (오모테산도)', kanji: '表参道' },
				{ name: '外苑前 (가이엔마에)', kanji: '外苑前' },
				{ name: '青山一丁目 (아오야마잇초메)', kanji: '青山一丁目' },
				{ name: '赤坂見附 (아카사카미츠케)', kanji: '赤坂見附' },
				{ name: '溜池山王 (타메이케산노)', kanji: '溜池山王' },
				{ name: '虎ノ門 (토라노몬)', kanji: '虎ノ門' },
				{ name: '新橋 (신바시)', kanji: '新橋' },
				{ name: '銀座 (긴자)', kanji: '銀座' },
				{ name: '京橋 (쿄바시)', kanji: '京橋' },
				{ name: '日本橋 (니혼바시)', kanji: '日本橋' },
				{ name: '三越前 (미츠코시마에)', kanji: '三越前' },
				{ name: '神田 (칸다)', kanji: '神田' },
				{ name: '末広町 (스에히로초)', kanji: '末広町' },
				{ name: '上野広小路 (우에노히로코지)', kanji: '上野広小路' },
				{ name: '上野 (우에노)', kanji: '上野' },
				{ name: '稲荷町 (이나리초)', kanji: '稲荷町' },
				{ name: '田原町 (타와라마치)', kanji: '田原町' },
				{ name: '浅草 (아사쿠사)', kanji: '浅草' }
		],
		'南北線・난보쿠선': [
				{ name: '目黒 (메구로)', kanji: '目黒' },
				{ name: '白金台 (시로카네다이)', kanji: '白金台' },
				{ name: '白金高輪 (시로카네타카나와)', kanji: '白金高輪' },
				{ name: '麻布十番 (아자부주반)', kanji: '麻布十番' },
				{ name: '六本木一丁目 (롯폰기잇초메)', kanji: '六本木一丁目' },
				{ name: '溜池山王 (타메이케산노)', kanji: '溜池山王' },
				{ name: '永田町 (나가타초)', kanji: '永田町' },
				{ name: '四ツ谷 (요츠야)', kanji: '四ツ谷' },
				{ name: '市ヶ谷 (이치가야)', kanji: '市ヶ谷' },
				{ name: '飯田橋 (이다바시)', kanji: '飯田橋' },
				{ name: '後楽園 (코라쿠엔)', kanji: '後楽園' },
				{ name: '東大前 (토다이마에)', kanji: '東大前' },
				{ name: '本駒込 (혼코마고메)', kanji: '本駒込' },
				{ name: '駒込 (코마고메)', kanji: '駒込' },
				{ name: '西ヶ原 (니시가하라)', kanji: '西ヶ原' },
				{ name: '王子 (오지)', kanji: '王子' },
				{ name: '王子神谷 (오지카미야)', kanji: '王子神谷' },
				{ name: '志茂 (시모)', kanji: '志茂' },
				{ name: '赤羽岩淵 (아카바네이와부치)', kanji: '赤羽岩淵' }
		],
		'有楽町線・유라쿠초선': [
				{ name: '和光市 (와코시)', kanji: '和光市' },
				{ name: '地下鉄成増 (치카테츠나리마스)', kanji: '地下鉄成増' },
				{ name: '地下鉄赤塚 (치카테츠아카츠카)', kanji: '地下鉄赤塚' },
				{ name: '平和台 (헤이와다이)', kanji: '平和台' },
				{ name: '氷川台 (히카와다이)', kanji: '氷川台' },
				{ name: '小竹向原 (코타케무카이하라)', kanji: '小竹向原' },
				{ name: '千川 (센카와)', kanji: '千川' },
				{ name: '要町 (카나메초)', kanji: '要町' },
				{ name: '池袋 (이케부쿠로)', kanji: '池袋' },
				{ name: '東池袋 (히가시이케부쿠로)', kanji: '東池袋' },
				{ name: '護国寺 (고코쿠지)', kanji: '護国寺' },
				{ name: '江戸川橋 (에도가와바시)', kanji: '江戸川橋' },
				{ name: '飯田橋 (이다바시)', kanji: '飯田橋' },
				{ name: '市ヶ谷 (이치가야)', kanji: '市ヶ谷' },
				{ name: '麹町 (코지마치)', kanji: '麹町' },
				{ name: '永田町 (나가타초)', kanji: '永田町' },
				{ name: '桜田門 (사쿠라다몬)', kanji: '桜田門' },
				{ name: '有楽町 (유라쿠초)', kanji: '有楽町' },
				{ name: '銀座一丁目 (긴자잇초메)', kanji: '銀座一丁目' },
				{ name: '新富町 (신토미초)', kanji: '新富町' },
				{ name: '月島 (츠키시마)', kanji: '月島' },
				{ name: '豊洲 (토요스)', kanji: '豊洲' },
				{ name: '辰巳 (타츠미)', kanji: '辰巳' },
				{ name: '新木場 (신키바)', kanji: '新木場' }
		],
		'東西線・토자이선': [
				{ name: '中野 (나카노)', kanji: '中野' },
				{ name: '落合 (오치아이)', kanji: '落合' },
				{ name: '高田馬場 (타카다노바바)', kanji: '高田馬場' },
				{ name: '早稲田 (와세다)', kanji: '早稲田' },
				{ name: '神楽坂 (카구라자카)', kanji: '神楽坂' },
				{ name: '飯田橋 (이다바시)', kanji: '飯田橋' },
				{ name: '九段下 (쿠단시타)', kanji: '九段下' },
				{ name: '竹橋 (타케바시)', kanji: '竹橋' },
				{ name: '大手町 (오테마치)', kanji: '大手町' },
				{ name: '日本橋 (니혼바시)', kanji: '日本橋' },
				{ name: '茅場町 (카야바초)', kanji: '茅場町' },
				{ name: '門前仲町 (몬젠나카초)', kanji: '門前仲町' },
				{ name: '木場 (키바)', kanji: '木場' },
				{ name: '東陽町 (토요초)', kanji: '東陽町' },
				{ name: '南砂町 (미나미스나미치)', kanji: '南砂町' },
				{ name: '西葛西 (니시카사이)', kanji: '西葛西' },
				{ name: '葛西 (카사이)', kanji: '葛西' }
		]
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
					const lineKor = this.dataset.line;
					const color = this.dataset.color;
					
					// 노선 이름 변환
					const lineJP = convertLineNameToJapanese(lineKor);
					
					// 선택된 노선 저장
					selectedLine = lineJP;
					lineInput.value = lineJP;
					
					// 노선 표시 업데이트
					selectedLineName.textContent = lineJP;
					selectedLineName.style.color = color;
					document.querySelector('.selected-line').textContent = lineJP;
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
							stationInput.value = station.name; // 한자 (한글) 형식으로 저장
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

	// 폼 제출 이벤트
	form.addEventListener('submit', function(e) {
			e.preventDefault();
			
			// FormData 객체 생성
			const formData = new FormData();
			
			// 필수 필드 추가
			formData.append('title', form.querySelector('[name="title"]').value);
			formData.append('monthlyPrice', form.querySelector('[name="monthlyPrice"]').value);
			formData.append('managementFee', form.querySelector('[name="managementFee"]').value);
			formData.append('initialCost', form.querySelector('[name="initialCost"]').value);
			formData.append('area', form.querySelector('[name="area"]').value);
			formData.append('floor', form.querySelector('[name="floor"]').value);
			formData.append('builtYear', form.querySelector('[name="builtYear"]').value);
			formData.append('description', form.querySelector('[name="description"]').value);
			
			// 건물 유형
			const buildingType = document.querySelector('input[name="buildingType"]:checked');
			if (!buildingType) {
					alert('건물 유형을 선택해주세요.');
					return;
			}
			formData.append('buildingType', buildingType.value);
			
			// 방 유형
			const roomType = document.querySelector('input[name="roomType"]:checked');
			if (!roomType) {
					alert('방 유형을 선택해주세요.');
					return;
			}
			formData.append('roomType', roomType.value);
			
			// 특징
			const features = Array.from(document.querySelectorAll('input[name="features"]:checked')).map(cb => cb.value);
			features.forEach(feature => formData.append('features', feature));
			
			// 노선과 역
			if (!lineInput.value || !stationInput.value) {
					alert('노선과 역을 선택해주세요.');
					return;
			}
			formData.append('line', lineInput.value);
			formData.append('station', stationInput.value);
			
			// 주소 및 상태
			formData.append('address', form.querySelector('[name="address"]').value);
			formData.append('district', form.querySelector('[name="district"]').value);
			formData.append('shikikin', form.querySelector('[name="shikikin"]').value);
			formData.append('reikin', form.querySelector('[name="reikin"]').value);
			formData.append('status', form.querySelector('[name="status"]').value);
			formData.append('nearbyFacilities', form.querySelector('[name="nearbyFacilities"]').value);
			
			// 이미지 파일들
			const thumbnailInput = document.getElementById('thumbnailImage');
			if (thumbnailInput && thumbnailInput.files.length > 0) {
					formData.append('thumbnailImage', thumbnailInput.files[0]);
			}

			// 평면도 이미지들
			const floorplanInput = document.getElementById('floorplanImages');
			if (floorplanInput && floorplanInput.files.length > 0) {
					for (let i = 0; i < floorplanInput.files.length; i++) {
							formData.append('floorplanImages', floorplanInput.files[i]);
					}
			}

			// 건물 이미지들
			const buildingInput = document.getElementById('buildingImages');
			if (buildingInput && buildingInput.files.length > 0) {
					for (let i = 0; i < buildingInput.files.length; i++) {
							formData.append('buildingImages', buildingInput.files[i]);
					}
			}

			// 내부 이미지들
			const interiorInput = document.getElementById('interiorImages');
			if (interiorInput && interiorInput.files.length > 0) {
					for (let i = 0; i < interiorInput.files.length; i++) {
							formData.append('interiorImages', interiorInput.files[i]);
					}
			}
			
			// API 요청
			const url = propertyId ? `/api/properties/${propertyId}` : '/api/properties';
			const method = propertyId ? 'PUT' : 'POST';
			
			fetch(url, {
					method: method,
					body: formData
			})
			.then(response => {
					if (!response.ok) {
							return response.text().then(text => {
									try {
											// JSON 응답일 경우 파싱
											const errorData = JSON.parse(text);
											throw new Error(errorData.message || (propertyId ? '매물 수정에 실패했습니다.' : '매물 등록에 실패했습니다.'));
									} catch (e) {
											// JSON이 아니거나 파싱 실패한 경우
											if (e instanceof SyntaxError) {
													throw new Error(text || (propertyId ? '매물 수정에 실패했습니다.' : '매물 등록에 실패했습니다.'));
											}
											throw e;
									}
							});
					}
					return response.json();
			})
			.then(data => {
					alert(propertyId ? '매물이 성공적으로 수정되었습니다.' : '매물이 성공적으로 등록되었습니다.');
					window.parent.location.reload(); // 부모 창 새로고침
					window.frameElement.parentElement.parentElement.querySelector('.btn-close').click(); // 팝업 닫기
			})
			.catch(error => {
					console.error('Error:', error);
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

	// 노선 이름 변환 함수 추가
	function convertLineNameToJapanese(koreanName) {
			const lineNameMap = {
					'야마노테선': 'JR山手線・JR야마노테선',
					'츄오소부선': 'JR中央・総武線・JR츄오소부선',
					'사이쿄선': 'JR埼京線・JR사이쿄선',
					'죠반선': 'JR常磐線・JR죠반선',
					'타카사키선': 'JR高崎線・JR타카사키선',
					'요코스카선': 'JR横須賀線・JR요코스카선',
					'케이힌토호쿠선': 'JR京浜東北線・JR케이힌토호쿠선',
					'한조몬선': '半蔵門線・한조몬선',
					'마루노우치선': '丸ノ内線・마루노우치선',
					'히비야선': '日比谷線・히비야선',
					'토자이선': '東西線・토자이선',
					'치요다선': '千代田線・치요다선',
					'유라쿠초선': '有楽町線・유라쿠초선',
					'난보쿠선': '南北線・난보쿠선',
					'후쿠토신선': '副都心線・후쿠토신선',
					'긴자선': '銀座線・긴자선',
					'아사쿠사선': '浅草線・아사쿠사선',
					'미타선': '三田線・미타선',
					'신주쿠선': '新宿線・신주쿠선',
					'오에도선': '大江戸線・오에도선',
					'다이토선': '大東線・다이토선',
					'아라카와선': '荒川線・아라카와선'
			};
			return lineNameMap[koreanName] || koreanName;
	}
}); 