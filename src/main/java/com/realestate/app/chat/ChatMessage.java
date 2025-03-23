package com.realestate.app.chat;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_message") // 테이블 이름 지정
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // 단일 ID 필드

    @Column(name = "message", nullable = false, columnDefinition = "LONGTEXT") // LONGTEXT로 변경
    private String message; // 메시지 내용

    @Column(nullable = false) // null을 허용하지 않도록 설정
    private String sender; // 보낸 사람

    @Column(nullable = false) // null을 허용하지 않도록 설정
    private String recipient; // 수신자 필드 추가

    @Column(nullable = false) // null을 허용하지 않도록 설정
    private LocalDateTime sentAt; // 메시지 전송 시간

    @Column(nullable = true) // 메시지 타입 추가
    private String type; // 메시지 타입 (text, image, url)

    // 기본 생성자
    public ChatMessage() {}

    // 생성자
    public ChatMessage(String message, String sender, LocalDateTime sentAt) {
        this.message = message;
        this.sender = sender;
        this.sentAt = sentAt;
        this.type = "text"; // 기본 타입은 텍스트
    }

    // 추가 생성자
    public ChatMessage(String message, String sender, String recipient, LocalDateTime sentAt) {
        this.message = message;
        this.sender = sender;
        this.recipient = recipient;
        this.sentAt = sentAt;
        this.type = "text"; // 기본 타입은 텍스트
    }

    // 타입이 포함된 생성자
    public ChatMessage(String message, String sender, String recipient, LocalDateTime sentAt, String type) {
        this.message = message;
        this.sender = sender;
        this.recipient = recipient;
        this.sentAt = sentAt;
        this.type = type;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getRecipient() {
        return recipient;
    }

    public void setRecipient(String recipient) {
        this.recipient = recipient;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
