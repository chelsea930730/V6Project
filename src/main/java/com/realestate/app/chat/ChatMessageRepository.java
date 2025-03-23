package com.realestate.app.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findAllByOrderBySentAtAsc(); // sentAt으로 변경

    // 두 사용자 간의 채팅 기록 가져오기
    List<ChatMessage> findBySenderAndRecipientOrSenderAndRecipientOrderBySentAtAsc(
            String sender1, String recipient1, String sender2, String recipient2);

    // 두 사용자 간의 마지막 메시지 가져오기
    Optional<ChatMessage> findTopBySenderAndRecipientOrSenderAndRecipientOrderBySentAtDesc(
            String sender1, String recipient1, String sender2, String recipient2);

    // 특정 수신자에게 메시지를 보낸 모든 사용자(발신자) 목록 가져오기
    @Query("SELECT DISTINCT c.sender FROM ChatMessage c WHERE c.recipient = :recipient")
    List<String> findDistinctSendersByRecipient(@Param("recipient") String recipient);

    // 추가적인 쿼리 메서드 정의 가능

    void deleteBySenderAndRecipientOrSenderAndRecipient(
            String sender1, String recipient1, String sender2, String recipient2);

    @Modifying
    @Transactional
    @Query("DELETE FROM ChatMessage c WHERE (c.sender = :sender1 AND c.recipient = :recipient1) OR (c.sender = :sender2 AND c.recipient = :recipient2)")
    void deleteAllBySenderAndRecipientOrSenderAndRecipient(
            @Param("sender1") String sender1, 
            @Param("recipient1") String recipient1, 
            @Param("sender2") String sender2, 
            @Param("recipient2") String recipient2);
}
