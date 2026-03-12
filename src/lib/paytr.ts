import crypto from 'crypto';

interface PaytrTokenParams {
    userEmail: string;
    userName: string;
    userAddress: string;
    userPhone: string;
    merchantOid: string;
    paymentAmount: number; // in kuruş (cents), e.g., 100 TL = 10000
    currency: 'TL' | 'USD' | 'EUR' | 'GBP' | 'RUB';
    userIp: string;
    basket: Array<[string, string, number]>; // [Item Name, Price (TL), Quantity]
    merchantOkUrl: string;
    merchantFailUrl: string;
    testMode?: 0 | 1;
}

export async function generatePaytrToken(params: PaytrTokenParams): Promise<string> {
    const merchantId = process.env.PAYTR_MERCHANT_ID;
    const merchantKey = process.env.PAYTR_MERCHANT_KEY;
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT;

    if (!merchantId || !merchantKey || !merchantSalt) {
        throw new Error('PayTR credentials are not configured in environment variables.');
    }

    const {
        userEmail,
        userName,
        userAddress,
        userPhone,
        merchantOid,
        paymentAmount,
        currency,
        userIp,
        basket,
        merchantOkUrl,
        merchantFailUrl,
        testMode = 1
    } = params;

    const userBasket = Buffer.from(JSON.stringify(basket)).toString('base64');

    // timeout limit in minutes
    const timeoutLimit = '30';

    // debug_on
    const debugOn = '1';

    // max_installment
    const maxInstallment = '0'; // 0 means no limit

    // no_installment
    const noInstallment = '0';

    // Birlestirilecek veri: merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode
    const hashStr = `${merchantId}${userIp}${merchantOid}${userEmail}${paymentAmount}${userBasket}${noInstallment}${maxInstallment}${currency}${testMode}`;

    // HMAC-SHA256 signature
    const paytrToken = crypto
        .createHmac('sha256', merchantKey)
        .update(hashStr + merchantSalt)
        .digest('base64');

    const formData = new URLSearchParams();
    formData.append('merchant_id', merchantId);
    formData.append('user_ip', userIp);
    formData.append('merchant_oid', merchantOid);
    formData.append('email', userEmail);
    formData.append('payment_amount', String(paymentAmount));
    formData.append('paytr_token', paytrToken);
    formData.append('user_basket', userBasket);
    formData.append('debug_on', debugOn);
    formData.append('no_installment', noInstallment);
    formData.append('max_installment', maxInstallment);
    formData.append('user_name', userName);
    formData.append('user_address', userAddress);
    formData.append('user_phone', userPhone);
    formData.append('merchant_ok_url', merchantOkUrl);
    formData.append('merchant_fail_url', merchantFailUrl);
    formData.append('timeout_limit', timeoutLimit);
    formData.append('currency', currency);
    formData.append('test_mode', testMode.toString());

    try {
        const response = await fetch('https://www.paytr.com/odeme/api/get-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });

        const resultText = await response.text();
        let result;
        
        try {
            result = JSON.parse(resultText);
        } catch (parseError) {
            console.error('PayTR API Response is not JSON:', resultText);
            throw new Error('PayTR geçersiz yanıt döndürdü (JSON parse hatası).');
        }

        if (result.status === 'success') {
            return result.token;
        } else {
            console.error('PayTR API Error:', result.reason || result);
            throw new Error(`PayTR Hatası: ${result.reason || 'Bilinmeyen hata'}`);
        }
    } catch (error) {
        console.error('PayTR Token Generation Error:', error);
        throw error;
    }
}
