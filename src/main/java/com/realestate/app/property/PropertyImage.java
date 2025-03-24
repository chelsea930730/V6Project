package com.realestate.app.property;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@IdClass(PropertyImageId.class)
@Table(name = "PropertyImage")
public class PropertyImage {
    @Id
    private String imageUrl;

    @Id
    @ManyToOne
    @JoinColumn(name = "property_id")
    private Property property;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "image_type")
    private ImageType imageType;
    
    // 이미지 타입 Enum
    public enum ImageType {
        FLOORPLAN, // 도면
        BUILDING,  // 건물 외관
        INTERIOR   // 내부
    }
}
