import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, ArrowRight, Home, BookOpen, RefreshCw } from 'lucide-react';

const PaymentSuccess = () => {
    const bookingId = new URLSearchParams(window.location.search).get('bookingId') || 
                     window.location.pathname.split('/').pop();
    const location = { search: window.location.search, pathname: window.location.pathname };
    const navigate = (path) => window.location.href = path;
    
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('processing');
    const [message, setMessage] = useState('');
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [bookingUpdateStatus, setBookingUpdateStatus] = useState('pending'); // pending, success, failed
    const [retryCount, setRetryCount] = useState(0);

    // Function to update booking status with retry
    const updateBookingStatus = async (bookingId, maxRetries = 3) => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`Attempt ${attempt} to update booking ${bookingId} status`);
                
                const response = await fetch(`http://localhost:5005/api/bookings/${bookingId}/status?status=CONFIRMED`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    console.log(`Booking ${bookingId} status updated successfully on attempt ${attempt}`);
                    setBookingUpdateStatus('success');
                    return true;
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            } catch (error) {
                console.error(`Attempt ${attempt} failed:`, error);
                setRetryCount(attempt);
                
                if (attempt < maxRetries) {
                    // Wait before retry (exponential backoff)
                    await new Promise(resolve => setTimeout(resolve, attempt * 1000));
                } else {
                    setBookingUpdateStatus('failed');
                    console.error(`All ${maxRetries} attempts failed for booking ${bookingId}`);
                    return false;
                }
            }
        }
        return false;
    };

    useEffect(() => {
        const processPayment = async () => {
            try {
                const urlParams = new URLSearchParams(location.search);
                
                console.log('Processing payment with params:', {
                    bookingId,
                    searchParams: Object.fromEntries(urlParams.entries()),
                    pathname: location.pathname
                });

                let paymentProcessed = false;
                let extractedBookingId = bookingId;

                // Razorpay callback
                if (urlParams.has('razorpay_payment_id')) {
                    const razorpayData = {
                        razorpay_payment_id: urlParams.get('razorpay_payment_id'),
                        razorpay_payment_link_id: urlParams.get('razorpay_payment_link_id'),
                        razorpay_signature: urlParams.get('razorpay_signature'),
                        razorpay_payment_link_status: urlParams.get('razorpay_payment_link_status'),
                        bookingId: urlParams.get('bookingId') || bookingId
                    };

                    extractedBookingId = razorpayData.bookingId;

                    if (!razorpayData.razorpay_payment_id || !extractedBookingId) {
                        throw new Error('Missing required Razorpay parameters');
                    }

                    console.log('Processing Razorpay payment:', razorpayData);

                    const response = await fetch('http://localhost:5006/api/payments/proceed-razorpay', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify(razorpayData)
                    });

                    const result = await response.json();
                    
                    if (response.ok && result.success) {
                        setStatus('success');
                        setMessage('Payment successful via Razorpay!');
                        setPaymentDetails({
                            paymentId: razorpayData.razorpay_payment_id,
                            bookingId: extractedBookingId,
                            method: 'Razorpay'
                        });
                        paymentProcessed = true;
                    } else {
                        throw new Error(result.error || 'Razorpay payment verification failed');
                    }
                }
                // Stripe callback
                else if (location.pathname.includes('payment-success') && bookingId) {
                    setStatus('success');
                    setMessage('Payment successful via Stripe!');
                    setPaymentDetails({
                        bookingId: bookingId,
                        method: 'Stripe'
                    });
                    paymentProcessed = true;
                }
                // Pay at Salon or localStorage success
                else {
                    const paymentSuccess = localStorage.getItem('paymentSuccess');
                    if (paymentSuccess) {
                        const successInfo = JSON.parse(paymentSuccess);
                        extractedBookingId = successInfo.bookingId || bookingId;
                        
                        setStatus('success');
                        setMessage(successInfo.message || 'Payment completed successfully!');
                        setPaymentDetails({
                            bookingId: extractedBookingId,
                            method: successInfo.paymentMethod || 'Unknown',
                            amount: successInfo.amount
                        });
                        
                        localStorage.removeItem('paymentSuccess');
                        paymentProcessed = true;
                    } else if (bookingId) {
                        // Default success case
                        setStatus('success');
                        setMessage('Payment completed successfully!');
                        setPaymentDetails({ bookingId: bookingId });
                        paymentProcessed = true;
                    }
                }

                if (!paymentProcessed) {
                    throw new Error('No valid payment information found');
                }

                // Update booking status if payment was successful
                if (extractedBookingId) {
                    await updateBookingStatus(extractedBookingId);
                }

            } catch (error) {
                console.error('Payment processing error:', error);
                setStatus('failed');
                setMessage(`Payment processing failed: ${error.message}`);
                setBookingUpdateStatus('failed');
            } finally {
                setLoading(false);
            }
        };

        setTimeout(processPayment, 1500);
    }, [location, bookingId]);

    const handleRetryBookingUpdate = async () => {
        if (paymentDetails?.bookingId) {
            setBookingUpdateStatus('pending');
            await updateBookingStatus(paymentDetails.bookingId);
        }
    };

    const handleDashboardRedirect = () => {
        localStorage.removeItem('pendingPayment');
        localStorage.removeItem('paymentSuccess');
        navigate('/customer/dashboard');
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'success':
                return <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />;
            case 'failed':
                return <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />;
            default:
                return <Clock className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />;
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'success':
                return 'text-green-700 bg-green-50 border border-green-200';
            case 'failed':
                return 'text-red-700 bg-red-50 border border-red-200';
            default:
                return 'text-blue-700 bg-blue-50 border border-blue-200';
        }
    };

    const getBookingStatusMessage = () => {
        switch (bookingUpdateStatus) {
            case 'success':
                return { text: 'Your booking is confirmed!', color: 'text-green-600' };
            case 'failed':
                return { text: 'Booking confirmation pending...', color: 'text-orange-600' };
            case 'pending':
                return { text: 'Confirming booking...', color: 'text-blue-600' };
            default:
                return { text: 'Processing...', color: 'text-gray-600' };
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    {loading ? (
                        <div>
                            <Clock className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                Processing Payment...
                            </h2>
                            <p className="text-gray-600">
                                Please wait while we confirm your payment
                            </p>
                            <div className="mt-4 bg-blue-50 p-3 rounded-lg">
                                <p className="text-sm text-blue-700">
                                    Do not close this window
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {getStatusIcon()}
                            <h2 className={`text-2xl font-bold mb-2 ${
                                status === 'success' ? 'text-green-600' : 
                                status === 'failed' ? 'text-red-600' : 'text-blue-600'
                            }`}>
                                {status === 'success' ? 'Payment Successful!' :
                                 status === 'failed' ? 'Payment Failed' : 'Processing...'}
                            </h2>
                            
                            <div className={`p-4 rounded-lg mb-4 ${getStatusColor()}`}>
                                <p className="font-medium">{message}</p>
                            </div>

                            {/* Booking Status */}
                            {status === 'success' && (
                                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                    <div className={`flex items-center justify-center gap-2 ${getBookingStatusMessage().color}`}>
                                        {bookingUpdateStatus === 'pending' && (
                                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                        )}
                                        <span className="font-medium">{getBookingStatusMessage().text}</span>
                                        {retryCount > 0 && (
                                            <span className="text-sm">
                                                (Attempt {retryCount})
                                            </span>
                                        )}
                                    </div>
                                    
                                    {bookingUpdateStatus === 'failed' && (
                                        <button
                                            onClick={handleRetryBookingUpdate}
                                            className="mt-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm hover:bg-orange-200 flex items-center gap-1 mx-auto"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Retry Confirmation
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Payment Details */}
                            {paymentDetails && (
                                <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-2">
                                    {paymentDetails.paymentId && (
                                        <div className="text-sm">
                                            <span className="text-gray-600">Payment ID: </span>
                                            <span className="font-mono text-gray-800">{paymentDetails.paymentId}</span>
                                        </div>
                                    )}
                                    {paymentDetails.bookingId && (
                                        <div className="text-sm">
                                            <span className="text-gray-600">Booking ID: </span>
                                            <span className="font-mono font-bold text-gray-800">#{paymentDetails.bookingId}</span>
                                        </div>
                                    )}
                                    {paymentDetails.method && (
                                        <div className="text-sm">
                                            <span className="text-gray-600">Payment Method: </span>
                                            <span className="font-medium text-gray-800">{paymentDetails.method}</span>
                                        </div>
                                    )}
                                    {paymentDetails.amount && (
                                        <div className="text-sm">
                                            <span className="text-gray-600">Amount: </span>
                                            <span className="font-medium text-gray-800">₹{paymentDetails.amount}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-3">
                                <button
                                    onClick={handleDashboardRedirect}
                                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <BookOpen size={16} />
                                    View My Bookings
                                    <ArrowRight size={16} />
                                </button>
                                
                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Home size={16} />
                                    Back to Home
                                </button>
                            </div>

                            {(status === 'success' && bookingUpdateStatus === 'success') && (
                                <div className="mt-6 p-3 bg-green-50 rounded-lg">
                                    <p className="text-sm text-green-700">
                                        Booking confirmation sent to your email
                                    </p>
                                    <p className="text-xs text-green-600 mt-1">
                                        Your booking is now confirmed and ready!
                                    </p>
                                </div>
                            )}

                            {(status === 'success' && bookingUpdateStatus === 'failed') && (
                                <div className="mt-6 p-3 bg-orange-50 rounded-lg">
                                    <p className="text-sm text-orange-700">
                                        Payment successful, but booking confirmation is pending
                                    </p>
                                    <p className="text-xs text-orange-600 mt-1">
                                        Don't worry - your payment is secure. Contact support if needed.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;