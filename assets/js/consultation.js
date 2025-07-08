// Global variables
const WHATSAPP_NUMBER = '254726600953';
let modal = null;

// Helper function to update the step navbar
function updateStepNavbar(stepNumber) {
    const step1 = document.getElementById('step-nav-1');
    const step2 = document.getElementById('step-nav-2');
    if (step1 && step2) {
        if (stepNumber === 1) {
            step1.classList.add('active');
            step2.classList.remove('active');
        } else if (stepNumber === 2) {
            step1.classList.remove('active');
            step2.classList.add('active');
        }
    }
}

// Helper function to show/hide booking steps
function showStep(stepNumber) {
    const steps = document.querySelectorAll('.booking-step');
    steps.forEach((step, index) => {
        step.classList.toggle('hidden', index + 1 !== stepNumber);
    });
    updateStepNavbar(stepNumber);
    // Focus the first input in step 2 for better UX
    if (stepNumber === 2) {
        setTimeout(() => {
            const nameInput = document.getElementById('name');
            if (nameInput) nameInput.focus();
        }, 200);
    }
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

// Render PayPal button for consultation modal
function renderConsultationPayPalButton(retryCount = 0) {
    const MAX_RETRIES = 10;
    const paypalContainer = document.getElementById('paypal-container-KNTZTASJHPXU2');
    if (!paypalContainer) return;
    paypalContainer.innerHTML = '';
    if (typeof paypal !== 'undefined') {
        paypal.HostedButtons({
            hostedButtonId: "KNTZTASJHPXU2",
            onApprove: function(data, actions) {
                try {
                    localStorage.setItem('paymentId', data.orderID);
                    showNotification('Payment completed successfully! Please proceed to step 2.', 'success');
                    console.log('PayPal payment approved, transitioning to step 2');
                    showStep(2);
                } catch (error) {
                    console.error('Failed to save payment data:', error);
                    showNotification('Payment completed but failed to save. Please contact support.', 'error');
                }
            }
        }).render("#paypal-container-KNTZTASJHPXU2")
        .catch(function(error) {
            console.error('PayPal button render error:', error);
            paypalContainer.innerHTML = '<p class="error-message">Failed to load payment button. Please refresh the page or contact support.</p>';
            showNotification('Failed to load payment button. Please refresh the page or contact support.', 'error');
        });
    } else {
        if (retryCount < MAX_RETRIES) {
            setTimeout(() => renderConsultationPayPalButton(retryCount + 1), 1000);
        } else {
            paypalContainer.innerHTML = '<p class="error-message">Payment system unavailable. Please try again later.</p>';
            showNotification('Payment system unavailable. Please try again later.', 'error');
        }
    }
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
        consultationModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        showStep(1);
        renderConsultationPayPalButton();
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
        showStep(1);
        localStorage.removeItem('paymentId');
    }
});
