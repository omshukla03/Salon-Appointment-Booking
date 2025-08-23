package com.shukla.dto;

import lombok.Data;
import java.time.LocalTime;

@Data
public class SalonDTO {
    private Long id;
    private String name;
    private String address;
    private LocalTime openTime;
    private LocalTime closeTime;
}