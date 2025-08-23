package com.shukla.service;

import com.razorpay.PaymentLink;
import com.razorpay.RazorpayException;
import com.shukla.domain.PaymentMethod;
import com.shukla.model.PaymentOrder;
import com.shukla.payload.dto.BookingDTO;
import com.shukla.payload.dto.UserDTO;
import com.shukla.payload.response.PaymentLinkResponse;
import com.stripe.exception.StripeException;

import java.util.List;

public interface PaymentService {
    PaymentLinkResponse createOrder(UserDTO user,
                                    BookingDTO booking,
                                    PaymentMethod paymentMethod) throws RazorpayException, StripeException;

    PaymentOrder getPaymentOrderById(Long id) throws Exception;

    PaymentOrder getPaymentOrderByPaymentId(String paymentId);

    PaymentLink createRazorpayPaymentLink(UserDTO user,
                                          Long amount,
                                          Long orderId) throws RazorpayException;

    String createStripePaymentLink(UserDTO user,
                                   Long amount,
                                   Long orderId) throws StripeException; // ✅ FIXED: Missing semicolon

    Boolean proceedPayment(PaymentOrder paymentOrder, String paymentId, String paymentLinkId) throws RazorpayException;

    PaymentOrder getPaymentById(Long id);

    List<PaymentOrder> getPaymentsBySalon(Long salonId);
}
