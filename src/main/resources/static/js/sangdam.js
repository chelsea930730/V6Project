document.addEventListener('DOMContentLoaded', function() {
  const sangdamForm = document.getElementById('sangdamForm');
  
  if (sangdamForm) {
      sangdamForm.addEventListener('submit', function(event) {
          if (!confirm('이대로 제출하시겠습니까?')) {
              event.preventDefault(); // 사용자가 취소를 누른 경우에만 제출 중지
              return;
          }
          // 확인을 누른 경우 자연스럽게 폼 제출 진행
      });
  }
});