package com.realestate.app.chat;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        // 사용자 인증 로직 (예: 사용자 이름과 비밀번호 확인)
        // ...

        // 인증 성공 시 사용자 이메일 반환
        String userEmail = "user@example.com"; // 실제로는 데이터베이스에서 가져온 이메일
        return ResponseEntity.ok(new LoginResponse(userEmail));
    }
}