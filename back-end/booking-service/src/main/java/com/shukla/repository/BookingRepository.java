package com.shukla.repository;

import com.shukla.domain.BookingStatus;
import com.shukla.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByCustomerId(Long customerId);
    List<Booking> findBySalonId(Long salonId);

    // Find bookings by salon and date range
    @Query("SELECT b FROM Booking b WHERE b.salonId = :salonId AND DATE(b.startTime) = :date")
    List<Booking> findBySalonIdAndDate(@Param("salonId") Long salonId, @Param("date") LocalDate date);

    // Find bookings by status
    List<Booking> findByStatus(BookingStatus status);

    // FIXED: Find overlapping bookings for slot validation
    @Query("SELECT b FROM Booking b WHERE b.salonId = :salonId AND " +
            "((b.startTime <= :endTime AND b.endTime >= :startTime)) AND " +
            "b.status != com.shukla.domain.BookingStatus.CANCELLED")
    List<Booking> findOverlappingBookings(
            @Param("salonId") Long salonId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );
}