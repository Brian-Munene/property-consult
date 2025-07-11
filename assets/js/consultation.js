const WHATSAPP_NUMBER = '254726600953';
let paymentButtonClickCount = 0; // Track PayPal/Checkout button clicks

// Notification helper
function showNotification(message, type = 'info') {
    let notification = document.getElementById('consultation-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'consultation-notification';
        notification.style.position = 'fixed';
        notification.style.top = '30px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.zIndex = '9999';
        notification.style.padding = '1rem 2rem';
        notification.style.borderRadius = '6px';
        notification.style.fontWeight = 'bold';
        notification.style.fontSize = '1rem';
        notification.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        notification.style.transition = 'opacity 0.3s';
        document.body.appendChild(notification);
    }
    notification.textContent = message;
    notification.style.background = type === 'warning' ? '#fff3cd' : type === 'error' ? '#f8d7da' : '#d1e7dd';
    notification.style.color = type === 'warning' ? '#856404' : type === 'error' ? '#842029' : '#0f5132';
    notification.style.opacity = '1';
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => { notification.style.display = 'none'; }, 400);
    }, 3000);
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
                    showNotification('Payment completed successfully! Please proceed to the next step.', 'success');
                    window.__onPayPalApproved();
                } catch (error) {
                    console.error('Failed to save payment data:', error);
                    showNotification('Payment completed but failed to save. Please contact support.', 'error');
                }
            }
        }).render("#paypal-container-KNTZTASJHPXU2")
        .then(function() {
            // Attach click listeners to PayPal and Checkout buttons after render
            setTimeout(() => {
                const paypalBtn = paypalContainer.querySelector('button');
                if (paypalBtn) {
                    paypalBtn.addEventListener('click', function() {
                        paymentButtonClickCount++;
                        paymentInteraction = true;
                    });
                }
                // Also check for a Checkout button (if present)
                const checkoutBtn = paypalContainer.querySelector('button[data-funding-source="checkout"]');
                if (checkoutBtn) {
                    checkoutBtn.addEventListener('click', function() {
                        paymentButtonClickCount++;
                        paymentInteraction = true;
                    });
                }
            }, 100); // Wait for DOM update
        })
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

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing consultation module');
    // Modal elements
    const consultationModal = document.querySelector('.consultation-modal');
    const consultationBtn = document.querySelector('.consultation-btn');
    const closeConsultationBtn = document.querySelector('.close-consultation-btn');
    const consultationForm = document.getElementById('consultationForm');

    // Ensure PayPal button is always rendered when modal opens
    function showConsultationModal() {
        consultationModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
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
        // Check for PayPal payment interaction before sending message
        if (!paymentInteraction) {
            showNotification('Please complete the payment before submitting the form.', 'warning');
            return;
        }
        // Get form data with validation
        const name = document.getElementById('name')?.value.trim() || '';
        const interest = document.getElementById('Interest')?.value.trim() || '';
        const countryOrigin = document.getElementById('countryOrigin')?.value.trim() || '';
        if (!name || !interest || !countryOrigin) {
            showNotification('Please fill in all required fields before submitting the form.', 'warning');
            return;
        }
        const message = encodeURIComponent(
            'Hello, I would like to book a consultation.\n\n' +
            'Contact Details:\n' +
            '- Name: ' + name + '\n' +
            '- Country of Interest: ' + interest + '\n' +
            '- Country of Origin: ' + countryOrigin + '\n' +
            '- Payment Status: Completed'
        );
        window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + message, '_blank');
        // Reset form and close modal
        this.reset();
        closeModal();
    });

    // Properly close the consultation modal
    function closeModal() {
        const consultationModal = document.querySelector('.consultation-modal');
        if (consultationModal) {
            consultationModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    // Reset form and modal state
    function resetForm() {
        if (typeof consultationForm !== 'undefined' && consultationForm) {
            consultationForm.reset();
        }
        localStorage.removeItem('paymentId');
    }

    // Listen for PayPal payment approval to set paymentInteraction
    let paymentInteraction = false;
    window.__onPayPalApproved = function() {
        paymentInteraction = true;
    };
});
