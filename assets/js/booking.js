document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const fab = document.querySelector('.fab');
    const modal = document.querySelector('.booking-modal');
    const closeBtn = document.querySelector('.booking-modal .close-btn');
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
            pesapalContainer.style.display = 'block';
            pesapalContainer.innerHTML = '<h3>Complete Payment</h3><div id="paypal-button-container"></div>';
            // Render PayPal button with dynamic amount
            if (window.paypal) {
                paypal.Buttons({
                    createOrder: function(data, actions) {
                        return actions.order.create({
                            purchase_units: [{
                                amount: { value: formData.amount }
                            }]
                        });
                    },
                    onApprove: function(data, actions) {
                        return actions.order.capture().then(function(details) {
                            pesapalContainer.innerHTML = '<h3>Payment Successful!</h3><p>Thank you, ' + details.payer.name.given_name + '.</p>';
                        });
                    },
                    onError: function(err) {
                        pesapalContainer.innerHTML = '<h3>Payment Error</h3><p>' + err + '</p>';
                    }
                }).render('#paypal-button-container');
            } else {
                pesapalContainer.innerHTML += '<p>PayPal SDK not loaded. Please refresh the page.</p>';
            }
        } catch (error) {
            console.error('Payment initialization failed:', error);
            alert('Failed to initialize payment. Please try again.');
        }
    });
});