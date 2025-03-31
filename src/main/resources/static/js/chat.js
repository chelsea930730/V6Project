var stompClient = null;
var currentUserEmail = "";  // 초기값은 빈 문자열로 설정
var isAdmin = false; // 관리자 여부 확인 변수
var pendingUrl = null; // 첨부할 URL

// 채팅 목록에서 읽지 않은 메시지 표시를 위한 시뮬레이션 변수
var unreadMessageCounts = {};
var lastSeenTimestamps = {};

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
    
    // URL이 있으면 URL 전송
    if (pendingUrl) {
        sendUrlMessage(pendingUrl);
        pendingUrl = null;
        document.getElementById('urlInputContainer').style.display = 'none';
        document.getElementById('urlInput').value = '';
        document.getElementById('message').value = '';
        return;
    }
    
    if (message.trim() !== "") {
        console.log('Sending message with sender:', currentUserEmail);
        
        var recipient = isAdmin ? getCurrentChatPartner() : "admin@realestate.com";
        
        // 로컬호스트 URL 패턴도 포함하는 정규식
        const urlPattern = /(https?:\/\/(?:localhost|127\.0\.0\.1|[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::\d+)?(?:\/[^\s]*)?)/gi;
        const isUrl = urlPattern.test(message);
        
        var chatMessage = {
            message: message,
            sender: currentUserEmail,
            recipient: recipient,
            sentAt: new Date().toISOString(),
            type: isUrl ? "url" : "text" // URL이면 타입을 url로 설정
        };

        // WebSocket을 통해 메시지 전송
        stompClient.send("/app/private-chat", {}, JSON.stringify(chatMessage));
        document.getElementById('message').value = '';
        
        // 메시지를 UI에 추가
        showMessage(chatMessage);
    } else {
        console.error("Message cannot be empty");
    }
}

// URL 메시지 전송 함수
function sendUrlMessage(url) {
    // 로컬호스트나 IP 주소도 허용하는 URL 체크
    if (!url.match(/^https?:\/\//i)) {
        url = "http://" + url;
    }
    
    console.log('Sending URL with sender:', currentUserEmail);
    
    var recipient = isAdmin ? getCurrentChatPartner() : "admin@realestate.com";
    
    var chatMessage = {
        message: url,
        sender: currentUserEmail,
        recipient: recipient,
        sentAt: new Date().toISOString(),
        type: "url"
    };

    // WebSocket을 통해 메시지 전송
    stompClient.send("/app/private-chat", {}, JSON.stringify(chatMessage));
    
    // 메시지를 UI에 추가
    showMessage(chatMessage);
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
    
    // 시간 포맷팅
    let sentTime = '';
    if (chatMessage.sentAt) {
        const date = new Date(chatMessage.sentAt);
        sentTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    // 메시지 타입에 따른 내용 표시
    let messageContent = '';
    
    if (chatMessage.type === "url") {
        // URL 메시지 처리 - 로컬호스트 URL도 감지
        let url = chatMessage.message;
        if (!url.match(/^https?:\/\//i)) {
            url = "http://" + url;
        }
        messageContent = `<a href="${url}" class="message-url" target="_blank">${chatMessage.message}</a>`;
    } else {
        // 일반 텍스트 메시지 처리 - URL 자동 감지
        messageContent = autoDetectLinks(chatMessage.message);
    }

    // 메시지 내용과 시간 추가
    messageDiv.innerHTML = `
        <div class="message-content">${messageContent}</div>
        <span class="message-time">${sentTime}</span>
    `;

    // 애니메이션 효과를 위한 클래스 추가
    messageDiv.classList.add('message-animation');
    
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // 스크롤을 아래로 이동
}

function startPrivateChat(userEmail) {
    // 읽음 상태로 변경
    unreadMessageCounts[userEmail] = 0;
    
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
    
    // chat.html인지 chat-list.html인지 확인
    const isChatListPage = window.location.pathname.includes('chat-list.html');
    const isChatPage = window.location.pathname.includes('chat.html');
    
    // 관리자인 경우 처리
    if (currentUserEmail === "admin@realestate.com") {
        if (isChatPage) {
            // user-selection 영역 제거 (숨기기)
            const userSelectionDiv = document.getElementById('user-selection');
            if (userSelectionDiv) {
                userSelectionDiv.style.display = 'none';
            }
            
            // URL에 user 파라미터가 있으면 특정 유저와의 채팅 로드
            const urlParams = new URLSearchParams(window.location.search);
            const userEmail = urlParams.get('user');
            
            if (userEmail) {
                document.getElementById('chatRoomTitle').textContent = `${userEmail}님과의 채팅`;
                loadChatHistory(userEmail);
                
                // 읽음 상태로 업데이트
                unreadMessageCounts[userEmail] = 0;
            } else {
                // user 파라미터가 없으면 chat-list.html로 리다이렉트
                window.location.href = '/mypage/chat-list.html';
            }
        } 
        else if (isChatListPage) {
            // chat-list.html 페이지에서만 사용자 선택 UI 표시
            showUserSelection();
        }
    } else {
        // 일반 유저는 관리자와의 채팅방으로 설정
        if (isChatPage) {
            document.getElementById('chatRoomTitle').textContent = '관리자와의 채팅';
            loadChatHistory("admin@realestate.com");
        }
    }
    
    // URL 버튼 클릭 이벤트
    document.getElementById("urlButton").addEventListener("click", function() {
        const urlContainer = document.getElementById("urlInputContainer");
        if (urlContainer.style.display === 'block') {
            urlContainer.style.display = 'none';
            this.classList.remove('active');
        } else {
            urlContainer.style.display = 'block';
            document.getElementById("urlInput").focus();
            this.classList.add('active');
        }
    });
    
    // URL 추가 버튼 클릭 이벤트
    document.getElementById("addUrlBtn").addEventListener("click", function() {
        const url = document.getElementById("urlInput").value.trim();
        if (url) {
            pendingUrl = url;
            document.getElementById("message").placeholder = `URL 첨부됨: ${url}`;
            document.getElementById("urlInputContainer").style.display = 'none';
            document.getElementById("urlButton").classList.add('active');
        } else {
            alert("URL을 입력해주세요.");
        }
    });
    
    // URL 입력창 닫기 버튼
    document.getElementById("closeUrlInput").addEventListener("click", function() {
        document.getElementById("urlInputContainer").style.display = 'none';
        document.getElementById("urlButton").classList.remove('active');
        pendingUrl = null;
        document.getElementById("message").placeholder = "메시지를 입력하세요...";
    });
    
    // URL 입력 필드에서 엔터키 누르면 URL 추가
    document.getElementById("urlInput").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            document.getElementById("addUrlBtn").click();
        }
    });
    
    // 채팅 입력 필드에서 엔터키 누르면 메시지 전송
    document.getElementById("message").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }
    });
    
    // 스타일 직접 추가
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .unread-chat {
            background-color: #e6f2ff !important; /* 더 밝은 파란색 배경 */
            border-left: 4px solid #0084ff !important; /* 페이스북 메신저 스타일 파란색 테두리 */
        }

        .unread-chat .user-email,
        .unread-chat .last-message {
            font-weight: bold !important;
            color: #1c1e21 !important;
        }

        .unread-indicator {
            display: none !important;
        }
        
        .chat-user-item {
            transition: all 0.2s ease;
            border-left: 4px solid transparent;
            margin-bottom: 8px;
            padding: 12px;
            border-radius: 8px;
        }
        
        .chat-user-item:hover {
            background-color: #f7f8fa !important;
        }
    `;
    document.head.appendChild(styleElement);
});

// 관리자가 채팅 버튼 클릭 시 chat-list.html로 이동
const chatLink = document.getElementById("chat-link");
if (chatLink) {
    chatLink.addEventListener("click", function(event) {
        if (currentUserEmail === "admin@realestate.com") {
            // 관리자인 경우, 이벤트를 중지하고 채팅 목록 페이지로 이동
            event.preventDefault();
            window.location.href = "/mypage/chat-list.html";
        }
        // 일반 유저는 기본 동작 (채팅 페이지로 이동)
    });
}

function showUserSelection() {
    // 관리자만 사용자 선택 UI를 볼 수 있음
    if (!isAdmin) return;
    
    fetch('/api/chat/active-users')
        .then(response => response.json())
        .then(users => {
            const userSelectionDiv = document.getElementById('user-selection');
            if (!userSelectionDiv) return; // 요소가 존재하지 않으면 종료
            
            userSelectionDiv.innerHTML = '<h2>채팅 요청 목록</h2>'; // 기존 내용 초기화
            
            if (users.length === 0) {
                userSelectionDiv.innerHTML += '<p>현재 채팅 요청이 없습니다.</p>';
                return;
            }
            
            // 최신 메시지 순으로 정렬 (lastMessageTime 기준)
            users.sort((a, b) => {
                const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
                const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
                return timeB - timeA; // 내림차순 정렬 (최신이 위로)
            });
            
            // 읽지 않은 메시지 우선 정렬
            users.sort((a, b) => {
                const unreadA = unreadMessageCounts[a.email] || 0;
                const unreadB = unreadMessageCounts[b.email] || 0;
                return unreadB - unreadA; // 읽지 않은 메시지가 있는 채팅방 우선
            });
            
            users.forEach(user => {
                // 읽음 상태 시뮬레이션 (처음 로드 시)
                if (unreadMessageCounts[user.email] === undefined) {
                    // 더 높은 확률(40%)로 읽지 않은 상태로 설정
                    unreadMessageCounts[user.email] = Math.random() > 0.6 ? 1 : 0;
                    lastSeenTimestamps[user.email] = new Date().getTime();
                }
                
                // 읽지 않은 메시지가 있으면 CSS 클래스 추가
                const isUnread = unreadMessageCounts[user.email] > 0;
                const unreadClass = isUnread ? 'unread-chat' : '';
                
                const userItem = document.createElement('div');
                userItem.className = `chat-user-item ${unreadClass}`;
                
                // 읽지 않은 메시지가 있으면 추가 아이콘 표시
                const unreadIndicator = isUnread ? '<div class="unread-dot"></div>' : '';
                
                userItem.innerHTML = `
                    <div class="user-info">
                        <div class="user-name-container">
                            <span class="user-email">${user.email}</span>
                            ${unreadIndicator}
                        </div>
                        <span class="last-message-time">${formatTime(user.lastMessageTime)}</span>
                    </div>
                    <div class="last-message">${user.lastMessage || '새로운 채팅'}</div>
                    <div class="buttons-container">
                        <button class="start-chat-btn" onclick="startPrivateChat('${user.email}')">채팅하기</button>
                        <button class="delete-chat-btn" onclick="showDeleteConfirm('${user.email}')">삭제하기</button>
                    </div>
                `;
                userSelectionDiv.appendChild(userItem);
            });
            
            // 읽지 않은 메시지 표시를 위한 추가 스타일
            const unreadDotStyle = document.createElement('style');
            unreadDotStyle.textContent = `
                .unread-dot {
                    width: 10px;
                    height: 10px;
                    background-color: #0084ff;
                    border-radius: 50%;
                    display: inline-block;
                    margin-left: 8px;
                    animation: pulse 2s infinite;
                }
                
                @keyframes pulse {
                    0% {
                        transform: scale(0.95);
                        box-shadow: 0 0 0 0 rgba(0, 132, 255, 0.7);
                    }
                    70% {
                        transform: scale(1);
                        box-shadow: 0 0 0 5px rgba(0, 132, 255, 0);
                    }
                    100% {
                        transform: scale(0.95);
                        box-shadow: 0 0 0 0 rgba(0, 132, 255, 0);
                    }
                }
            `;
            document.head.appendChild(unreadDotStyle);
        })
        .catch(error => console.error("Error fetching active users:", error));
}

// 시간 포맷팅 함수
function formatTime(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    // 오늘 이내의 메시지는 시:분 형식으로
    if (diffDays < 1) {
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    // 일주일 이내는 요일로
    else if (diffDays < 7) {
        const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
        return weekdays[date.getDay()] + '요일';
    }
    // 그 이상은 날짜로
    else {
        return `${date.getMonth() + 1}/${date.getDate()}`;
    }
}

// 삭제 확인 팝업을 표시하는 함수 추가
function showDeleteConfirm(userEmail) {
    const deleteModal = document.getElementById('deleteModal');
    if (!deleteModal) {
        // 모달이 없으면 생성
        createDeleteModal();
    }
    
    // 삭제할 사용자 정보 저장
    window.userToDelete = userEmail;
    
    // 모달 텍스트 업데이트
    const modalText = document.querySelector('#deleteModal p');
    if (modalText) {
        modalText.textContent = `${userEmail}님과의 채팅방을 삭제하시겠습니까?`;
    }
    
    // 모달 표시
    document.getElementById('deleteModal').style.display = 'flex';
}

// 필요한 경우 삭제 모달을 동적으로 생성
function createDeleteModal() {
    const modalHTML = `
        <div id="deleteModal" class="modal">
            <div class="modal-content">
                <h3>채팅방 삭제</h3>
                <p>채팅방을 삭제하시겠습니까?</p>
                <div class="modal-buttons">
                    <button id="confirmDelete" class="confirm-btn">예</button>
                    <button id="cancelDelete" class="cancel-btn">아니오</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // 이벤트 리스너 추가
    document.getElementById('confirmDelete').addEventListener('click', confirmDeleteChat);
    document.getElementById('cancelDelete').addEventListener('click', function() {
        document.getElementById('deleteModal').style.display = 'none';
    });
    
    // 모달 외부 클릭 시 닫기
    document.getElementById('deleteModal').addEventListener('click', function(event) {
        if (event.target === this) {
            this.style.display = 'none';
        }
    });
}

// 삭제 확인 버튼 클릭 시 실행할 함수
function confirmDeleteChat() {
    if (!window.userToDelete) return;
    
    // 채팅방 삭제 API 호출
    fetch(`/api/chat/delete?partner=${window.userToDelete}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            // 삭제 성공 시 채팅 목록 새로고침
            showUserSelection();
            document.getElementById('deleteModal').style.display = 'none';
        } else {
            alert('채팅방 삭제에 실패했습니다.');
            document.getElementById('deleteModal').style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Error deleting chat room:', error);
        alert('채팅방 삭제 중 오류가 발생했습니다.');
        document.getElementById('deleteModal').style.display = 'none';
    });
}

// 기존 모달 관련 코드 수정
document.addEventListener('DOMContentLoaded', function() {
    // 기존 이벤트 리스너 삭제 및 재설정
    const deleteModal = document.getElementById('deleteModal');
    const confirmDelete = document.getElementById('confirmDelete');
    const cancelDelete = document.getElementById('cancelDelete');
    
    if (deleteModal) {
        // 이미 존재하는 경우에만 이벤트 설정
        if (confirmDelete) {
            confirmDelete.removeEventListener('click', confirmDeleteChat);
            confirmDelete.addEventListener('click', confirmDeleteChat);
        }
        
        if (cancelDelete) {
            cancelDelete.addEventListener('click', function() {
                deleteModal.style.display = 'none';
            });
        }
        
        // 모달 외부 클릭 시 닫기
        deleteModal.addEventListener('click', function(event) {
            if (event.target === this) {
                this.style.display = 'none';
            }
        });
    }
});

// URL 자동 감지 및 링크 변환 함수 (더 포괄적인 패턴)
function autoDetectLinks(text) {
    // 더 포괄적인 URL 패턴 (로컬호스트, IP 주소 포함)
    const urlPattern = /(https?:\/\/(?:localhost|127\.0\.0\.1|[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::\d+)?(?:\/[^\s]*)?)/gi;
    
    return text.replace(urlPattern, function(url) {
        return `<a href="${url}" class="message-url" target="_blank">${url}</a>`;
    });
}