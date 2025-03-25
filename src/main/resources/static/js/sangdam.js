document.addEventListener('DOMContentLoaded', function() {
  const sangdamForm = document.getElementById('sangdamForm');
  
  if (sangdamForm) {
      sangdamForm.addEventListener('submit', function(event) {
          event.preventDefault(); // 기본 제출 동작 중지
          
          // 확인 대화상자 표시
          if (confirm('이대로 제출하시겠습니까?')) {
              // 사용자가 확인을 누른 경우 폼 제출
              this.submit();
              alert('상담폼이 제출되었습니다.');
          }
      });
  }
});