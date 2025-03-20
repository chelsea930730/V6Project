package com.realestate.app.chat;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.HashMap;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    @Autowired
    public ChatController(SimpMessagingTemplate messagingTemplate, ChatService chatService) {
        this.messagingTemplate = messagingTemplate;
        this.chatService = chatService;
    }

    @GetMapping("/mypage/chat.html")
    public String chat(Model model, Principal principal) {
        if (principal != null) {
            model.addAttribute("currentUserEmail", principal.getName());
        }
        return "mypage/chat"; // chat.html 파일의 경로
    }

    @GetMapping("/mypage/chat-list.html")
    public String chatList(Model model, Principal principal) {
        if (principal != null) {
            model.addAttribute("currentUserEmail", principal.getName());
        }
        return "mypage/chat-list"; // chat-list.html 파일의 경로
    }

    // 개인 메시지 전송
    @MessageMapping("/private-chat")
    public void sendPrivateMessage(@Payload ChatMessage chatMessage) {
        if (chatMessage.getMessage() == null || chatMessage.getMessage().trim().isEmpty()) {
            throw new IllegalArgumentException("Message content cannot be null or empty");
        }

        // 메시지를 데이터베이스에 저장
        chatService.saveMessage(chatMessage);

        // 수신자에게 메시지 전송
        String recipient = chatMessage.getRecipient();
        if (recipient != null && !recipient.isEmpty()) {
            messagingTemplate.convertAndSendToUser(
                    recipient, "/queue/messages", chatMessage);
        }
    }

    // 특정 사용자와의 채팅 기록 가져오기
    @GetMapping("/api/chat/history")
    @ResponseBody
    public List<ChatMessage> getChatHistory(@RequestParam String partner, Principal principal) {
        if (principal == null) return List.of();

        String currentUser = principal.getName();
        return chatService.getChatHistoryBetweenUsers(currentUser, partner);
    }

    // 채팅을 요청한 사용자 목록 가져오기 (관리자용)
    @GetMapping("/api/chat/active-users")
    @ResponseBody
    public List<Map<String, Object>> getActiveUsers(Principal principal) {
        if (principal == null || !principal.getName().equals("admin@realestate.com")) {
            return List.of(); // 관리자가 아니면 빈 리스트 반환
        }

        // 관리자에게 메시지를 보낸 모든 사용자 목록
        return chatService.getUsersWhoMessagedAdmin().stream()
                .map(user -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("email", user.getEmail());
                    userMap.put("lastMessage", chatService.getLastMessageBetweenUsers("admin@realestate.com", user.getEmail()).getMessage());
                    userMap.put("lastMessageTime", chatService.getLastMessageBetweenUsers("admin@realestate.com", user.getEmail()).getSentAt());
                    return userMap;
                })
                .collect(Collectors.toList());
    }

    // 채팅방 삭제 API
    @DeleteMapping("/api/chat/delete")
    @ResponseBody
    public ResponseEntity<?> deleteChatRoom(@RequestParam String partner, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        String currentUser = principal.getName();
        try {
            chatService.deleteChatHistory(currentUser, partner);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}