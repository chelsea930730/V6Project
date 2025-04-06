package com.realestate.app.property;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "property")
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long propertyId;

    @Column(name = "property_title")
    private String title;

    @Column(name = "monthly_price")
    private BigDecimal monthlyPrice;

    @Column(name = "shikikin")
    private BigDecimal shikikin;

    @Column(name = "reikin")
    private BigDecimal reikin;

    @Column(name = "management_fee")
    private BigDecimal managementFee;

    private String location;
    private String district;

    @Column(name = "subway_line")
    private String subwayLine;

    @Column(name = "room_type")
    private String roomType;

    @Enumerated(EnumType.STRING)
    @Column(name = "building_type")
    private BuildingType buildingType;

    @Enumerated(EnumType.STRING)
    private Status status;

    private String description;
    
    @Column(name = "detail_description", columnDefinition = "TEXT")
    private String detailDescription;
    
    private BigDecimal area;

    @Column(name = "built_year")
    private String builtYear; // '2001년'과 같은 문자열 형태 저장

    @Column(precision = 20, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 20, scale = 7)
    private BigDecimal longitude;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "initial_cost", columnDefinition = "TEXT")
    private String initialCost;

    @Column(name = "nearby_facilities", columnDefinition = "TEXT")
    private String nearbyFacilities;

    @Column(name = "station")
    private String station;  // 역 정보

    @Column(name = "floor")
    private String floor;    // 층수 정보

    @Column(name = "thumbnail_image")
    private String thumbnailImage;  // 썸네일 이미지 URL

    @Column(name = "is_reserved")
    private Boolean reserved = false;

    @Column(name = "floorplan_image")
    private String floorplanImage;  // 평면도 이미지 URL

    @Column(name = "building_image")
    private String buildingImage;  // 건물 외관 이미지 URL

    @Column(name = "interior_image")
    private String interiorImage;  // 내부 이미지 URL
    @Column(name = "extra_image1")
    private String extraImage1;  // 내부 이미지 URL
    @Column(name = "extra_image2")
    private String extraImage2;  // 내부 이미지 URL
    
    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

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

        public String getValue() {
            return value;
        }
    }

    public enum Status {
        예약중("예약중"),
        거래완료("거래완료"),
        예약가능("예약가능");

        private final String value;

        Status(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }
    }

    public Boolean getReserved() {
        return reserved == null ? false : reserved;
    }

    public void setReserved(Boolean reserved) {
        this.reserved = reserved;
    }
}
