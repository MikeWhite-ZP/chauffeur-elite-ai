package com.usaluxurylimo.repository;

import com.usaluxurylimo.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByPassengerEmail(String email);
    List<Booking> findByJobStatus(String status);
    List<Booking> findByStatus(String status);
}
