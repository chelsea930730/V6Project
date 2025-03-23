package com.realestate.app.chat;

public class LoginResponse {
    private String email;

    public LoginResponse(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}