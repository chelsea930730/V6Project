package com.realestate.app.config;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import com.realestate.app.user.User;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Map;

public class AuthenticatedUser implements UserDetails, OAuth2User {
    private User user;
    private Map<String, Object> attributes;

    // UserDetailsService에서 리턴 값으로 사용
    public AuthenticatedUser(User user) {
        this.user = user;
    }
    
    // OAuth2UserService에서 리턴 값으로 사용
    public AuthenticatedUser(User user, Map<String, Object> attributes) {
        this.user = user;
        this.attributes = attributes;
    }

    // User 객체를 반환하는 메서드
    public User getUser() {
        return this.user;
    }

    // 사용자의 권한 정보 반환
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Collection<GrantedAuthority> authorities = new ArrayList<>();
        // "ROLE_" 접두사 추가
        authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
        return authorities;
    }
    
    @Override
    public String getPassword() {
        return user.getPassword();
    }
    
    @Override
    public String getUsername() {
        return user.getEmail();
    }

    // UserDetails 필수 메서드 구현
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }
    
    @Override
    public String getName() {
        return user.getName();
    }
    
    // 이 사용자가 OAuth2 사용자인지 확인하는 헬퍼 메서드
    public boolean isOAuth2User() {
        return attributes != null;
    }
}
