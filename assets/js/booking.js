document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const fab = document.querySelector('.fab');
    const modal = document.querySelector('.booking-modal');
    const closeBtn = document.querySelector('.booking-modal .close-btn');
    const bookingForm = document.getElementById('bookingForm');
    const dateInput = document.getElementById('date');

    // Set minimum date to today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const formattedDate = today.toISOString().split('T')[0];
    
    if (dateInput) {
        dateInput.setAttribute('min', formattedDate);
        
        // Add date input validation
        dateInput.addEventListener('change', function(e) {
            const selectedDateParts = e.target.value.split('-').map(Number);
            const selectedDate = new Date(selectedDateParts[0], selectedDateParts[1] - 1, selectedDateParts[2]);
            selectedDate.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                alert('Please select a future date');
                e.target.value = '';
            }
        });
    }

    // Open modal when FAB is clicked
    if (fab) {
        fab.addEventListener('click', () => {
            modal.classList.add('active');
        });
    }

    // Close modal when close button is clicked
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            resetForm();
        });
    }

    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                resetForm();
            }
        });
    }

    // Format budget limit input with comma separators
    const budgetLimitInput = document.getElementById('budgetLimit');
    if (budgetLimitInput) {
        function formatWithCommas(value) {
            const digits = value.replace(/\D/g, '');
            if (!digits) return '';
            return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }

        budgetLimitInput.addEventListener('input', (e) => {
            const start = e.target.selectionStart;
            const oldLength = e.target.value.length;
            e.target.value = formatWithCommas(e.target.value);
            // move caret to end to avoid complex cursor math (acceptable for this form)
            const newLength = e.target.value.length;
            const pos = Math.max(0, start + (newLength - oldLength));
            e.target.setSelectionRange(pos, pos);
        });

        // Optional: ensure formatting on blur as well
        budgetLimitInput.addEventListener('blur', (e) => {
            e.target.value = formatWithCommas(e.target.value);
        });
    }

    // Handle form submission - send WhatsApp message
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate date before submission
            const selectedDate = new Date(document.getElementById('date').value);
            if (selectedDate < today) {
                alert('Please select a future date');
                return;
            }

            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                propertyType: document.getElementById('propertyType').value,
                bedrooms: document.getElementById('bedrooms').value,
                locations: document.getElementById('locations').value,
                // budgetLimit is stored formatted (with commas) in the input
                budgetLimit: document.getElementById('budgetLimit').value,
                date: document.getElementById('date').value,
                viewingFee: document.getElementById('budget').value
            };

            // Create WhatsApp message
            const message = encodeURIComponent(
                '🏠 *PROPERTY VIEWING REQUEST*\n\n' +
                '*Contact Details:*\n' +
                '• Name: ' + formData.name + '\n\n' +
                '*Property Preferences:*\n' +
                '• Type: ' + formData.propertyType + '\n' +
                '• Bedrooms: ' + formData.bedrooms + '\n' +
                '• Preferred Locations: ' + formData.locations + '\n' +
                '• Budget Limit: KSH ' + formData.budgetLimit + '\n\n' +
                '*Viewing Details:*\n' +
                '• Preferred Date: ' + formData.date + '\n' +
                '• Viewing Fee: KSH ' + formData.viewingFee + '\n\n' +
                'Please contact me to schedule this property viewing appointment.'
            );

            // Open WhatsApp with the message
            const whatsappNumber = '254726600953'; // Property Consult WhatsApp number
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
            
            // Open WhatsApp in new tab
            window.open(whatsappUrl, '_blank');
            
            // Show success message
            alert('Thank you! Your viewing request has been sent via WhatsApp. We will contact you shortly to confirm your appointment.');
            
            // Close modal and reset form
            modal.classList.remove('active');
            resetForm();
        });
    }

    // Reset form function
    function resetForm() {
        if (bookingForm) {
            bookingForm.reset();
        }
    }
});