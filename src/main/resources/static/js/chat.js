var stompClient = null;
var currentUserEmail = "";  // 초기값은 빈 문자열로 설정
var isAdmin = false; // 관리자 여부 확인 변수

function connect() {
    var socket = new SockJS('/chat');
    stompClient = Stomp.over(socket);
    
    // WebSocket 연결 시 사용자 이메일 설정
    stompClient.connect({}, function (frame) {
        console.log('Connected: ' + frame);
        
        // 연결 성공 후 frame에서 user-name 추출
        if (frame) {
            var userNameMatch = frame.toString().match(/user-name:(.*?)[\r\n]/);
            if (userNameMatch && userNameMatch[1]) {
                currentUserEmail = userNameMatch[1].trim();
                console.log('Extracted email from connection:', currentUserEmail);
                
                // 관리자 여부 확인
                isAdmin = (currentUserEmail === "admin@realestate.com");
                
                if (isAdmin) {
                    // 관리자인 경우, 유저 선택 UI 표시
                    showUserSelection();
                } else {
                    // 일반 유저인 경우, 관리자와의 채팅방 구독
                    subscribeToPrivateChat();
                }
            }
        }
        
        // 개인 메시지 구독 (모든 사용자)
        stompClient.subscribe('/user/' + currentUserEmail + '/queue/messages', function(message) {
            var chatMessage = JSON.parse(message.body);
            showMessage(chatMessage);
        });
    });

    // 이미 HTML input에서 이메일을 읽어온 경우
    var emailInput = document.getElementById('currentUserEmail');
    if (emailInput && emailInput.value) {
        currentUserEmail = emailInput.value;
        console.log('Email from input:', currentUserEmail);
        isAdmin = (currentUserEmail === "admin@realestate.com");
    }

    // URL에서 사용자 이메일 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const userEmail = urlParams.get('user');

    if (userEmail) {
        // 관리자가 특정 유저와 채팅하는 경우
        console.log('Chatting with user:', userEmail);
    }
}

// 개인 채팅방 구독
function subscribeToPrivateChat() {
    // 일반 유저는 관리자와의 채팅방만 표시
    document.getElementById('chatRoomTitle').textContent = '관리자와의 채팅';
    
    // 기존 채팅 내역 불러오기
    loadChatHistory("admin@realestate.com");
}

function sendMessage() {
    var message = document.getElementById('message').value;
    if (message.trim() !== "") {
        console.log('Sending message with sender:', currentUserEmail);
        
        var recipient = isAdmin ? getCurrentChatPartner() : "admin@realestate.com";
        
        var chatMessage = {
            message: message,
            sender: currentUserEmail,
            recipient: recipient,
            sentAt: new Date().toISOString()
        };

        // WebSocket을 통해 메시지 전송 (개인 메시지)
        stompClient.send("/app/private-chat", {}, JSON.stringify(chatMessage));
        document.getElementById('message').value = '';
        
        // 메시지를 UI에 추가 (자신이 보낸 메시지)
        showMessage(chatMessage);
    } else {
        console.error("Message cannot be empty");
    }
}

// 현재 채팅 중인 상대방 이메일 가져오기
function getCurrentChatPartner() {
    const urlParams = new URLSearchParams(window.location.search);
    const userEmail = urlParams.get('user');
    return userEmail || ""; // URL에 user 파라미터가 없으면 빈 문자열 반환
}

function showMessage(chatMessage) {
    var messagesDiv = document.getElementById('messages');
    var messageDiv = document.createElement('div');
    messageDiv.className = chatMessage.sender === currentUserEmail ? 'message sent' : 'message received';

    // 메시지 내용과 시간 추가
    if (chatMessage.sender === currentUserEmail) {
        messageDiv.innerHTML = `<strong>나:</strong> ${chatMessage.message}`;
    } else {
        messageDiv.innerHTML = `<strong>${chatMessage.sender || 'Unknown'}:</strong> ${chatMessage.message}`;
    }

    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // 스크롤을 아래로 이동
}

function startPrivateChat(userEmail) {
    // 선택한 사용자와의 개인 채팅방으로 이동
    window.location.href = `/mypage/chat.html?user=${userEmail}`;
}

// 엔터키로 메시지 전송
document.getElementById('message').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

// 채팅 기록 불러오기
function loadChatHistory(partnerEmail) {
    fetch(`/api/chat/history?partner=${partnerEmail}`)
        .then(response => response.json())
        .then(messages => {
            if (Array.isArray(messages)) {
                messages.forEach(chatMessage => {
                    showMessage(chatMessage);
                });
            } else {
                console.error("Expected an array but got:", messages);
            }
        })
        .catch(error => console.error("Error fetching chat history:", error));
}

// 페이지 로드 시 웹소켓 연결 및 이전 메시지 불러오기
document.addEventListener("DOMContentLoaded", function () {
    // 먼저 WebSocket 연결 설정
    connect();
    
    // 관리자인 경우 채팅 목록 표시, 일반 유저인 경우 관리자와의 채팅 표시
    if (currentUserEmail === "admin@realestate.com") {
        // URL에 user 파라미터가 있으면 특정 유저와의 채팅 로드
        const urlParams = new URLSearchParams(window.location.search);
        const userEmail = urlParams.get('user');
        
        if (userEmail) {
            document.getElementById('chatRoomTitle').textContent = `${userEmail}님과의 채팅`;
            loadChatHistory(userEmail);
        } else {
            // 관리자의 경우 채팅 요청 목록 표시
            showUserSelection();
        }
    }
});

// 관리자가 채팅 버튼 클릭 시 대화 선택창 표시
document.getElementById("chat-link").addEventListener("click", function(event) {
    if (currentUserEmail === "admin@realestate.com") {
        // 관리자인 경우, 이벤트를 중지하고 유저 선택 UI 표시
        event.preventDefault();
        window.location.href = "/mypage/chat-list.html"; // 채팅 목록 페이지로 이동
    }
    // 일반 유저는 기본 동작 (채팅 페이지로 이동)
});

function showUserSelection() {
    // 관리자만 사용자 선택 UI를 볼 수 있음
    if (!isAdmin) return;
    
    fetch('/api/chat/active-users') // 채팅을 요청한 사용자 목록을 가져오는 API 호출
        .then(response => response.json())
        .then(users => {
            const userSelectionDiv = document.getElementById('user-selection');
            if (!userSelectionDiv) return; // 요소가 존재하지 않으면 종료
            
            userSelectionDiv.innerHTML = '<h2>채팅 요청 목록</h2>'; // 기존 내용 초기화
            
            if (users.length === 0) {
                userSelectionDiv.innerHTML += '<p>현재 채팅 요청이 없습니다.</p>';
                return;
            }
            
            users.forEach(user => {
                const button = document.createElement('button');
                button.className = 'chat-user-btn';
                button.innerText = `${user.email}님과 채팅하기`;
                button.onclick = function() {
                    startPrivateChat(user.email);
                };
                userSelectionDiv.appendChild(button);
            });
        })
        .catch(error => console.error("Error fetching active users:", error));
}
