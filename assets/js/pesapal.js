// Pesapal OAuth and API handling
class PesapalAPI {
    constructor(consumerKey, consumerSecret, isTesting = true) {
        this.consumerKey = consumerKey;
        this.consumerSecret = consumerSecret;
        this.baseUrl = isTesting 
            ? 'https://demo.pesapal.com/api' 
            : 'https://www.pesapal.com/api';
    }

    // Generate OAuth signature
    generateOAuthSignature(method, url, params) {
        const signatureBaseString = this.createSignatureBaseString(method, url, params);
        return CryptoJS.HmacSHA1(signatureBaseString, this.consumerSecret + '&').toString(CryptoJS.enc.Base64);
    }

    // Create OAuth signature base string
    createSignatureBaseString(method, url, params) {
        const sortedParams = {};
        Object.keys(params).sort().forEach(key => {
            sortedParams[key] = params[key];
        });

        const paramString = Object.entries(sortedParams)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');

        return `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;
    }

    // Generate OAuth header
    generateOAuthHeader(params) {
        const oauthParams = {
            oauth_consumer_key: this.consumerKey,
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: Math.floor(Date.now() / 1000),
            oauth_nonce: Math.random().toString(36).substr(2, 9),
            oauth_version: '1.0'
        };

        const allParams = { ...params, ...oauthParams };
        const signature = this.generateOAuthSignature('POST', `${this.baseUrl}/PostPesapalDirectOrderV4`, allParams);
        oauthParams.oauth_signature = signature;

        return 'OAuth ' + Object.entries(oauthParams)
            .map(([key, value]) => `${key}="${encodeURIComponent(value)}"`)
            .join(', ');
    }

    // Generate IframeURL for payment
    generateIframeUrl(orderDetails) {
        const params = {
            Amount: orderDetails.amount,
            Description: orderDetails.description,
            Type: 'MERCHANT',
            Reference: orderDetails.reference,
            FirstName: orderDetails.firstName,
            LastName: orderDetails.lastName,
            Email: orderDetails.email || '',
            PhoneNumber: orderDetails.phoneNumber,
            Currency: orderDetails.currency,
            CallbackUrl: orderDetails.callbackUrl
        };

        const oauthHeader = this.generateOAuthHeader(params);
        const queryString = new URLSearchParams(params).toString();

        return `${this.baseUrl}/PostPesapalDirectOrderV4?${queryString}`;
    }

    // Verify payment status
    async checkPaymentStatus(merchantReference, trackingId) {
        const url = `${this.baseUrl}/querypaymentstatus`;
        const params = {
            pesapal_merchant_reference: merchantReference,
            pesapal_transaction_tracking_id: trackingId
        };

        try {
            const response = await fetch(`${url}?${new URLSearchParams(params)}`, {
                headers: {
                    'Authorization': this.generateOAuthHeader(params)
                }
            });

            if (!response.ok) {
                throw new Error('Payment status check failed');
            }

            const data = await response.json();
            return data;

        } catch (error) {
            console.error('Error checking payment status:', error);
            throw error;
        }
    }
}