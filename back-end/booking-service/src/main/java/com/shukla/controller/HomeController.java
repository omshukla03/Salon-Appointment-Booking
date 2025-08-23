package com.shukla.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping
    public String HomecontrollerHandler(){return "Booking Microservice for salon booking system";}
}
