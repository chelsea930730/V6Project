package com.realestate.app.model.property;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
class PropertyImageId implements Serializable {
    private String imageUrl;
    private Long property;
}
