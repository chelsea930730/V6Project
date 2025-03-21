package com.realestate.app.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

//유저 관련
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    // 이메일 목록으로 사용자 찾기
    List<User> findByEmailIn(List<String> emails);
}
