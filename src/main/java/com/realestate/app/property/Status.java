package com.realestate.app.property;

import lombok.Getter;

@Getter
public enum Status {
    예약중("예약중"),
    거래완료("거래완료"),
    예약가능("예약가능");

    private final String value;

    Status(String value) {
        this.value = value;
    }

}