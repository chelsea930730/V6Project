package com.realestate.app.property;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.validator.constraints.Length;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PropertyDto {
    
    private Long propertyId;
    
    @NotBlank(message = "매물 제목은 필수입니다")
    @Length(max = 255, message = "매물 제목은 255자를 초과할 수 없습니다")
    private String title;
    
    @NotNull(message = "월세는 필수입니다")
    @DecimalMin(value = "0.0", message = "월세는 0보다 작을 수 없습니다")
    private BigDecimal monthlyPrice;
    
    @DecimalMin(value = "0.0", message = "보증금은 0보다 작을 수 없습니다")
    private BigDecimal shikikin;
    
    @DecimalMin(value = "0.0", message = "레이킨은 0보다 작을 수 없습니다")
    private BigDecimal reikin;
    
    @NotNull(message = "관리비는 필수입니다")
    @DecimalMin(value = "0.0", message = "관리비는 0보다 작을 수 없습니다")
    private BigDecimal managementFee;
    
    @NotBlank(message = "위치는 필수입니다")
    private String location;
    
    @NotBlank(message = "지역구는 필수입니다")
    private String district;
    
    @NotBlank(message = "지하철 노선은 필수입니다")
    private String subwayLine;
    
    @NotBlank(message = "역 정보는 필수입니다")
    private String station;
    
    @NotBlank(message = "방 타입은 필수입니다")
    private String roomType;
    
    @NotNull(message = "건물 타입은 필수입니다")
    private String buildingType;
    
    @NotNull(message = "매물 상태는 필수입니다")
    private String status;
    
    @Length(max = 2000, message = "설명은 2000자를 초과할 수 없습니다")
    private String description;
    
    @Length(max = 2000, message = "상세조건은 2000자를 초과할 수 없습니다")
    private String detailDescription;

    @NotNull(message = "면적은 필수입니다")
    @DecimalMin(value = "0.0", message = "면적은 0보다 작을 수 없습니다")
    private BigDecimal area;
    
    @NotBlank(message = "건축 연도는 필수입니다")
    private String builtYear;
    
    private BigDecimal latitude;
    private BigDecimal longitude;
    
    @Length(max = 1000, message = "초기 비용 설명은 1000자를 초과할 수 없습니다")
    private String initialCost;
    
    @Length(max = 1000, message = "주변 시설 설명은 1000자를 초과할 수 없습니다")
    private String nearbyFacilities;
    
    @NotBlank(message = "층수 정보는 필수입니다")
    private String floor;
    
    private String thumbnailImage;
    private String floorplanImage;
    private String buildingImage;
    private String interiorImage;
    private String extraImage1;
    private String extraImage2;
    private Boolean reserved = false;
    
    // Property 엔티티로 변환하는 메서드
    public Property toEntity() {
        Property property = new Property();
        property.setPropertyId(this.propertyId);
        property.setTitle(this.title);
        property.setMonthlyPrice(this.monthlyPrice);
        
        // 시키킨과 레이킨이 null이면 0으로 설정
        property.setShikikin(this.shikikin != null ? this.shikikin : BigDecimal.ZERO);
        property.setReikin(this.reikin != null ? this.reikin : BigDecimal.ZERO);
        
        property.setManagementFee(this.managementFee);
        property.setLocation(this.location);
        property.setDistrict(this.district);
        property.setSubwayLine(this.subwayLine);
        property.setStation(this.station);
        property.setRoomType(this.roomType);
        property.setBuildingType(Property.BuildingType.valueOf(this.buildingType));
        property.setStatus(Property.Status.valueOf(this.status));
        property.setDescription(this.description);
        property.setDetailDescription(this.detailDescription);
        property.setArea(this.area);
        property.setBuiltYear(this.builtYear);
        property.setLatitude(this.latitude);
        property.setLongitude(this.longitude);
        property.setInitialCost(this.initialCost);
        property.setNearbyFacilities(this.nearbyFacilities);
        property.setFloor(this.floor);
        property.setThumbnailImage(this.thumbnailImage);
        property.setFloorplanImage(this.floorplanImage);
        property.setBuildingImage(this.buildingImage);
        property.setInteriorImage(this.interiorImage);
        property.setExtraImage1(this.extraImage1);
        property.setExtraImage2(this.extraImage2);
        property.setReserved(this.reserved);
        return property;
    }
    
    // Property 엔티티로부터 DTO 생성하는 정적 메서드
    public static PropertyDto fromEntity(Property property) {
        PropertyDto dto = new PropertyDto();
        dto.setPropertyId(property.getPropertyId());
        dto.setTitle(property.getTitle());
        dto.setMonthlyPrice(property.getMonthlyPrice());
        dto.setShikikin(property.getShikikin());
        dto.setReikin(property.getReikin());
        dto.setManagementFee(property.getManagementFee());
        dto.setLocation(property.getLocation());
        dto.setDistrict(property.getDistrict());
        dto.setSubwayLine(property.getSubwayLine());
        dto.setStation(property.getStation());
        dto.setRoomType(property.getRoomType());
        dto.setBuildingType(property.getBuildingType().name());
        dto.setStatus(property.getStatus().name());
        dto.setDescription(property.getDescription());
        dto.setDetailDescription(property.getDetailDescription());
        dto.setArea(property.getArea());
        dto.setBuiltYear(property.getBuiltYear());
        dto.setLatitude(property.getLatitude());
        dto.setLongitude(property.getLongitude());
        dto.setInitialCost(property.getInitialCost());
        dto.setNearbyFacilities(property.getNearbyFacilities());
        dto.setFloor(property.getFloor());
        dto.setThumbnailImage(property.getThumbnailImage());
        dto.setFloorplanImage(property.getFloorplanImage());
        dto.setBuildingImage(property.getBuildingImage());
        dto.setInteriorImage(property.getInteriorImage());
        dto.setExtraImage1(property.getExtraImage1());
        dto.setExtraImage2(property.getExtraImage2());
        dto.setReserved(property.getReserved());
        return dto;
    }

    public void setId(Long propertyId) {
    }
} 