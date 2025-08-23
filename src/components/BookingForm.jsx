import React, { useState, useEffect } from 'react';
import { Calendar, Clock, IndianRupee, CreditCard, Smartphone, Store, Check, AlertCircle, X } from 'lucide-react';

const BookingForm = ({ salon, salonId, onSuccess, onError, onClose }) => {
    // Form States
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedServices, setSelectedServices] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');
    
    // Data States
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [error, setError] = useState('');

    // Payment Methods
    const paymentMethods = [
        {
            id: 'RAZORPAY',
            name: 'Razorpay',
            description: 'UPI, Cards, Net Banking, Wallets',
            icon: <Smartphone className="w-5 h-5" />,
            popular: true,
            color: 'border-blue-200 bg-blue-50'
        },
        {
            id: 'STRIPE', 
            name: 'Stripe',
            description: 'International Cards',
            icon: <CreditCard className="w-5 h-5" />,
            popular: false,
            color: 'border-purple-200 bg-purple-50'
        },
        {
            id: 'PAY_AT_SALON',
            name: 'Pay at Salon',
            description: 'Pay when you visit (Cash/Card)',
            icon: <Store className="w-5 h-5" />,
            popular: false,
            color: 'border-green-200 bg-green-50'
        }
    ];

    // Load initial data
    useEffect(() => {
        const loadServices = async () => {
            try {
                setLoading(true);
                console.log('🔍 Loading services for salon:', salonId);

                // Load services
                const servicesResponse = await fetch(`http://localhost:5004/api/service-offering/salon/${salonId}`);
                
                if (!servicesResponse.ok) {
                    throw new Error(`Failed to load services: ${servicesResponse.status}`);
                }
                
                const servicesData = await servicesResponse.json();
                console.log('✅ Services loaded:', servicesData);
                
                setServices(Array.isArray(servicesData) ? servicesData : []);

            } catch (error) {
                console.error('❌ Error loading services:', error);
                setError(`Failed to load services: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        if (salonId) {
            loadServices();
        } else {
            setError('No salon ID provided');
            setLoading(false);
        }
    }, [salonId]);

    // Generate time slots
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 9; hour <= 20; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                slots.push(time);
            }
        }
        return slots;
    };

    // Calculate total price
    const calculateTotal = () => {
        return selectedServices.reduce((total, serviceId) => {
            const service = services.find(s => s.id === parseInt(serviceId));
            return total + (service ? service.price : 0);
        }, 0);
    };

    // Handle service selection
    const handleServiceToggle = (serviceId) => {
        setSelectedServices(prev => {
            if (prev.includes(serviceId.toString())) {
                return prev.filter(id => id !== serviceId.toString());
            } else {
                return [...prev, serviceId.toString()];
            }
        });
    };

    // Handle booking submission
    const handleBooking = async () => {
        try {
            // Validation
            if (!selectedDate || !selectedTime || selectedServices.length === 0) {
                setError('Please fill all required fields');
                return;
            }

            setBookingLoading(true);
            setError('');

            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                setError('Please login to continue');
                return;
            }

            console.log('🚀 Creating booking with data:', {
                salonId,
                customerId: user.id,
                date: selectedDate,
                time: selectedTime,
                services: selectedServices,
                paymentMethod
            });

            // Create booking first
            const bookingData = {
                startTime: `${selectedDate}T${selectedTime}:00`,
                endTime: `${selectedDate}T${selectedTime}:00`, // This should be calculated based on service duration
                serviceIds: selectedServices.map(id => parseInt(id))
            };

            const bookingResponse = await fetch(`http://localhost:5005/api/bookings?salonId=${salonId}&customerId=${user.id}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(bookingData)
            });

            if (!bookingResponse.ok) {
                const errorData = await bookingResponse.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${bookingResponse.status}: Failed to create booking`);
            }

            const booking = await bookingResponse.json();
            console.log('✅ Booking created:', booking);

            // Handle different payment methods
            if (paymentMethod === 'PAY_AT_SALON') {
                // Create pay-at-salon record
                const payAtSalonData = {
                    bookingId: booking.id,
                    amount: calculateTotal(),
                    salonId: parseInt(salonId),
                    customerId: user.id
                };

                console.log('🏪 Setting up pay-at-salon:', payAtSalonData);

                const payAtSalonResponse = await fetch('http://localhost:5006/api/payments/pay-at-salon', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(payAtSalonData)
                });

                if (payAtSalonResponse.ok) {
                    console.log('✅ Pay-at-salon setup successful');
                    
                    // Store success info for dashboard
                    const successInfo = {
                        message: '🏪 Booking confirmed! You can pay when you visit the salon.',
                        bookingId: booking.id,
                        amount: calculateTotal(),
                        paymentMethod: 'PAY_AT_SALON'
                    };
                    
                    localStorage.setItem('paymentSuccess', JSON.stringify(successInfo));
                    
                    // Call success callback
                    if (onSuccess) {
                        onSuccess({
                            ...booking,
                            paymentMethod: 'PAY_AT_SALON',
                            totalAmount: calculateTotal()
                        });
                    }
                } else {
                    const errorData = await payAtSalonResponse.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Failed to setup pay-at-salon');
                }
            } else {
                // Create online payment
                const paymentData = {
                    id: booking.id,
                    salonId: parseInt(salonId),
                    customerId: user.id,
                    totalPrice: calculateTotal()
                };

                console.log('💳 Creating online payment:', paymentData);

                const paymentResponse = await fetch(`http://localhost:5006/api/payments/create?paymentMethod=${paymentMethod}`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(paymentData)
                });

                if (!paymentResponse.ok) {
                    const errorData = await paymentResponse.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Failed to create payment link');
                }

                const paymentResult = await paymentResponse.json();
                console.log('✅ Payment link created:', paymentResult);
                
                if (paymentResult.payment_link_url || paymentResult.paymentLink || paymentResult.url) {
                    const paymentUrl = paymentResult.payment_link_url || paymentResult.paymentLink || paymentResult.url;
                    
                    // Store payment info for when user returns
                    const paymentInfo = {
                        bookingId: booking.id,
                        paymentMethod,
                        amount: calculateTotal()
                    };
                    
                    localStorage.setItem('pendingPayment', JSON.stringify(paymentInfo));
                    
                    console.log('🔄 Redirecting to payment URL:', paymentUrl);
                    window.location.href = paymentUrl;
                } else {
                    throw new Error('Payment link not generated');
                }
            }

        } catch (error) {
            console.error('❌ Booking error:', error);
            setError(error.message || 'Failed to create booking');
            
            // Call error callback
            if (onError) {
                onError(error);
            }
        } finally {
            setBookingLoading(false);
        }
    };

    const totalAmount = calculateTotal();
    const timeSlots = generateTimeSlots();

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading booking form...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Book Appointment</h1>
                        {salon && (
                            <div>
                                <h2 className="text-gray-600">{salon.name}</h2>
                                <p className="text-sm text-gray-500">{salon.address}</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Booking Form */}
                        <div className="space-y-6">
                            {/* Date Selection */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                    Select Date
                                </h3>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Time Selection */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                    Select Time
                                </h3>
                                <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                                    {timeSlots.map(time => (
                                        <button
                                            key={time}
                                            onClick={() => setSelectedTime(time)}
                                            className={`p-2 text-sm rounded-lg border transition-colors ${
                                                selectedTime === time
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                                            }`}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Services Selection */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Select Services</h3>
                                <div className="space-y-3 max-h-48 overflow-y-auto">
                                    {services.length > 0 ? services.map(service => (
                                        <div
                                            key={service.id}
                                            onClick={() => handleServiceToggle(service.id)}
                                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                                selectedServices.includes(service.id.toString())
                                                    ? 'bg-blue-50 border-blue-500'
                                                    : 'bg-white border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-medium text-gray-800">{service.name}</h4>
                                                    <p className="text-sm text-gray-600">{service.description}</p>
                                                    <p className="text-xs text-gray-500">{service.duration} minutes</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-gray-800 flex items-center gap-1">
                                                        <IndianRupee className="w-4 h-4" />
                                                        {service.price}
                                                    </p>
                                                    {selectedServices.includes(service.id.toString()) && (
                                                        <Check className="w-5 h-5 text-blue-500 mt-1 ml-auto" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-8">
                                            <p className="text-gray-500">No services available for this salon</p>
                                            <p className="text-sm text-gray-400 mt-1">Please try again later or contact the salon</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Payment & Summary */}
                        <div className="space-y-6">
                            {/* Payment Method Selection */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Choose Payment Method</h3>
                                <div className="space-y-3">
                                    {paymentMethods.map(method => (
                                        <div
                                            key={method.id}
                                            onClick={() => setPaymentMethod(method.id)}
                                            className={`relative p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                                paymentMethod === method.id
                                                    ? `border-blue-500 ${method.color}`
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${
                                                    paymentMethod === method.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
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

                                                {paymentMethod === method.id && (
                                                    <Check className="w-5 h-5 text-blue-500" />
                                                )}
                                            </div>

                                            {method.id === 'PAY_AT_SALON' && paymentMethod === method.id && (
                                                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                                                    <strong>Note:</strong> Your booking will be confirmed immediately. Pay ₹{totalAmount} when you visit the salon.
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Booking Summary */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Booking Summary</h3>
                                
                                <div className="space-y-3">
                                    {selectedDate && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Date:</span>
                                            <span className="font-medium">
                                                {new Date(selectedDate).toLocaleDateString('en-IN', {
                                                    weekday: 'short',
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {selectedTime && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Time:</span>
                                            <span className="font-medium">{selectedTime}</span>
                                        </div>
                                    )}

                                    {selectedServices.length > 0 && (
                                        <div className="space-y-2">
                                            <span className="text-gray-600">Services:</span>
                                            {selectedServices.map(serviceId => {
                                                const service = services.find(s => s.id === parseInt(serviceId));
                                                return service ? (
                                                    <div key={serviceId} className="flex justify-between text-sm">
                                                        <span>{service.name}</span>
                                                        <span className="flex items-center gap-1">
                                                            <IndianRupee className="w-3 h-3" />
                                                            {service.price}
                                                        </span>
                                                    </div>
                                                ) : null;
                                            })}
                                        </div>
                                    )}

                                    <hr />
                                    
                                    <div className="flex justify-between text-lg font-semibold">
                                        <span>Total:</span>
                                        <span className="flex items-center gap-1 text-blue-600">
                                            <IndianRupee className="w-5 h-5" />
                                            {totalAmount}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-700 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5" />
                                        {error}
                                    </p>
                                </div>
                            )}

                            {/* Book Button */}
                            <button
                                onClick={handleBooking}
                                disabled={!selectedDate || !selectedTime || selectedServices.length === 0 || bookingLoading}
                                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                            >
                                {bookingLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        {paymentMethod === 'PAY_AT_SALON' ? 'Confirm Booking' : 'Proceed to Payment'}
                                        <IndianRupee className="w-5 h-5" />
                                        {totalAmount}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingForm;