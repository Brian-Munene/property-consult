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

    // Format viewing fee input with comma separators
    const viewingFeeInput = document.getElementById('budget');
    function formatNumberWithCommas(value) {
        const digits = value.replace(/\D/g, '');
        if (!digits) return '';
        return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    if (viewingFeeInput) {
        viewingFeeInput.addEventListener('input', (e) => {
            const start = e.target.selectionStart;
            const oldLength = e.target.value.length;
            e.target.value = formatNumberWithCommas(e.target.value);
            const newLength = e.target.value.length;
            const pos = Math.max(0, start + (newLength - oldLength));
            e.target.setSelectionRange(pos, pos);
        });

        viewingFeeInput.addEventListener('blur', (e) => {
            e.target.value = formatNumberWithCommas(e.target.value);
        });
    }

    // Handle form submission - send WhatsApp message
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Normalize budgetLimit: validate pattern and set raw numeric hidden field
            const formatted = budgetLimitInput ? budgetLimitInput.value : '';
            if (budgetLimitInput) {
                const pattern = new RegExp('^\\d{1,3}(,\\d{3})*$');
                if (formatted && !pattern.test(formatted)) {
                    alert('Please enter a valid budget using digits and optional thousands commas, e.g. 20,000,000');
                    budgetLimitInput.focus();
                    return;
                }
                const raw = formatted.replace(/\D/g, '');
                const hidden = document.getElementById('budgetLimit_raw');
                if (hidden) hidden.value = raw;
            }

            // Normalize viewing fee: validate pattern and set raw numeric hidden field
            const formattedBudget = viewingFeeInput ? viewingFeeInput.value : '';
            if (viewingFeeInput) {
                const pattern2 = new RegExp('^\\d{1,3}(,\\d{3})*$');
                if (formattedBudget && !pattern2.test(formattedBudget)) {
                    alert('Please enter a valid viewing fee using digits and optional thousands commas, e.g. 1,000');
                    viewingFeeInput.focus();
                    return;
                }
                const rawBudget = formattedBudget.replace(/\D/g, '');
                const hiddenBudget = document.getElementById('budget_raw');
                if (hiddenBudget) hiddenBudget.value = rawBudget;
            }

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
                 // raw numeric value available under budgetLimit_raw for consumers expecting numeric
                 budgetLimit_raw: document.getElementById('budgetLimit_raw') ? document.getElementById('budgetLimit_raw').value : '',
                 // viewing fee formatted and raw
                 viewingFee: document.getElementById('budget') ? document.getElementById('budget').value : '',
                 viewingFee_raw: document.getElementById('budget_raw') ? document.getElementById('budget_raw').value : '',
                 date: document.getElementById('date').value,
                // backup: keep original reading for compatibility
                // viewingFee is above
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