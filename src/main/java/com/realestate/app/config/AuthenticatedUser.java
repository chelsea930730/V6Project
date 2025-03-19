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

    //UserDetailsService 에서 리턴 값으로 사용
    public AuthenticatedUser(User user) {
        this.user = user;
    }
    //OAuth2UserService 에서 리턴 값으로 사용
    public AuthenticatedUser(User user, Map<String, Object> attributes) {
        this.user = user;
        this.attributes = attributes;
    }


    // 사용자의 권한 정보를 리턴한다.
    @Override
    //Collection 타입 <제네릭:타입 지정>
    // ? : 타입을 제한하지 않는다
    // 조건 : GrantedAuthority 타입을 상속받은 객체면 누구나 들어올 수 있다.
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Collection<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
        return authorities;
    }
    // 사용자의 패스워드 정보를 리턴한다.
    @Override
    public String getPassword() {
        return user.getPassword();
    }
    // 사용자의 로그인 아이디 정보를 리턴한다.
    @Override
    public String getUsername() {
        return user.getEmail();
    }

    // 사용자 계정의 사용기한이 만료되지 않았는지를 리턴
//    @Override
//    public boolean isAccountNonExpired() {
//        return true;
//    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }
    @Override
    public String getName() {
        return user.getName();
    }
}
