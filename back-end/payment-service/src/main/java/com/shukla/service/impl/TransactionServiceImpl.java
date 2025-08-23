package com.shukla.service.impl;

import com.shukla.model.Transaction;
import com.shukla.repository.TransactionRepository;
import com.shukla.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransactionServiceImpl implements TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Override
    public Transaction createTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    @Override
    public List<Transaction> getTransactionsBySalon(Long salonId) {
        return transactionRepository.findBySalonId(salonId);
    }
}

