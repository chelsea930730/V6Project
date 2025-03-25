package com.realestate.app.reservation;

public enum ReservationStatus {
    PENDING("대기중"),
    CANCELLED("예약취소"),
    COMPLETED("상담완료");
    
    private final String displayName;
    
    ReservationStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
