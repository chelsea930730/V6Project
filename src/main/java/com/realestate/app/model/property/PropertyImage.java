package com.realestate.app.model.property;

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
}
