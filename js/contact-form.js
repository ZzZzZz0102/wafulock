(function () {
    function initContactForm() {
        var form = document.getElementById('contactForm');
        if (!form || form.dataset.contactReady === 'true') return true;
        if (typeof emailjs === 'undefined') return false;

        form.dataset.contactReady = 'true';
        emailjs.init('kiY7Ni8dk8ID8Mn47');

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var name = document.getElementById('name').value.trim();
            var phone = document.getElementById('phone').value.trim();
            var email = document.getElementById('email').value.trim();
            var product = document.getElementById('product').value.trim();
            var scenario = document.getElementById('scenario').value.trim();
            var message = document.getElementById('message').value.trim();

            if (!name || !phone) {
                alert('Please fill in your name/company and phone number.');
                return;
            }

            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                alert('Please enter a valid email address.');
                return;
            }

            var submitBtn = form.querySelector('.submit-btn, button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.dataset.originalText = submitBtn.textContent;
                submitBtn.textContent = 'Sending...';
            }

            emailjs.send('service_vs616cb', 'template_u99zynh', {
                from_name: name,
                from_email: email,
                name: name,
                phone: phone,
                product: product,
                scenario: scenario,
                message: message
            }).then(function () {
                if (window.WafuAnalytics && typeof window.WafuAnalytics.trackConversion === 'function') {
                    window.WafuAnalytics.trackConversion();
                } else if (typeof gtag === 'function') {
                    gtag('event', 'conversion', {
                        send_to: 'AW-17790114591/ujr9CP-_iN4bEJ-2_qJC',
                        value: 1.0,
                        currency: 'CNY'
                    });
                }

                alert('Your message has been sent. We will contact you within one business day.');
                form.reset();
            }).catch(function (err) {
                console.error('Contact form send failed:', err);
                alert('Failed to send. Please try again later, or email us at wafutechnology@outlook.com');
            }).finally(function () {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = submitBtn.dataset.originalText || 'Send Message';
                }
            });
        });

        return true;
    }

    window.initContactForm = initContactForm;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initContactForm);
    } else if (typeof emailjs !== 'undefined') {
        initContactForm();
    }
})();
