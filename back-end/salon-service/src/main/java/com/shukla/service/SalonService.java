package com.shukla.service;

import com.shukla.model.Salon;
import com.shukla.payload.dto.SalonDTO;
import com.shukla.payload.dto.UserDTO;
import lombok.Lombok;

import java.util.List;

public interface SalonService {

    Salon createSalon(SalonDTO salon, UserDTO user);

    Salon updateSalon(SalonDTO salon,UserDTO user,Long salonId) throws Exception;

    List<Salon> getAllSalons();

    Salon getSalonById(Long salonId) throws Exception;

    Salon getSalonByOwnerId(Long ownerId);

    List<Salon> searchSalonByCity(String city);

    Salon getSalonByEmail(String email);



}
