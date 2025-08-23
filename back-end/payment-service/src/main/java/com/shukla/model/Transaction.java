package com.shukla.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long salonId;
    private Long customerId;
    private Double amount;
    private String paymentMethod;   // STRIPE / RAZORPAY
    private String status;          // SUCCESS / FAILED
    private LocalDateTime transactionDate = LocalDateTime.now();

    // ✅ Link with our PaymentOrder entity instead of Razorpay SDK Payment
    @OneToOne
    @JoinColumn(name = "payment_order_id", referencedColumnName = "id")
    private PaymentOrder paymentOrder;

}
