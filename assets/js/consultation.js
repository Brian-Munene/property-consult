// Global variables
const WHATSAPP_NUMBER = '254726600953';
let paymentCompleted = false;
let modal = null;
let openModalBtn = null;
let closeModalBtn = null;
let paypalInitialized = false;

// Helper function to show/hide booking steps
function showStep(stepNumber) {
    const steps = document.querySelectorAll('.booking-step');
    steps.forEach((step, index) => {
        step.classList.toggle('hidden', index + 1 !== stepNumber);
    });
}

// Modal functionality
function openModal() {
    if (modal) {
        modal.classList.add('active');
        showStep(1);
        if (!paypalInitialized) {
            initializePayPal();
        }
        const form = document.getElementById('consultationForm');
        if (form) {
            form.reset();
        }
        paymentCompleted = false;
    }
}

function closeModal() {
    if (modal) {
        modal.classList.remove('active');
    }
}

// Initialize PayPal button
function initializePayPal() {
    if (paypalInitialized || !document.getElementById('paypal-button-container')) return;

    paypal.Buttons({
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: '1000.00',
                        currency_code: 'USD'
                    },
                    description: 'Consultation Fee'
                }]
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                paymentCompleted = true;
                
                const paypalContainer = document.getElementById('paypal-button-container');
                paypalContainer.innerHTML = `
                    <div class="payment-success">
                        <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                            <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" stroke="#25d366" stroke-width="4"/>
                            <path class="checkmark__check" fill="none" stroke="#25d366" stroke-width="4" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                        </svg>
                        <h4>Payment Successful!</h4>
                        <p>Transaction ID: ${details.id}</p>
                    </div>
                `;

                setTimeout(() => {
                    showStep(2);
                }, 1500);
            });
        },
        onError: function(err) {
            console.error('PayPal Error:', err);
            alert('There was an error processing your payment. Please try again.');
        }
    }).render('#paypal-button-container');

    paypalInitialized = true;
}

// Form submission handler
function handleFormSubmit(e) {
    e.preventDefault();

    if (!paymentCompleted) {
        alert('Please complete the payment before submitting your information.');
        showStep(1);
        return;
    }

    const formData = {
        name: document.getElementById('name').value,
        countryInterest: document.getElementById('countryInterest').value,
        countryOrigin: document.getElementById('countryOrigin').value
    };

    const message = encodeURIComponent(
        'Hello, I would like to book a consultation.\n\n' +
        'Contact Details:\n' +
        '- Name: ' + formData.name + '\n' +
        '- Country of Interest: ' + formData.countryInterest + '\n' +
        '- Country of Origin: ' + formData.countryOrigin + '\n\n' +
        '- Payment Status: Completed'
    );

    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + message, '_blank');

    // Reset form and close modal
    this.reset();
    paymentCompleted = false;
    closeModal();
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing consultation module');
    
    // Modal elements
    const consultationModal = document.querySelector('.consultation-modal');
    const consultationBtn = document.querySelector('.consultation-btn');
    const closeConsultationBtn = document.querySelector('.close-consultation-btn');
    const consultationForm = document.getElementById('consultationForm');

    console.log('Modal elements:', {
        consultationModal: consultationModal,
        consultationBtn: consultationBtn,
        closeConsultationBtn: closeConsultationBtn
    });

    // Function to initialize PayPal button
    function initializePayPalButton() {
        if (typeof paypal !== 'undefined') {
            paypal.HostedButtons({
                hostedButtonId: "U798KMLCDHKJY",
                onApprove: function(data, actions) {
                    // Show success message
                    alert('Payment completed successfully! Please proceed to step 2.');
                    
                    // Show step 2
                    document.getElementById('step1').classList.add('hidden');
                    document.getElementById('step2').classList.remove('hidden');
                    
                    // Store payment details
                    localStorage.setItem('paymentId', data.orderID);
                }
            }).render("#paypal-button-container")
            .catch(function(error) {
                console.error('PayPal button render error:', error);
            });
        } else {
            // If PayPal is not loaded yet, try again in 1 second
            setTimeout(initializePayPalButton, 1000);
        }
    }

    // Initialize PayPal button
    initializePayPalButton();

    // Show modal
    consultationBtn.addEventListener('click', () => {
        consultationModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        // Re-initialize PayPal button when modal is opened
        initializePayPalButton();
    });

    // Close modal
    closeConsultationBtn.addEventListener('click', () => {
        consultationModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        resetForm();
    });

    // Close modal when clicking outside
    consultationModal.addEventListener('click', (e) => {
        if (e.target === consultationModal) {
            consultationModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            resetForm();
        }
    });

    // Handle form submission
    consultationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(consultationForm);
        const paymentId = localStorage.getItem('paymentId');
        
        if (!paymentId) {
            alert('Please complete the payment first.');
            return;
        }
        
        // Add payment ID to form data
        formData.append('paymentId', paymentId);
        
        // Here you would typically send the form data to your server
        console.log('Form submitted:', Object.fromEntries(formData));
        
        // Show success message
        alert('Your consultation request has been submitted successfully! We will contact you shortly.');
        
        // Close modal and reset form
        consultationModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        resetForm();
    });

    // Reset form and modal state
    function resetForm() {
        consultationForm.reset();
        document.getElementById('step1').classList.remove('hidden');
        document.getElementById('step2').classList.add('hidden');
        localStorage.removeItem('paymentId');
    }
});
