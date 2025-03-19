// 네비게이션바 로드
document.addEventListener('DOMContentLoaded', function() {
    // 현재 페이지 URL을 가져옵니다
    const currentPath = window.location.pathname;

    // 모든 네비게이션 링크를 가져옵니다
    const navLinks = document.querySelectorAll('.nav-link');

    // 각 링크를 순회하면서 현재 페이지와 일치하는 링크를 찾아 active 클래스를 추가합니다
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // 로그아웃 버튼 이벤트 핸들러
    const logoutBtn = document.querySelector('.logout-btn-dashboard button');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = '/user/logout';
            document.body.appendChild(form);
            form.submit();
        });
    }
}); 