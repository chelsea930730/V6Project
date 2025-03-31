package com.realestate.app.property;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

/**
 * 부동산 매물 데이터 전송 객체
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PropertyDto {
    private Long id;
    private String title;
    private String location;
    private String district;
    private String subwayLine;
    private String roomType;
    private BuildingType buildingType;
    private Status status;
    private String description;
    private BigDecimal area;
    private String builtYear;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private BigDecimal monthlyPrice;
    private BigDecimal shikikin;
    private BigDecimal reikin;
    private BigDecimal managementFee;
    private String thumbnailImage;
    private Boolean reserved;
    // 03.31 수정사항 포함
} 