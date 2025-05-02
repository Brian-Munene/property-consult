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
function initializeBookingForm() {
    const fab = document.querySelector('.fab');
    const modal = document.querySelector('.booking-modal');
    const closeBtn = document.querySelector('.close-btn');
    const bookingForm = document.getElementById('bookingForm');

    if (!fab || !modal || !closeBtn || !bookingForm) {
        console.warn('Booking form elements not found');
        return;
    }

    fab.addEventListener('click', () => {
        modal.classList.add('active');
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone')?.value || '',
            property: document.getElementById('property').value,
            date: document.getElementById('date').value
        };

        const message = `Hello! I would like to book a viewing:\n\nName: ${formData.name}${formData.phone ? '\nPhone: ' + formData.phone : ''}\nProperty: ${formData.property}\nPreferred Date: ${formData.date}`;
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
        modal.classList.remove('active');
        bookingForm.reset();

        // Display PayPal button container after sending message
        const paypalContainer = document.getElementById('paypal-button-container');
        if (paypalContainer) {
            paypalContainer.style.display = 'block';
            renderPayPalButton();
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeBookingForm);