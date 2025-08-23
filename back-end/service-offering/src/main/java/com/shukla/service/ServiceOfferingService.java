package com.shukla.service;

import com.shukla.dto.CategoryDTO;
import com.shukla.dto.SalonDTO;
import com.shukla.dto.ServiceDTO;
import com.shukla.model.ServiceOffering;

import java.util.List;
import java.util.Set;

public interface ServiceOfferingService {

    ServiceOffering createSevice(SalonDTO salonDTO,
                                 ServiceDTO serviceDTO,
                                 CategoryDTO categoryDTO);

    ServiceOffering updateService(Long serviceId,ServiceOffering service) throws Exception;

    Set<ServiceOffering> getAllServiceBySalonId(Long salonID,Long categoryId);

    Set<ServiceOffering> getServicesByIds(Set<Long> ids);

    ServiceOffering getServiceById(Long id) throws Exception;
}
