package com.shukla.service.impl;

import com.shukla.domain.BookingStatus;
import com.shukla.dto.BookingRequest;
import com.shukla.dto.SalonDTO;
import com.shukla.dto.ServiceDTO;
import com.shukla.dto.UserDTO;
import com.shukla.model.Booking;
import com.shukla.model.SalonReport;
import com.shukla.repository.BookingRepository;
import com.shukla.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;

    @Override
    public Booking createBooking(BookingRequest booking,
                                 UserDTO user,
                                 SalonDTO salon,
                                 Set<ServiceDTO> serviceDTOSet) throws Exception {

        // Calculate total duration
        int totalDuration = serviceDTOSet.stream()
                .mapToInt(ServiceDTO::getDuration)
                .sum();

        LocalDateTime bookingStartTime = booking.getStartTime();
        LocalDateTime bookingEndTime = bookingStartTime.plusMinutes(totalDuration);

        // ✅ FIXED: Better slot availability check
        if (!isTimeSlotAvailable(salon, bookingStartTime, bookingEndTime)) {
            throw new Exception("Time slot not available. Please choose a different time.");
        }

        // Calculate total price
        int totalPrice = serviceDTOSet.stream()
                .mapToInt(ServiceDTO::getPrice)
                .sum();

        Set<Long> serviceIds = serviceDTOSet.stream()
                .map(ServiceDTO::getId)
                .collect(Collectors.toSet());

        // Create and save booking
        Booking newBooking = new Booking();
        newBooking.setCustomerId(user.getId());
        newBooking.setSalonId(salon.getId());
        newBooking.setServiceIds(serviceIds);
        newBooking.setStatus(BookingStatus.PENDING);
        newBooking.setStartTime(bookingStartTime);
        newBooking.setEndTime(bookingEndTime);
        newBooking.setTotalPrice(totalPrice);

        return bookingRepository.save(newBooking);
    }

    public Boolean isTimeSlotAvailable(SalonDTO salonDTO,
                                       LocalDateTime bookingStartTime,
                                       LocalDateTime bookingEndTime) throws Exception {

        // Check salon working hours
        LocalDateTime salonOpenTime = bookingStartTime.toLocalDate().atTime(salonDTO.getOpenTime());
        LocalDateTime salonCloseTime = bookingStartTime.toLocalDate().atTime(salonDTO.getCloseTime());

        if (bookingStartTime.isBefore(salonOpenTime) || bookingEndTime.isAfter(salonCloseTime)) {
            throw new Exception("Booking time must be within salon's working hours (" +
                    salonDTO.getOpenTime() + " - " + salonDTO.getCloseTime() + ")");
        }

        // ✅ FIXED: Use repository method for overlapping bookings
        List<Booking> overlappingBookings = bookingRepository.findOverlappingBookings(
                salonDTO.getId(), bookingStartTime, bookingEndTime);

        if (!overlappingBookings.isEmpty()) {
            throw new Exception("Time slot conflicts with existing booking. Please choose a different time.");
        }

        return true;
    }

    @Override
    public List<Booking> getBookingsByCustomer(Long customerId) {
        return bookingRepository.findByCustomerId(customerId);
    }

    @Override
    public List<Booking> getBookingsBySalon(Long salonId) {
        return bookingRepository.findBySalonId(salonId);
    }

    @Override
    public Booking getBookingById(Long id) throws Exception {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new Exception("Booking not found with id: " + id));
    }

    @Override
    public Booking updateBooking(Long bookingId, BookingStatus status) throws Exception {
        Booking booking = getBookingById(bookingId);
        booking.setStatus(status);
        return bookingRepository.save(booking);
    }

    @Override
    public List<Booking> getBookingsByDate(LocalDate date, Long salonId) {
        if (date == null) {
            return getBookingsBySalon(salonId);
        }

        // ✅ FIXED: Use repository method for date filtering
        return bookingRepository.findBySalonIdAndDate(salonId, date);
    }

    @Override
    public SalonReport getSalonReport(Long salonId) {
        List<Booking> bookings = getBookingsBySalon(salonId);

        double totalEarnings = bookings.stream()
                .filter(booking -> booking.getStatus() == BookingStatus.CONFIRMED ||
                        booking.getStatus() == BookingStatus.PENDING)
                .mapToDouble(Booking::getTotalPrice)
                .sum();

        int totalBookings = bookings.size();

        List<Booking> cancelledBookings = bookings.stream()
                .filter(booking -> booking.getStatus() == BookingStatus.CANCELLED)
                .collect(Collectors.toList());

        double totalRefund = cancelledBookings.stream()
                .mapToDouble(Booking::getTotalPrice)
                .sum();

        SalonReport report = new SalonReport();
        report.setSalonId(salonId);
        report.setCancelBookings(cancelledBookings.size());
        report.setTotalBookings(totalBookings);
        report.setTotalEarnings(totalEarnings);
        report.setTotalRefund(totalRefund);

        return report;
    }
}
