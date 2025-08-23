package com.shukla.repository;

import com.razorpay.Payment;
import com.shukla.model.PaymentOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentOrderRepository extends JpaRepository<PaymentOrder , Long> {

    PaymentOrder findByPaymentLinkId(String paymentLinkId);
    List<PaymentOrder> findBySalonId(Long salonId);

}
