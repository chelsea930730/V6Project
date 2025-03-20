package com.realestate.app.chat;

import com.realestate.app.user.User;
import com.realestate.app.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private UserRepository userRepository;

    public void saveMessage(ChatMessage chatMessage) {
        chatMessage.setSentAt(LocalDateTime.now()); // 현재 시간 설정
        chatMessageRepository.save(chatMessage); // 메시지를 데이터베이스에 저장
    }

    public List<ChatMessage> getAllMessages() {
        return chatMessageRepository.findAll(); // 모든 메시지를 가져오는 메서드
    }

    // 두 사용자 간의 채팅 기록 가져오기
    public List<ChatMessage> getChatHistoryBetweenUsers(String user1, String user2) {
        return chatMessageRepository.findBySenderAndRecipientOrSenderAndRecipientOrderBySentAtAsc(
                user1, user2, user2, user1);
    }

    // 관리자에게 메시지를 보낸 사용자 목록 가져오기
    public List<User> getUsersWhoMessagedAdmin() {
        List<String> userEmails = chatMessageRepository.findDistinctSendersByRecipient("admin@realestate.com");
        return userRepository.findByEmailIn(userEmails);
    }

    // 두 사용자 간의 마지막 메시지 가져오기
    public ChatMessage getLastMessageBetweenUsers(String user1, String user2) {
        return chatMessageRepository.findTopBySenderAndRecipientOrSenderAndRecipientOrderBySentAtDesc(
                        user1, user2, user2, user1)
                .orElse(new ChatMessage("새 채팅이 시작되었습니다.", "시스템", LocalDateTime.now()));
    }

    // 두 사용자 간의 채팅 기록 삭제
    @Transactional
    public void deleteChatHistory(String user1, String user2) {
        try {
            List<ChatMessage> messages = chatMessageRepository.findBySenderAndRecipientOrSenderAndRecipientOrderBySentAtAsc(
                    user1, user2, user2, user1);
            
            if (!messages.isEmpty()) {
                chatMessageRepository.deleteAll(messages);
            }
        } catch (Exception e) {
            throw new RuntimeException("채팅 기록 삭제 중 오류 발생: " + e.getMessage(), e);
        }
    }
}