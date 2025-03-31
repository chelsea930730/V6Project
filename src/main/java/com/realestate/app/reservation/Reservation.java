package com.realestate.app.reservation;

import com.realestate.app.property.Property;
import com.realestate.app.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Reservation")
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reservationId;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ReservationStatus status = ReservationStatus.PENDING;

    private LocalDate reservedDate;
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(length = 1000)
    private String message;

    /**
     * -- SETTER --
     *  관리자 메모를 설정합니다.
     *
     *
     * -- GETTER --
     *  관리자 메모를 가져옵니다.
     *
     @param adminNotes 관리자 메모
      * @return 관리자 메모
     */
    @Getter
    @Setter
    @Column(length = 1000)
    private String adminNotes;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "reservation_property",
        joinColumns = @JoinColumn(name = "reservation_id"),
        inverseJoinColumns = @JoinColumn(name = "property_id")
    )
    private Set<Property> properties = new HashSet<>();

    public void addProperty(Property property) {
        this.properties.add(property);
    }

    public Set<Property> getProperties() {
        return properties != null ? properties : new HashSet<>();
    }

}

