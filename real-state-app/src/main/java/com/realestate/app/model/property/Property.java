package com.realestate.app.model.property;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Property")
public class Property {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long propertyId;

    private String title;
    private BigDecimal monthlyPrice;
    private int shikikin;
    private int reikin;
    private int managementFee;
    private String location;
    private String district;
    private String subwayLine;
    private String roomType;

    @Enumerated(EnumType.STRING)
    private BuildingType buildingType;

    @Enumerated(EnumType.STRING)
    private Status status;

    private String description;
    private BigDecimal area;
    private int builtYear;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private LocalDateTime createdAt = LocalDateTime.now();
}

enum BuildingType {
    APARTMENT, HOUSE, OFFICE
}

enum Status {
    AVAILABLE, RESERVED, SOLD
}
