package com.realestate.app.model.property;

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
    private BigDecimal area;

    @Column(name = "built_year")
    private String builtYear; // '2001년'과 같은 문자열 형태 저장

    private BigDecimal latitude;
    private BigDecimal longitude;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}

enum BuildingType {
    APARTMENT,
    HOUSE,
    OFFICE,
    맨션   // 인서트문에서 '맨션' 값을 위해 추가
}

enum Status {
    AVAILABLE,
    RESERVED,
    SOLD,
    예약가능  // 인서트문에서 '예약가능' 값을 위해 추가
}
