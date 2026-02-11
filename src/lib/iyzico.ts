// src/lib/iyzico.ts

// Iyzico API Response Interfaces (Simplified for Mock)
export interface PaymentInitResponse {
    status: 'success' | 'failure';
    paymentId?: string;
    checkoutHtml?: string; // For real integrations
    conversationId?: string;
    errorMessage?: string;
}

export interface PaymentRequest {
    price: number;
    paidPrice: number;
    currency: 'TRY';
    basketId: string;
    paymentGroup: 'PRODUCT';
    callbackUrl: string;
    buyer: {
        id: string;
        name: string;
        surname: string;
        gsmNumber: string;
        email: string;
        identityNumber: string;
        registrationAddress: string;
        ip: string;
        city: string;
        country: string;
    };
    billingAddress: {
        contactName: string;
        city: string;
        country: string;
        address: string;
    };
    basketItems: {
        id: string;
        name: string;
        category1: string;
        price: number;
        itemType: 'VIRTUAL';
    }[];
}

/**
 * Mock function to simulate Iyzico Payment Initialization
 * returns valid success response immediately.
 */
export const initializePayment = async (request: PaymentRequest): Promise<PaymentInitResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log("Mock Payment Initialized for:", request.basketId, "Amount:", request.paidPrice);

    return {
        status: 'success',
        paymentId: `mock_payment_${Date.now()}`,
        conversationId: request.basketId,
        // In real scenario, this would return HTML content or a link
        // For our mock, we just return status success, and client handles it.
    };
};
