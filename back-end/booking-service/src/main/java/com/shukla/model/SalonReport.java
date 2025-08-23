package com.shukla.model;

import jakarta.persistence.criteria.CriteriaBuilder;
import lombok.Data;

@Data
public class SalonReport {

    private Long salonId;
    private String salonName;
    private Double totalEarnings;
    private Integer totalBookings;
    private Integer cancelBookings;
    private Double totalRefund;
}
