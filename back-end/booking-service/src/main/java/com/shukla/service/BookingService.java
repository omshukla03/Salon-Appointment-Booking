package com.shukla.service;

import com.shukla.domain.BookingStatus;
import com.shukla.dto.BookingRequest;
import com.shukla.dto.SalonDTO;
import com.shukla.dto.ServiceDTO;
import com.shukla.dto.UserDTO;
import com.shukla.model.Booking;
import com.shukla.model.SalonReport;
import org.springframework.boot.autoconfigure.security.SecurityProperties;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

public interface BookingService {

    Booking createBooking(BookingRequest booking ,
                          UserDTO ser ,
                          SalonDTO salon,
                          Set<ServiceDTO> serviceDTOSet) throws Exception;

    List<Booking> getBookingsByCustomer(Long customerId);
    List<Booking> getBookingsBySalon(Long salonId);
    Booking getBookingById(Long id) throws Exception;
    Booking updateBooking(Long bookingId , BookingStatus status) throws Exception;
    List<Booking> getBookingsByDate(LocalDate date,Long salonId);
    SalonReport getSalonReport(Long salonId);
}
