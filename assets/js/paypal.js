// PayPal payment logic for Property Consult
// This file replaces pesapal.js and should contain all payment logic

// Helper: Render PayPal button dynamically
function renderPayPalButton({ amount, onSuccess, onError, containerId = 'paypal-button-container' }) {
    if (!window.paypal) {
        document.getElementById(containerId).innerHTML = '<p>PayPal SDK not loaded. Please refresh the page.</p>';
        return;
    }
    paypal.Buttons({
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{ amount: { value: amount } }]
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                if (typeof onSuccess === 'function') onSuccess(details);
            });
        },
        onError: function(err) {
            if (typeof onError === 'function') onError(err);
        }
    }).render(`#${containerId}`);
}

// Example usage (to be called from booking.js or other modules):
// renderPayPalButton({
//   amount: '100.00',
//   onSuccess: (details) => { ... },
//   onError: (err) => { ... },
//   containerId: 'paypal-button-container'
// });

// You can add more PayPal-related helpers here as needed.
