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
        paypal.HostedButtons({
            hostedButtonId: "U798KMLCDHKJY",
            onApprove: function(data, actions) {
                alert('Payment completed successfully! Please proceed to step 2.');
                document.getElementById('step1').classList.add('hidden');
                document.getElementById('step2').classList.remove('hidden');
                localStorage.setItem('paymentId', data.orderID);
            }
        }).render("#paypal-button-container")
        .catch(function(error) {
            console.error('PayPal button render error:', error);
        });
    } else {
        setTimeout(renderPayPalButton, 1000);
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
        renderPayPalButton();
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
