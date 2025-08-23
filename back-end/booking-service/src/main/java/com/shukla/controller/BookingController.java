package com.shukla.controller;

import com.shukla.domain.BookingStatus;
import com.shukla.dto.*;
import com.shukla.mapper.BookingMapper;
import com.shukla.model.Booking;
import com.shukla.model.SalonReport;
import com.shukla.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<?> createBooking(
            @RequestParam Long salonId,
            @RequestParam Long customerId, // ✅ FIXED: Accept customerId as parameter
            @RequestBody BookingRequest bookingRequest
    ) {
        try {
            System.out.println("🚀 Creating booking for salon: " + salonId + ", customer: " + customerId);
            System.out.println("📝 Booking request: " + bookingRequest);

            // ✅ FIXED: Use the provided customerId instead of hardcoded value
            UserDTO user = new UserDTO();
            user.setId(customerId);

            SalonDTO salon = new SalonDTO();
            salon.setId(salonId);
            salon.setOpenTime(LocalTime.of(9, 0));
            salon.setCloseTime(LocalTime.of(21, 0));

            // ✅ ENHANCED: Create services from request serviceIds if provided
            Set<ServiceDTO> serviceDTOSet = new HashSet<>();

            if (bookingRequest.getServiceIds() != null && !bookingRequest.getServiceIds().isEmpty()) {
                // Use the provided service IDs (you might want to fetch actual service details from service-offering microservice)
                for (Long serviceId : bookingRequest.getServiceIds()) {
                    ServiceDTO serviceDTO = new ServiceDTO();
                    serviceDTO.setId(serviceId);
                    serviceDTO.setPrice(399); // TODO: Fetch actual price from service-offering microservice
                    serviceDTO.setDuration(45); // TODO: Fetch actual duration
                    serviceDTO.setName("Service #" + serviceId); // TODO: Fetch actual name
                    serviceDTOSet.add(serviceDTO);
                }
            } else {
                // Fallback to default service
                ServiceDTO serviceDTO = new ServiceDTO();
                serviceDTO.setId(1L);
                serviceDTO.setPrice(399);
                serviceDTO.setDuration(45);
                serviceDTO.setName("Hair cut for men");
                serviceDTOSet.add(serviceDTO);
            }

            Booking booking = bookingService.createBooking(bookingRequest, user, salon, serviceDTOSet);

            System.out.println("✅ Booking created successfully: " + booking);

            return ResponseEntity.ok(booking);

        } catch (Exception e) {
            System.err.println("❌ Error creating booking: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<Set<BookingDTO>> getBookingsByCustomer(
            @PathVariable Long customerId
    ) {
        List<Booking> bookings = bookingService.getBookingsByCustomer(customerId);
        return ResponseEntity.ok(getBookingDTOs(bookings));
    }

    @GetMapping("/salon/{salonId}")
    public ResponseEntity<Set<BookingDTO>> getBookingsBySalon(
            @PathVariable Long salonId
    ) {
        List<Booking> bookings = bookingService.getBookingsBySalon(salonId);
        return ResponseEntity.ok(getBookingDTOs(bookings));
    }

    private Set<BookingDTO> getBookingDTOs(List<Booking> bookings) {
        return bookings.stream()
                .map(BookingMapper::toDTO)
                .collect(Collectors.toSet());
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<?> getBookingById(@PathVariable Long bookingId) {
        try {
            Booking booking = bookingService.getBookingById(bookingId);
            return ResponseEntity.ok(BookingMapper.toDTO(booking));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{bookingId}/status")
    public ResponseEntity<?> updateBookingStatus(
            @PathVariable Long bookingId,
            @RequestParam BookingStatus status
    ) {
        try {
            Booking booking = bookingService.updateBooking(bookingId, status);
            return ResponseEntity.ok(BookingMapper.toDTO(booking));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/slots/salon/{salonId}/date/{date}")
    public ResponseEntity<List<BookingSlotDTO>> getBookedSlots(
            @PathVariable Long salonId,
            @PathVariable LocalDate date
    ) {
        try {
            List<Booking> bookings = bookingService.getBookingsByDate(date, salonId);
            List<BookingSlotDTO> slotDTOs = bookings.stream()
                    .map(booking -> {
                        BookingSlotDTO slotDTO = new BookingSlotDTO();
                        slotDTO.setStartTime(booking.getStartTime());
                        slotDTO.setEndTime(booking.getEndTime());
                        return slotDTO;
                    }).collect(Collectors.toList());
            return ResponseEntity.ok(slotDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(List.of());
        }
    }

    @GetMapping("/report/salon/{salonId}")
    public ResponseEntity<?> getSalonReport(@PathVariable Long salonId) {
        try {
            SalonReport report = bookingService.getSalonReport(salonId);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
