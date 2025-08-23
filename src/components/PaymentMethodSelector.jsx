import React, { useState } from 'react';
import { CreditCard, Smartphone, Store, Check } from 'lucide-react';

const PaymentMethodSelector = ({ onMethodSelect, selectedMethod, totalAmount }) => {
    const paymentMethods = [
        {
            id: 'RAZORPAY',
            name: 'Razorpay',
            description: 'UPI, Cards, Net Banking, Wallets',
            icon: <Smartphone className="w-6 h-6" />,
            popular: true
        },
        {
            id: 'STRIPE',
            name: 'Stripe',
            description: 'International Cards',
            icon: <CreditCard className="w-6 h-6" />,
            popular: false
        },
        {
            id: 'PAY_AT_SALON',
            name: 'Pay at Salon',
            description: 'Pay when you visit (Cash/Card)',
            icon: <Store className="w-6 h-6" />,
            popular: false
        }
    ];

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Choose Payment Method</h3>
            
            <div className="grid gap-3">
                {paymentMethods.map((method) => (
                    <div
                        key={method.id}
                        onClick={() => onMethodSelect(method.id)}
                        className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedMethod === method.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                                selectedMethod === method.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                            }`}>
                                {method.icon}
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-gray-800">{method.name}</h4>
                                    {method.popular && (
                                        <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">
                                            Popular
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600">{method.description}</p>
                            </div>

                            {selectedMethod === method.id && (
                                <Check className="w-5 h-5 text-blue-500" />
                            )}
                        </div>

                        {method.id === 'PAY_AT_SALON' && (
                            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                                <strong>Note:</strong> Your booking will be confirmed immediately. Pay ₹{totalAmount} when you visit the salon.
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PaymentMethodSelector; 