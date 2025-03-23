package com.realestate.app.user;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.web.bind.annotation.BindParam;

import java.time.LocalDateTime;

// 사용자(User) 엔티티
@Entity
@Table(name = "User")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "password") // toString에서 비밀번호 제외
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(unique = true)
    private String email;
    
    private String password;
    private String name;
    private String phone;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Enumerated(EnumType.STRING)
    private Provider provider = Provider.LOCAL;

    private LocalDateTime createdAt = LocalDateTime.now();
}


