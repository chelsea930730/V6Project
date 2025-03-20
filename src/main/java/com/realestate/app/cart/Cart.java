package com.realestate.app.cart;

import com.realestate.app.property.Property;
import com.realestate.app.user.User;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@IdClass(CartId.class)
@Table(name = "Cart")
public class Cart {
    @Id
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Id
    @ManyToOne
    @JoinColumn(name = "property_id")
    private Property property;

    private LocalDateTime addedAt = LocalDateTime.now();

    public Cart(User user, Property property) {
        this.user = user;
        this.property = property;
        this.addedAt = LocalDateTime.now();
    }
}