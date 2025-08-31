// Global variables
const WHATSAPP_NUMBER = '254726600953';
let modal = null;

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
        const form = document.getElementById('consultationForm');
        if (form) {
            form.reset();
        }
    }
}

function closeModal() {
    if (modal) {
        modal.classList.remove('active');
    }
}

// Render PayPal button
function renderPayPalButton() {
    const paypalContainer = document.getElementById('paypal-button-container');
    if (!paypalContainer) return;
    
    paypalContainer.innerHTML = '';
    
    if (typeof paypal !== 'undefined') {
        console.log('PayPal SDK loaded successfully');
        try {
            const button = paypal.Buttons({
                createOrder: function(data, actions) {
                    console.log('Creating PayPal order...');
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: '1000.00',
                                currency_code: 'USD'
                            },
                            description: 'Property Consult - African Diaspora Consultation Fee'
                        }]
                    });
                },
                onApprove: function(data, actions) {
                    console.log('PayPal order approved, capturing payment...');
                    return actions.order.capture().then(function(details) {
                        console.log('Payment captured successfully:', details);
                        // Payment successful
                        alert('Payment completed successfully! Please proceed to step 2.');
                        document.getElementById('step1').classList.add('hidden');
                        document.getElementById('step2').classList.remove('hidden');
                        localStorage.setItem('paymentId', data.orderID);
                        localStorage.setItem('paymentDetails', JSON.stringify(details));
                    });
                },
                onError: function(err) {
                    console.error('PayPal error:', err);
                    alert('There was an error with the payment. Please try again or contact support.');
                    // Fallback to manual payment instructions
                    showManualPaymentInstructions();
                },
                onCancel: function(data) {
                    console.log('PayPal payment cancelled');
                    alert('Payment was cancelled. You can try again or use manual payment methods.');
                }
            });
            
            if (button.isEligible()) {
                button.render("#paypal-button-container");
                console.log('PayPal button rendered successfully');
            } else {
                console.log('PayPal button not eligible, showing manual payment');
                showManualPaymentInstructions();
            }
        } catch (error) {
            console.error('PayPal button creation error:', error);
            // Fallback to manual payment instructions
            showManualPaymentInstructions();
        }
    } else {
        console.log('PayPal SDK not loaded yet, retrying...');
        setTimeout(renderPayPalButton, 1000);
    }
}

// Fallback for manual payment instructions
function showManualPaymentInstructions() {
    const paypalContainer = document.getElementById('paypal-button-container');
    if (!paypalContainer) return;
    
    paypalContainer.innerHTML = `
        <div class="manual-payment-instructions">
            <h4>Payment Instructions</h4>
            <p>Please complete the payment of USD 1000 to proceed with your consultation booking.</p>
            <div class="payment-methods">
                <p><strong>Payment Methods:</strong></p>
                <ul>
                    <li>PayPal: Tedfield@outlook.com</li>
                    <li>Bank Transfer (contact for details)</li>
                    <li>Mobile Money (contact for details)</li>
                </ul>
            </div>
            <button class="manual-payment-btn" onclick="proceedToForm()">I have completed payment</button>
        </div>
    `;
}

// Function to proceed to form after manual payment
function proceedToForm() {
    document.getElementById('step1').classList.add('hidden');
    document.getElementById('step2').classList.remove('hidden');
    localStorage.setItem('paymentId', 'manual-payment-' + Date.now());
}

// Form submission handler
function handleFormSubmit(e) {
    e.preventDefault();

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

    // Ensure PayPal button is always rendered when modal opens
    function showConsultationModal() {
        consultationModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Show loading state
        const paypalContainer = document.getElementById('paypal-button-container');
        if (paypalContainer) {
            paypalContainer.innerHTML = '<div class="loading-payment">Loading payment options...</div>';
        }
        
        // Render PayPal button with a small delay to ensure modal is visible
        setTimeout(() => {
            renderPayPalButton();
        }, 100);
        
        showStep(1);
    }

    // Attach to both .fab and .consultation-btn
    const fabBtn = document.querySelector('.fab');
    if (fabBtn) {
        fabBtn.addEventListener('click', showConsultationModal);
    }
    if (consultationBtn) {
        consultationBtn.addEventListener('click', showConsultationModal);
    }

    // Close modal
    closeConsultationBtn.addEventListener('click', () => {
        consultationModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        resetForm();
    });

    // Close modal when clicking outside
    consultationModal.addEventListener('click', (e) => {
        if (e.target === consultationModal) {
            consultationModal.classList.remove('active');
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
