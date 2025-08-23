package com.shukla.controller;

import com.razorpay.RazorpayException;
import com.shukla.domain.PaymentMethod;
import com.shukla.domain.PaymentOrderStatus;
import com.shukla.model.PaymentOrder;
import com.shukla.payload.dto.BookingDTO;
import com.shukla.payload.dto.UserDTO;
import com.shukla.payload.response.PaymentLinkResponse;
import com.shukla.repository.PaymentOrderRepository;
import com.shukla.service.PaymentService;
import com.stripe.exception.StripeException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    @Autowired
    private RestTemplate restTemplate;

    private final PaymentService paymentService;
    private final PaymentOrderRepository paymentOrderRepository;

    @PostMapping("/create")
    public ResponseEntity<?> createPaymentLink(
            @RequestBody BookingDTO booking,
            @RequestParam PaymentMethod paymentMethod,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) String customerEmail
    ) {
        try {
            // ✅ FIXED: Better user data handling
            UserDTO user = new UserDTO();
            user.setId(customerId != null ? customerId : booking.getCustomerId());
            user.setFullName(customerName != null ? customerName : "Customer " + user.getId());
            user.setEmail(customerEmail != null ? customerEmail : "customer" + user.getId() + "@example.com");

            PaymentLinkResponse response = paymentService.createOrder(user, booking, paymentMethod);
            return ResponseEntity.ok(response);

        } catch (StripeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Stripe error: " + e.getMessage()));
        } catch (RazorpayException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Razorpay error: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Payment creation failed: " + e.getMessage()));
        }
    }

    // 🆕 ENHANCED: Razorpay Payment Confirmation with Booking Status Update
    @PostMapping("/proceed-razorpay")
    public ResponseEntity<?> proceedRazorpayPayment(@RequestBody Map<String, Object> payload) {
        try {
            String razorpayPaymentId = (String) payload.get("razorpay_payment_id");
            String razorpayLinkId = (String) payload.get("razorpay_payment_link_id");
            String razorpaySignature = (String) payload.get("razorpay_signature");
            String status = (String) payload.get("razorpay_payment_link_status");

            // ✅ FIXED: Better bookingId extraction with null checks
            Long bookingId = null;
            Object bookingIdObj = payload.get("bookingId");
            if (bookingIdObj != null) {
                if (bookingIdObj instanceof Number) {
                    bookingId = ((Number) bookingIdObj).longValue();
                } else if (bookingIdObj instanceof String) {
                    try {
                        bookingId = Long.parseLong((String) bookingIdObj);
                    } catch (NumberFormatException e) {
                        System.err.println("❌ Invalid bookingId format: " + bookingIdObj);
                    }
                }
            }

            System.out.println("🟣 Processing Razorpay payment: " + payload);
            System.out.println("📝 Extracted bookingId: " + bookingId);

            if (bookingId == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Booking ID is missing or invalid"));
            }

            if (!"paid".equals(status)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Payment not completed"));
            }

            // Update payment status
            PaymentOrder paymentOrder = paymentService.getPaymentOrderByPaymentId(razorpayLinkId);
            if (paymentOrder != null) {
                paymentOrder.setStatus(PaymentOrderStatus.SUCCESS);
                paymentOrderRepository.save(paymentOrder);

                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Payment confirmed successfully",
                        "paymentId", razorpayPaymentId,
                        "bookingId", bookingId
                ));
            }

            return ResponseEntity.badRequest().body(Map.of("error", "Payment order not found"));

        } catch (Exception e) {
            System.err.println("❌ Razorpay payment processing error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process payment: " + e.getMessage()));
        }
    }

    // ✅ Helper method to update booking status
    private void updateBookingStatusToConfirmed(Long bookingId) {
        try {
            // Make HTTP call to booking service
            RestTemplate restTemplate = new RestTemplate();
            String bookingServiceUrl = "http://localhost:5005/api/bookings/" + bookingId + "/status?status=CONFIRMED";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            restTemplate.exchange(bookingServiceUrl, HttpMethod.PUT, entity, String.class);

        } catch (Exception e) {
            System.err.println("❌ Failed to update booking status: " + e.getMessage());
            throw e;
        }
    }

    // ✅ ENHANCED: Pay at Salon with booking confirmation
    @PostMapping("/pay-at-salon")
    public ResponseEntity<?> createPayAtSalonBooking(@RequestBody Map<String, Object> payload) {
        try {
            Long bookingId = Long.parseLong(payload.get("bookingId").toString());
            Long amount = Long.parseLong(payload.get("amount").toString());
            Long salonId = Long.parseLong(payload.get("salonId").toString());
            Long customerId = Long.parseLong(payload.get("customerId").toString());

            System.out.println("🏪 Creating pay-at-salon booking: " + payload);

            // Create special payment record
            PaymentOrder order = new PaymentOrder();
            order.setAmount(amount);
            order.setPaymentMethod(PaymentMethod.PAY_AT_SALON);
            order.setBookingId(bookingId);
            order.setSalonId(salonId);
            order.setUserId(customerId);
            order.setStatus(PaymentOrderStatus.PENDING_SALON_PAYMENT);
            order.setPaymentLinkId("pay_at_salon_" + bookingId);

            paymentOrderRepository.save(order);

            // ✅ CRITICAL: Confirm booking for pay-at-salon
            try {
                updateBookingStatusToConfirmed(bookingId);
                System.out.println("✅ Booking #" + bookingId + " confirmed for pay-at-salon");
            } catch (Exception e) {
                System.err.println("⚠️ Warning: Pay-at-salon setup successful but booking confirmation failed: " + e.getMessage());
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Pay-at-salon booking confirmed",
                    "bookingId", bookingId
            ));

        } catch (Exception e) {
            System.err.println("❌ Pay-at-salon setup error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to setup pay-at-salon: " + e.getMessage()));
        }
    }

    // Existing methods remain the same...

    @GetMapping("/{paymentOrderId}")
    public ResponseEntity<?> getPaymentOrderById(@PathVariable Long paymentOrderId) {
        try {
            PaymentOrder result = paymentService.getPaymentOrderById(paymentOrderId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/proceed")
    public ResponseEntity<?> proceedPayment(
            @RequestParam String paymentId,
            @RequestParam String paymentLinkId
    ) {
        try {
            PaymentOrder paymentOrder = paymentService.getPaymentOrderByPaymentId(paymentLinkId);
            if (paymentOrder == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Payment order not found"));
            }

            Boolean result = paymentService.proceedPayment(paymentOrder, paymentId, paymentLinkId);
            return ResponseEntity.ok(Map.of("success", result));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Payment processing failed: " + e.getMessage()));
        }
    }

    @GetMapping("/salon/{salonId}")
    public ResponseEntity<List<PaymentOrder>> getPaymentsBySalon(@PathVariable Long salonId) {
        List<PaymentOrder> payments = paymentService.getPaymentsBySalon(salonId);
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/basic/{id}")
    public ResponseEntity<?> getPaymentById(@PathVariable Long id) {
        try {
            PaymentOrder payment = paymentService.getPaymentById(id);
            if (payment == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Payment not found"));
            }
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }


}