document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('appointmentForm');
    const responseDiv = document.getElementById('response');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Processing...';
        submitButton.disabled = true;

        // Clear previous messages
        responseDiv.textContent = '';
        responseDiv.className = 'response-message';

        try {
            // Form data collection
            const formData = {
                firstName: document.getElementById('firstName').value.trim(),
                lastName: document.getElementById('lastName').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                date: document.getElementById('date').value,
                time: document.getElementById('time').value,
                service: document.getElementById('service').value
            };

            // Client-side validation
            const errors = [];
            if (!formData.firstName) errors.push('First name is required');
            if (!formData.lastName) errors.push('Last name is required');
            if (!formData.email) errors.push('Email is required');
            if (!formData.phone) errors.push('Phone is required');
            if (!formData.date) errors.push('Date is required');
            if (!formData.time) errors.push('Time is required');
            if (!formData.service) errors.push('Service is required');

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (formData.email && !emailRegex.test(formData.email)) {
                errors.push('Please enter a valid email address');
            }

            if (errors.length > 0) {
                throw new Error(errors.join('\n'));
            }

            // Send to server with error handling
            let response;
            try {
                response = await fetch('http://localhost:5000/book-appointment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(formData),
                    mode: 'cors'
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));

                    // In your fetch error handling:
                    if (errorData.type === 'database_error') {
                        responseDiv.textContent = 'Database error: ' + errorData.message;
                    } else if (errorData.type === 'validation_error') {
                        responseDiv.textContent = 'Validation error: ' + errorData.message;
                    } else {
                        responseDiv.textContent = 'Error: ' + (errorData.message || 'Unknown error');
                    }

                    throw new Error(errorData.message || `Server error: ${response.status}`);
                }

                const data = await response.json();

                if (data.success) {
                    document.getElementById('response').textContent = data.message;
                    document.getElementById('response').style.color = 'green';
                    document.getElementById('appointmentForm').reset(); // Очистка формы
                } else {
                    document.getElementById('response').textContent = data.error;
                    document.getElementById('response').style.color = 'red';
                }

                // Success
                responseDiv.textContent = data.message || 'Appointment booked successfully!';
                responseDiv.classList.add('success');
                form.reset();
            } catch (error) {
                // Special handling for network errors
                if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                    throw new Error('Could not connect to the server. Please check your network connection and try again.');
                }
                throw error;
            }
        } catch (error) {
            responseDiv.textContent = error.message;
            responseDiv.classList.add('error');
        } finally {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    });
});
