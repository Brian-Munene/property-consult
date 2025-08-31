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

// Render PayPal button with improved error handling
function renderPayPalButton() {
    const paypalContainer = document.getElementById('paypal-button-container');
    if (!paypalContainer) {
        console.error('PayPal container not found');
        return;
    }
    
    paypalContainer.innerHTML = '<div class="loading-payment">Loading PayPal...</div>';
    
    // Check if PayPal SDK is loaded
    if (typeof paypal === 'undefined') {
        console.log('PayPal SDK not loaded yet, retrying...');
        setTimeout(renderPayPalButton, 1000);
        return;
    }
    
    // Additional check for PayPal.Buttons
    if (typeof paypal.Buttons !== 'function') {
        console.error('PayPal.Buttons is not available');
        showManualPaymentInstructions();
        return;
    }
    
    try {
        console.log('PayPal SDK loaded successfully, creating button...');
        console.log('PayPal object:', paypal);
        
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
                    showStep(2);
                    localStorage.setItem('paymentId', data.orderID);
                    localStorage.setItem('paymentDetails', JSON.stringify(details));
                }).catch(function(err) {
                    console.error('Payment capture failed:', err);
                    alert('Payment verification failed. Please contact support.');
                    showManualPaymentInstructions();
                });
            },
            onError: function(err) {
                console.error('PayPal error:', err);
                console.error('Error details:', JSON.stringify(err, null, 2));
                alert('There was an error with PayPal. Please try again or use alternative payment methods.');
                showManualPaymentInstructions();
            },
            onCancel: function(data) {
                console.log('PayPal payment cancelled');
                alert('Payment was cancelled. You can try again or use manual payment methods.');
            }
        });
        
        // Check if button is eligible and render
        if (button.isEligible()) {
            console.log('PayPal button is eligible, rendering...');
            button.render("#paypal-button-container").then(function() {
                console.log('PayPal button rendered successfully');
            }).catch(function(err) {
                console.error('PayPal button render failed:', err);
                console.error('Render error details:', JSON.stringify(err, null, 2));
                showManualPaymentInstructions();
            });
        } else {
            console.log('PayPal button not eligible, showing manual payment');
            showManualPaymentInstructions();
        }
    } catch (error) {
        console.error('PayPal button creation error:', error);
        console.error('Error stack:', error.stack);
        showManualPaymentInstructions();
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
                    <li><strong>PayPal.me:</strong> <a href="https://paypal.me/Tedfield/1000" target="_blank" class="paypal-link">Click here to pay $1000 via PayPal</a></li>
                    <li><strong>Direct PayPal:</strong> Tedfield@outlook.com</li>
                    <li>Bank Transfer (contact for details)</li>
                    <li>Mobile Money (contact for details)</li>
                </ul>
            </div>
            <div class="payment-actions">
                <a href="https://paypal.me/Tedfield/1000" target="_blank" class="paypal-pay-btn">Pay $1000 via PayPal.me</a>
                <button class="manual-payment-btn" onclick="proceedToForm()">I have completed payment</button>
            </div>
        </div>
    `;
}

// Function to proceed to form after manual payment
function proceedToForm() {
    showStep(2);
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
        
        // Wait for PayPal SDK to be fully loaded
        let attempts = 0;
        const maxAttempts = 10;
        
        // Add a safety timeout to prevent infinite loading
        const safetyTimeout = setTimeout(() => {
            console.log('Safety timeout reached, showing manual payment');
            showManualPaymentInstructions();
        }, 8000); // 8 second safety timeout
        
        function tryRenderPayPal() {
            console.log(`Attempt ${attempts + 1}: Checking PayPal SDK...`);
            console.log('typeof paypal:', typeof paypal);
            if (typeof paypal !== 'undefined') {
                console.log('PayPal object properties:', Object.keys(paypal));
                console.log('PayPal.Buttons type:', typeof paypal.Buttons);
            }
            
            if (typeof paypal !== 'undefined' && typeof paypal.Buttons === 'function') {
                console.log('PayPal SDK ready, rendering button...');
                clearTimeout(safetyTimeout);
                renderPayPalButton();
            } else if (attempts < maxAttempts) {
                attempts++;
                console.log(`PayPal SDK not ready, attempt ${attempts}/${maxAttempts}, retrying...`);
                setTimeout(tryRenderPayPal, 500);
            } else {
                console.log('PayPal SDK failed to load after all attempts, showing manual payment');
                clearTimeout(safetyTimeout);
                showManualPaymentInstructions();
            }
        }
        
        // Start trying to render PayPal button
        setTimeout(tryRenderPayPal, 100);
        
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
        consultationModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        resetForm();
    });

    // Reset form and modal state
    function resetForm() {
        consultationForm.reset();
        showStep(1);
        localStorage.removeItem('paymentId');
    }
});
