package com.realestate.app.property;

import lombok.Getter;

@Getter
public enum BuildingType {
    아파트("아파트"),
    맨션("맨션"),
    타운하우스("타운하우스"),
    오피스텔("오피스텔"),
    셰어하우스("셰어하우스");

    private final String value;

    BuildingType(String value) {
        this.value = value;
    }

}