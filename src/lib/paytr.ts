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

export function generatePaytrToken(params: PaytrTokenParams) {
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

    return {
        merchant_id: merchantId,
        user_ip: userIp,
        merchant_oid: merchantOid,
        email: userEmail,
        payment_amount: paymentAmount,
        paytr_token: paytrToken,
        user_basket: userBasket,
        debug_on: debugOn,
        no_installment: noInstallment,
        max_installment: maxInstallment,
        user_name: userName,
        user_address: userAddress,
        user_phone: userPhone,
        merchant_ok_url: merchantOkUrl,
        merchant_fail_url: merchantFailUrl,
        timeout_limit: timeoutLimit,
        currency: currency,
        test_mode: testMode
    };
}
