package com.shukla.service.impl;

import com.shukla.dto.CategoryDTO;
import com.shukla.dto.SalonDTO;
import com.shukla.dto.ServiceDTO;
import com.shukla.model.ServiceOffering;
import com.shukla.repository.ServiceOfferingRepository;
import com.shukla.service.ServiceOfferingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;



@Service
@RequiredArgsConstructor
public class ServiceOfferingServiceImpl implements ServiceOfferingService {

    private final ServiceOfferingRepository serviceOfferingRepository;


    @Override
    public ServiceOffering createSevice(SalonDTO salonDTO,
                                        ServiceDTO serviceDTO,
                                        CategoryDTO categoryDTO) {
        ServiceOffering serviceOffering=new ServiceOffering();
        serviceOffering.setImage(serviceDTO.getImage());
        serviceOffering.setSalonId(salonDTO.getId());
        serviceOffering.setName(serviceDTO.getName());
        serviceOffering.setDescription(serviceDTO.getDescription());
        serviceOffering.setCategoryId(categoryDTO.getId());
        serviceOffering.setPrice(serviceDTO.getPrice());
        serviceOffering.setDuration(serviceDTO.getDuration());

        return serviceOfferingRepository.save(serviceOffering);
    }

    @Override
    public ServiceOffering updateService(Long serviceId, ServiceOffering service) throws Exception {

        ServiceOffering serviceOffering=serviceOfferingRepository.findById(serviceId).orElse(null);

        if(serviceOffering==null){
            throw new Exception("Service not exits with id"+serviceId);
        }
        serviceOffering.setImage(service.getImage());
        serviceOffering.setName(service.getName());
        serviceOffering.setDescription(service.getDescription());
        serviceOffering.setPrice(service.getPrice());
        serviceOffering.setDuration(service.getDuration());

        return serviceOfferingRepository.save(serviceOffering);
    }

    @Override
    public Set<ServiceOffering> getAllServiceBySalonId(Long salonID, Long categoryId) {
        Set<ServiceOffering> services = serviceOfferingRepository
                .findBySalonId(salonID);

        if(categoryId!=null){
            services=services.stream().filter((service)->service.getCategoryId()!=null &&
                    service.getCategoryId()==categoryId).collect(Collectors.toSet());
        }
        return services;
    }

    @Override
    public Set<ServiceOffering> getServicesByIds(Set<Long> ids) {
        List<ServiceOffering> services = serviceOfferingRepository.findAllById(ids);
        return new HashSet<>(services);
    }

    @Override
    public ServiceOffering getServiceById(Long id) throws Exception {
        ServiceOffering serviceOffering = serviceOfferingRepository
                .findById(id).orElse(null);

        if (serviceOffering==null){
            throw new Exception("Service not exist with id " + id);
        }

        return serviceOffering;
    }
}
