package com.shukla.controller;

import com.shukla.dto.CategoryDTO;
import com.shukla.dto.SalonDTO;
import com.shukla.dto.ServiceDTO;
import com.shukla.model.ServiceOffering;
import com.shukla.service.ServiceOfferingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/service-offering/salon-owner")
public class SalonServiceOfferingController {

    private final ServiceOfferingService serviceOfferingService;

    @PostMapping()
    public ResponseEntity<ServiceOffering> createService(
            @RequestBody ServiceDTO serviceDTO
    ){
        SalonDTO salonDTO = new SalonDTO();
        salonDTO.setId(serviceDTO.getSalonId());  // ✅ Now dynamic

        CategoryDTO categoryDTO = new CategoryDTO();
        categoryDTO.setId(serviceDTO.getCategory());

        ServiceOffering serviceOfferings = serviceOfferingService
                .createSevice(salonDTO, serviceDTO, categoryDTO);

        return ResponseEntity.ok(serviceOfferings);
    }


    @PostMapping("/{id}")
    public ResponseEntity <ServiceOffering>updateService(
            @PathVariable long id,
            @RequestBody ServiceOffering serviceOffering
    ) throws Exception {

        ServiceOffering serviceOfferings=serviceOfferingService
                .updateService(id,serviceOffering);

        return ResponseEntity.ok(serviceOfferings);
    }
}
