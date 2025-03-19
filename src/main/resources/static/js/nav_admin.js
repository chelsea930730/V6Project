// 네비게이션바 로드
document.addEventListener('DOMContentLoaded', function() {
    fetch('nav_admin.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('nav-placeholder').innerHTML = data;
            
            // 현재 페이지 URL을 가져와서 해당하는 네비게이션 링크를 활성화
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            const navLinks = document.querySelectorAll('.nav-link');
            
            navLinks.forEach(link => {
                if (link.getAttribute('href') === currentPage) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        });
}); 