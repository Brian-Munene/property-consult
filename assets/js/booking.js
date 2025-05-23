// WhatsApp configuration
const WHATSAPP_NUMBER = '+254726600953';

function renderPayPalButton() {
    paypal.Buttons({
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: '10.00' // Replace with dynamic amount if needed
                    }
                }]
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                alert('Payment completed by ' + details.payer.name.given_name);
            });
        }
    }).render('#paypal-button-container');
}

// Booking form functionality
document.addEventListener('DOMContentLoaded', function() {
    const fab = document.querySelector('.fab');
    const modal = document.querySelector('.booking-modal');
    const closeBtn = document.querySelector('.close-btn');
    const bookingForm = document.getElementById('bookingForm');
    const pesapalContainer = document.getElementById('pesapal-button-container');
    const dateInput = document.getElementById('date');
    const dateError = document.getElementById('dateError');
// Set minimum date to today
// Create a date object for today with time set to beginning of day in local timezone
const today = new Date();
today.setHours(0, 0, 0, 0);

// Format date to YYYY-MM-DD for input min attribute
const formattedDate = today.toISOString().split('T')[0];
dateInput.setAttribute('min', formattedDate);

// Add date input validation
dateInput.addEventListener('change', function(e) {
    // Create date object from selected date (will be in local timezone)
    const selectedDateParts = e.target.value.split('-').map(Number);
    const selectedDate = new Date(selectedDateParts[0], selectedDateParts[1] - 1, selectedDateParts[2]);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        dateError.textContent = 'Please select a future date';
        dateInput.classList.add('error');
        e.target.value = '';
    } else {
        dateError.textContent = '';
        dateInput.classList.remove('error');
    }
});

    fab.addEventListener('click', () => {
        modal.classList.add('active');
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        pesapalContainer.style.display = 'none';
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            pesapalContainer.style.display = 'none';
        }
    });

    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate date before submission
        const selectedDate = new Date(document.getElementById('date').value);
        if (selectedDate < today) {
            dateError.textContent = 'Please select a future date';
            dateInput.classList.add('error');
            return;
        }

        const formData = {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            property: document.getElementById('property').value,
            date: document.getElementById('date').value,
            amount: document.getElementById('budget').value
        };

        try {
            // Show the Pesapal payment container
            pesapalContainer.style.display = 'block';
            
// Create Pesapal iframe
const pesapalIframe = document.createElement('iframe');
pesapalIframe.style.width = '100%';
pesapalIframe.style.border = 'none';

// Responsive iframe height
const viewportHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
const maxHeight = Math.min(700, viewportHeight * 0.8); // Cap at 80% of viewport height or 700px
pesapalIframe.style.height = `${maxHeight}px`;

// Add appropriate attributes for security and accessibility
pesapalIframe.setAttribute('title', 'Pesapal Payment Form');
pesapalIframe.setAttribute('sandbox', 'allow-scripts allow-forms allow-same-origin allow-popups');

            // Get the currency based on the property location
            const currency = getCurrencyForProperty(formData.property);
            
            // Generate order tracking ID
            const orderTrackingId = generateOrderId();

            // Set Pesapal iframe URL with necessary parameters
const pesapalUrl = getPesapalUrl({
    amount: formData.amount,
    currency: currency,
    description: `Property Viewing - ${formData.property}`,
    type: 'MERCHANT',
    reference: orderTrackingId,
    first_name: formData.name ? formData.name.split(' ')[0] : 'Guest',
    last_name: formData.name && formData.name.split(' ').length > 1 
        ? formData.name.split(' ').slice(1).join(' ') 
        : '',
    email: '',
    phone: formData.phone,
    callback_url: `${window.location.origin}/pesapal-callback.html`
});

            pesapalIframe.src = pesapalUrl;
            
            // Clear any existing iframe and add the new one
            pesapalContainer.innerHTML = '<h3>Complete Payment</h3>';
            pesapalContainer.appendChild(pesapalIframe);

        } catch (error) {
            console.error('Payment initialization failed:', error);
            alert('Failed to initialize payment. Please try again.');
        }
    });
});

// Helper function to get currency based on property location
function getCurrencyForProperty(property) {
    // Standardize property name for comparison
    const propertyLower = property.toLowerCase();
    
    // Check for country/city names in the property string
    if (propertyLower.includes('kampala') || propertyLower.includes('uganda')) return 'UGX';
    if (propertyLower.includes('kigali') || propertyLower.includes('rwanda')) return 'RWF';
    if (propertyLower.includes('dar-es-salaam') || propertyLower.includes('tanzania') || 
        propertyLower.includes('daresalam')) return 'TZS';
    if (propertyLower.includes('addis') || propertyLower.includes('ethiopia')) return 'ETB';
    return 'KES'; // Default to KES for Kenyan properties
}

// Helper function to generate unique order ID
function generateOrderId() {
    return 'ORDER-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Helper function to construct Pesapal iframe URL
function getPesapalUrl(params) {
    // Verify that pesapalConfig is defined
    if (!window.pesapalConfig) {
        console.error('Pesapal configuration is missing');
        throw new Error('Payment configuration error. Please contact support.');
    }

    const baseUrl = pesapalConfig.testing 
        ? 'https://demo.pesapal.com/api/PostPesapalDirectOrderV4' 
        : 'https://www.pesapal.com/api/PostPesapalDirectOrderV4';

    // Add additional required parameters
    const urlParams = new URLSearchParams({
        oauth_consumer_key: pesapalConfig.consumer_key,
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
        oauth_nonce: Date.now().toString() + Math.random().toString(36).substring(2, 10),
        oauth_version: '1.0',
        ...params
    });

    return `${baseUrl}?${urlParams.toString()}`;
}
/*
:TODO:
- Use Pesapal for payment processing
*/