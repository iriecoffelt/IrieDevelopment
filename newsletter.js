// Newsletter Management System
class NewsletterManager {
  constructor() {
    this.subscribers = this.loadSubscribers();
    this.apiEndpoint = 'https://api.emailjs.com/api/v1.0/email/send';
    this.serviceId = 'service_ju06a1p'; // Your EmailJS service ID
    this.templateId = 'template_925ze9i'; // Your EmailJS template ID
    this.userId = 'zRYVGu1o6DDmrdc4f'; // Your EmailJS public key
  }

  // Load existing subscribers from localStorage
  loadSubscribers() {
    try {
      const stored = localStorage.getItem('newsletter_subscribers');
      console.log('Loaded subscribers:', stored);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading subscribers:', error);
      return [];
    }
  }

  // Save subscribers to localStorage
  saveSubscribers() {
    try {
      localStorage.setItem('newsletter_subscribers', JSON.stringify(this.subscribers));
      console.log('Saved subscribers:', this.subscribers);
    } catch (error) {
      console.error('Error saving subscribers:', error);
    }
  }

  // Add new subscriber
  async addSubscriber(email) {
    console.log('Adding subscriber:', email);
    
    // Validate email
    if (!this.isValidEmail(email)) {
      throw new Error('Please enter a valid email address');
    }

    // Check if already subscribed
    if (this.subscribers.includes(email)) {
      throw new Error('You are already subscribed!');
    }

    // Add to local storage
    this.subscribers.push(email);
    this.saveSubscribers();
    console.log('Subscriber added successfully. Total subscribers:', this.subscribers.length);

    // Try to send to email service (but don't fail if it doesn't work)
    try {
      await this.sendToEmailService(email);
    } catch (error) {
      console.warn('Email service failed, but subscriber was saved locally:', error);
    }

    return true;
  }

  // Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Send to EmailJS (optional)
  async sendToEmailService(email) {
    console.log('Attempting to send email notification for:', email);
    
    try {
      // Check if EmailJS is available
      if (typeof emailjs === 'undefined') {
        console.warn('EmailJS not loaded, skipping email notification');
        return;
      }

      console.log('EmailJS is available, sending notification...');
      
      const response = await emailjs.send(this.serviceId, this.templateId, {
        to_email: 'iriecoffelt@gmail.com', // Send to your email
        from_email: email, // The subscriber's email
        subject: 'New Newsletter Signup',
        message: `New subscriber: ${email}`,
        from_name: 'Irie Development Newsletter'
      }, this.userId);

      console.log('Email sent successfully:', response);
    } catch (error) {
      console.warn('Email service error:', error);
      console.warn('This is normal for local testing - subscribers are still saved locally');
      // Don't throw error - subscriber is still saved locally
    }
  }

  // Export subscribers (for backup)
  exportSubscribers() {
    const dataStr = JSON.stringify(this.subscribers, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'newsletter_subscribers.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  // Get subscriber count
  getSubscriberCount() {
    console.log('Getting subscriber count:', this.subscribers.length);
    return this.subscribers.length;
  }

  // Clear all subscribers (for testing)
  clearSubscribers() {
    this.subscribers = [];
    this.saveSubscribers();
    console.log('All subscribers cleared');
  }
}

// Initialize newsletter manager
const newsletterManager = new NewsletterManager();

// Enhanced newsletter signup handler
async function handleNewsletterSignup(event) {
  event.preventDefault();
  
  console.log('=== NEWSLETTER SIGNUP STARTED ===');
  
  const form = event.target;
  const emailInput = form.querySelector('input[type="email"]');
  const email = emailInput.value.trim();
  
  console.log('Newsletter signup attempt for:', email);
  console.log('Form element:', form);
  console.log('Email input element:', emailInput);
  
  // Show loading state
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.textContent;
  submitBtn.textContent = 'Subscribing...';
  submitBtn.disabled = true;
  
  console.log('Button state updated - loading...');
  
  try {
    console.log('Calling addSubscriber...');
    await newsletterManager.addSubscriber(email);
    console.log('addSubscriber completed successfully');
    
    // Show success message
    console.log('Updating form with success message...');
    form.innerHTML = `
      <div class="success-message">
        <p>🎉 Thanks for subscribing!</p>
        <p>We'll keep you updated with new apps and exclusive Arkansas merch!</p>
        <button type="button" onclick="resetNewsletterForm()" class="newsletter-btn">Subscribe Another Email</button>
      </div>
    `;
    
    console.log('Success message displayed');
    
    // Update subscriber count display
    console.log('Updating subscriber count display...');
    updateSubscriberCount();
    console.log('Subscriber count updated');
    
    // Track signup (if you have analytics)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'newsletter_signup', {
        'event_category': 'engagement',
        'event_label': 'newsletter'
      });
    }
    
    console.log('Newsletter signup successful for:', email);
    console.log('=== NEWSLETTER SIGNUP COMPLETED SUCCESSFULLY ===');
    
  } catch (error) {
    console.error('=== NEWSLETTER SIGNUP FAILED ===');
    console.error('Newsletter signup error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Show error message
    form.innerHTML = `
      <div class="error-message">
        <p>❌ ${error.message}</p>
        <button type="button" onclick="resetNewsletterForm()" class="newsletter-btn">Try Again</button>
      </div>
    `;
    
    console.log('Error message displayed');
  }
}

// Reset newsletter form
function resetNewsletterForm() {
  const form = document.querySelector('.newsletter-form');
  form.innerHTML = `
    <input type="email" placeholder="Enter your email" required class="newsletter-input">
    <button type="submit" class="newsletter-btn">Subscribe</button>
  `;
  
  // Re-attach event listener
  form.addEventListener('submit', handleNewsletterSignup);
}

// Update subscriber count display
function updateSubscriberCount() {
  const count = newsletterManager.getSubscriberCount();
  console.log('Updating subscriber count display to:', count);
  
  // Update all subscriber count elements
  const countElements = document.querySelectorAll('.subscriber-count span, #subscriberCount');
  countElements.forEach(element => {
    if (element) {
      element.textContent = count;
    }
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('Newsletter system initialized');
  updateSubscriberCount();
  
  // Add debug info to console
  console.log('Current subscribers:', newsletterManager.subscribers);
  console.log('Subscriber count:', newsletterManager.getSubscriberCount());
  
  // Ensure form event listener is attached
  const form = document.querySelector('.newsletter-form');
  if (form) {
    console.log('Attaching event listener to newsletter form');
    form.addEventListener('submit', handleNewsletterSignup);
    console.log('Event listener attached successfully');
  } else {
    console.error('Newsletter form not found during initialization');
  }
});

// Debug functions (for testing)
window.newsletterDebug = {
  getSubscribers: () => newsletterManager.subscribers,
  getCount: () => newsletterManager.getSubscriberCount(),
  clearSubscribers: () => {
    newsletterManager.clearSubscribers();
    updateSubscriberCount();
  },
  addTestSubscriber: (email = 'test@example.com') => {
    newsletterManager.addSubscriber(email);
    updateSubscriberCount();
  }
};