package com.usaluxurylimo.service;

import com.usaluxurylimo.model.Booking;
import com.usaluxurylimo.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class BookingService {
    
    private final BookingRepository bookingRepository;
    
    @Autowired
    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }
    
    public Booking createBooking(Booking booking) {
        return bookingRepository.save(booking);
    }
    
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }
    
    public Optional<Booking> getBookingById(Long id) {
        return bookingRepository.findById(id);
    }
    
    public List<Booking> getBookingsByEmail(String email) {
        return bookingRepository.findByPassengerEmail(email);
    }
    
    public Booking updateBookingStatus(Long id, String status) {
        Optional<Booking> booking = bookingRepository.findById(id);
        if (booking.isPresent()) {
            Booking existingBooking = booking.get();
            existingBooking.setStatus(status);
            return bookingRepository.save(existingBooking);
        }
        throw new RuntimeException("Booking not found with id: " + id);
    }
}
