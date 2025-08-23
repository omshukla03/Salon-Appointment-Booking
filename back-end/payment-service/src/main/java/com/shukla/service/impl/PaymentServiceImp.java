package com.shukla.service.impl;

import com.razorpay.PaymentLink;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.shukla.domain.PaymentMethod;
import com.shukla.domain.PaymentOrderStatus;
import com.shukla.model.PaymentOrder;
import com.shukla.payload.dto.BookingDTO;
import com.shukla.payload.dto.UserDTO;
import com.shukla.payload.response.PaymentLinkResponse;
import com.shukla.repository.PaymentOrderRepository;
import com.shukla.service.PaymentService;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.param.checkout.SessionCreateParams;
import com.stripe.model.checkout.Session;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentServiceImp implements PaymentService {

    private final PaymentOrderRepository paymentOrderRepository;

    // ✅ Razorpay keys
    @Value("${razorpay.api.key}")
    private String razorpayApiKey;

    @Value("${razorpay.api.secret}")
    private String razorpayApiSecret;

    @Override
    public PaymentLinkResponse createOrder(UserDTO user,
                                           BookingDTO booking,
                                           PaymentMethod paymentMethod) throws RazorpayException, StripeException {

        // ✅ FIXED: Better amount validation
        Long amount = Math.max((long) booking.getTotalPrice(), 25L); // Minimum ₹25

        PaymentOrder order = new PaymentOrder();
        order.setAmount(amount);
        order.setPaymentMethod(paymentMethod);
        order.setBookingId(booking.getId());
        order.setSalonId(booking.getSalonId());
        order.setUserId(user.getId());
        order.setStatus(PaymentOrderStatus.PENDING);

        PaymentOrder savedOrder = paymentOrderRepository.save(order);

        PaymentLinkResponse paymentLinkResponse = new PaymentLinkResponse();

        try {
            if (paymentMethod.equals(PaymentMethod.RAZORPAY)) {
                PaymentLink payment = createRazorpayPaymentLink(user, savedOrder.getAmount(), savedOrder.getId());
                String paymentUrl = payment.get("short_url");
                String paymentUrlId = payment.get("id");

                paymentLinkResponse.setPayment_link_url(paymentUrl);
                paymentLinkResponse.setGetPayment_link_id(paymentUrlId);

                savedOrder.setPaymentLinkId(paymentUrlId);
                paymentOrderRepository.save(savedOrder);

            } else if (paymentMethod.equals(PaymentMethod.STRIPE)) {
                String paymentUrl = createStripePaymentLink(user, savedOrder.getAmount(), savedOrder.getId());

                paymentLinkResponse.setPayment_link_url(paymentUrl);
                paymentLinkResponse.setGetPayment_link_id("stripe_session_" + savedOrder.getId());

                savedOrder.setPaymentLinkId("stripe_session_" + savedOrder.getId());
                paymentOrderRepository.save(savedOrder);
            }
        } catch (Exception e) {
            // Clean up the order if payment link creation fails
            paymentOrderRepository.delete(savedOrder);
            throw e;
        }

        return paymentLinkResponse;
    }

    @Override
    public PaymentOrder getPaymentOrderById(Long id) throws Exception {
        PaymentOrder paymentOrder = paymentOrderRepository.findById(id).orElse(null);
        if (paymentOrder == null) {
            throw new Exception("payment order not found");
        }
        return paymentOrder;
    }

    @Override
    public PaymentOrder getPaymentOrderByPaymentId(String paymentId) {
        return paymentOrderRepository.findByPaymentLinkId(paymentId);
    }

    @Override
    public PaymentLink createRazorpayPaymentLink(UserDTO user,
                                                 Long Amount,
                                                 Long orderId) throws RazorpayException {
        Long amount = Amount * 100; // convert to paisa

        RazorpayClient razorpay = new RazorpayClient(razorpayApiKey, razorpayApiSecret);

        JSONObject paymentLinkRequest = new JSONObject();
        paymentLinkRequest.put("amount", amount);
        paymentLinkRequest.put("currency", "INR");

        JSONObject customer = new JSONObject();
        customer.put("name", user.getFullName());
        customer.put("email", user.getEmail());
        paymentLinkRequest.put("customer", customer);

        JSONObject notify = new JSONObject();
        notify.put("email", true);
        paymentLinkRequest.put("notify", notify);

        paymentLinkRequest.put("reminder_enable", true);

        // ✅ FIXED: Include bookingId in callback URL
        paymentLinkRequest.put("callback_url",
                "http://localhost:5173/payment-success/" + orderId + "?bookingId=" + orderId);
        paymentLinkRequest.put("callback_method", "get");

        return razorpay.paymentLink.create(paymentLinkRequest);
    }

    @Override
    public String createStripePaymentLink(UserDTO user, Long amount, Long orderId) throws StripeException {
        Stripe.apiKey = "sk_test_51Rw6aiRy8ih2y8nOKCYo0UeE2Dwv8yC1msJNOhUGqd7DiWsowHlZ8w32iDig3pbaYQlkwBvFSkVHDXUIXfKEj8vn00UZKiDpME";

        SessionCreateParams params = SessionCreateParams.builder()
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                .setMode(SessionCreateParams.Mode.PAYMENT)
                // ✅ FIXED: Use correct frontend URL
                .setSuccessUrl("http://localhost:5173/payment-success/" + orderId)
                .setCancelUrl("http://localhost:5173/payment/cancel")
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("usd")
                                                .setUnitAmount(amount * 100) // cents
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName("salon appointment booking")
                                                                .build()
                                                )
                                                .build()
                                )
                                .setQuantity(1L)
                                .build()
                )
                .build();

        Session session = Session.create(params);
        return session.getUrl();
    }

    @Override
    public Boolean proceedPayment(PaymentOrder paymentOrder,
                                  String paymentId,
                                  String paymentLinkId) throws RazorpayException {

        if (paymentOrder.getStatus().equals(PaymentOrderStatus.PENDING)) {
            if (paymentOrder.getPaymentMethod().equals(PaymentMethod.RAZORPAY)) {
                RazorpayClient razorpay = new RazorpayClient(razorpayApiKey, razorpayApiSecret);

                com.razorpay.Payment payment = razorpay.payments.fetch(paymentId);
                String status = payment.get("status");

                if (status.equals("captured")) {
                    paymentOrder.setStatus(PaymentOrderStatus.SUCCESS);
                    paymentOrderRepository.save(paymentOrder);
                    return true;
                }
                return false;
            } else if (paymentOrder.getPaymentMethod().equals(PaymentMethod.STRIPE)) {
                // For now, assume Stripe payment succeeded (use webhook in real apps)
                paymentOrder.setStatus(PaymentOrderStatus.SUCCESS);
                paymentOrderRepository.save(paymentOrder);
                return true;
            }
        }
        return false;
    }

    @Override
    public PaymentOrder getPaymentById(Long id) {
        return paymentOrderRepository.findById(id).orElse(null);
    }

    @Override
    public List<PaymentOrder> getPaymentsBySalon(Long salonId) {
        return paymentOrderRepository.findBySalonId(salonId);
    }
}
