package com.realestate.app.reservation;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

public class SecurityUtils {
    /**
     * 현재 로그인한 사용자의 이메일을 반환합니다.
     * @return 사용자 이메일 또는, 로그인하지 않은 경우 null
     */
    public static String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() &&
                !(authentication.getPrincipal() instanceof String) &&
                authentication.getPrincipal() instanceof UserDetails) {
            return ((UserDetails) authentication.getPrincipal()).getUsername();
        }
        return null;
    }

    /**
     * 현재 사용자가 특정 역할을 가지고 있는지 확인합니다.
     * @param role 확인할 역할 (예: "ROLE_ADMIN")
     * @return 해당 역할을 가지고 있으면 true, 그렇지 않으면 false
     */
    public static boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals(role));
    }
}