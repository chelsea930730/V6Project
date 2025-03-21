package com.realestate.app.chat;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ChatController {
    // 이 기능은 제가 구현하겠습니다

    @MessageMapping("/chat")
    @SendTo("/topic/messages")
    public String sendMessage(String message) {
        return message; // 받은 메시지를 그대로 반환
    }

    // 채팅 페이지로 이동하는 메서드 수정
    @GetMapping("/chat.html")
    public String chatPage() {
        return "mypage/chat"; // templates/mypage/chat.html 페이지로 이동
    }
}
