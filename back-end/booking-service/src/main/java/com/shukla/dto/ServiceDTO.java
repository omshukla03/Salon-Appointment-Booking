package com.shukla.dto;

import lombok.Data;

@Data
public class ServiceDTO {
    private Long id;
    private String name;
    private String description;
    private int price;
    private int duration; // in minutes
}