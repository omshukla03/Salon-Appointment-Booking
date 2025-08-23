package com.shukla.service;

import com.shukla.model.Transaction;

import java.util.List;

public interface TransactionService {
    Transaction createTransaction(Transaction transaction);
    List<Transaction> getTransactionsBySalon(Long salonId);

}
