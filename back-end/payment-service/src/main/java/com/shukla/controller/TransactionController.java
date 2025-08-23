package com.shukla.controller;

import com.shukla.model.Transaction;
import com.shukla.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "http://localhost:5173")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @GetMapping("/salon/{salonId}")
    public ResponseEntity<List<Transaction>> getTransactionsBySalon(@PathVariable Long salonId) {
        return ResponseEntity.ok(transactionService.getTransactionsBySalon(salonId));
    }
}
