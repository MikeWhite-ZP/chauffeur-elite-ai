package com.usaluxurylimo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tripId;
    private String passengerFirstName;
    private String passengerLastName;
    private String passengerPhone;
    private String passengerEmail;
    private LocalDateTime pickupDate;
    private String pickupTime;
    private String pickupLocation;
    private String dropoffLocation;
    private String vehicleType;
    private String serviceType;
    private BigDecimal basePrice;
    private BigDecimal totalFare;
    private String status;
    private String jobStatus;
    private String paymentStatus;
    private Boolean trackingEnabled;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
