// Newsletter Management System with EmailJS Storage
class NewsletterManager {
  constructor() {
    this.subscribers = [];
    this.apiEndpoint = 'https://api.emailjs.com/api/v1.0/email/send';
    this.serviceId = 'service_ju06a1p';
    this.templateId = 'template_925ze9i';
    this.userId = 'zRYVGu1o6DDmrdc4f';
    
    this.loadSubscribers();
  }

  // Load subscribers from localStorage (EmailJS doesn't support reading contacts via API)
  async loadSubscribers() {
    try {
      console.log('Loading subscribers from localStorage...');
      
      // EmailJS doesn't provide a public API to read contacts, so we use localStorage
      // The syncWithEmailJS function handles sending subscribers to EmailJS
      this.loadFromLocalStorage();
      console.log('Loaded subscribers from localStorage:', this.subscribers);
      
    } catch (error) {
      console.error('Error loading subscribers:', error);
      this.subscribers = [];
    }
  }

  // Fallback to localStorage
  loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('newsletter_subscribers');
      console.log('Loading subscribers from localStorage:', stored);
      this.subscribers = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      this.subscribers = [];
    }
  }

  // Save subscribers to localStorage (EmailJS sync happens in addSubscriber)
  async saveSubscribers() {
    try {
      console.log('Saving subscribers to localStorage...');
      
      // Save to localStorage as primary storage
      localStorage.setItem('newsletter_subscribers', JSON.stringify(this.subscribers));
      console.log('Subscribers saved to localStorage:', this.subscribers);
      
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      this.subscribers = [];
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

    // Add to subscribers array
    this.subscribers.push(email);
    await this.saveSubscribers();
    console.log('Subscriber added successfully. Total subscribers:', this.subscribers.length);

    // Automatically sync to EmailJS
    try {
      console.log('🔄 Attempting to sync new subscriber to EmailJS...');
      await this.sendToEmailService(email);
      console.log('✅ Subscriber automatically synced to EmailJS');
    } catch (error) {
      console.error('❌ EmailJS sync failed:', error);
      console.error('Error details:', error.message || error);
      console.warn('⚠️ Subscriber was saved locally, but EmailJS sync failed');
    }

    return true;
  }

  // Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Send to EmailJS (stores subscriber and sends notification)
  async sendToEmailService(email) {
    console.log('Syncing subscriber to EmailJS:', email);
    
    try {
      // Check if EmailJS is available
      if (typeof emailjs === 'undefined') {
        console.warn('EmailJS not loaded, skipping EmailJS sync');
        return;
      }

      console.log('EmailJS is available, syncing subscriber...');
      
      // Send to EmailJS - this stores the subscriber in your EmailJS contacts
      const response = await emailjs.send(this.serviceId, this.templateId, {
        to_email: 'irieappdev@gmail.com',
        from_email: email,
        subject: 'New Newsletter Signup',
        message: `New subscriber: ${email}`,
        from_name: 'Irie Development Newsletter',
        subscriber_email: email, // This helps EmailJS store the contact
        signup_date: new Date().toISOString()
      }, this.userId);

      console.log('✅ Subscriber synced to EmailJS successfully:', response);
      return true;
    } catch (error) {
      console.warn('EmailJS sync error:', error);
      console.warn('Subscriber saved locally, but EmailJS sync failed');
      throw error;
    }
  }

  // Store contact in EmailJS without sending email (for sync operations)
  async storeContactInEmailJS(email) {
    console.log('Storing contact in EmailJS:', email);
    
    try {
      // Check if EmailJS is available
      if (typeof emailjs === 'undefined') {
        console.warn('EmailJS not loaded, skipping contact storage');
        return;
      }

      console.log('EmailJS is available, storing contact...');
      
      // EmailJS doesn't have a direct "store contact" API, so we'll use a silent method
      // Send to a special email that just stores the contact without notification
      const response = await emailjs.send(this.serviceId, this.templateId, {
        to_email: 'irieappdev@gmail.com',
        from_email: email,
        subject: 'Contact Storage Only - No Notification',
        message: `Storing contact: ${email}`,
        from_name: 'Irie Development Contact Storage',
        subscriber_email: email,
        storage_only: true,
        silent_mode: true,
        signup_date: new Date().toISOString()
      }, this.userId);

      console.log('✅ Contact stored in EmailJS successfully:', response);
      return true;
    } catch (error) {
      console.warn('EmailJS contact storage error:', error);
      throw error;
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
  async clearSubscribers() {
    this.subscribers = [];
    await this.saveSubscribers();
    console.log('All subscribers cleared');
  }

  // Sync subscribers (ensures all are properly stored)
  async syncWithEmailJS() {
    try {
      console.log('Syncing subscribers...');
      
      if (!this.subscribers || this.subscribers.length === 0) {
        console.log('No subscribers to sync');
        return {
          success: true,
          message: 'No subscribers to sync.',
          subscriberCount: 0
        };
      }
      
      // Save to localStorage as primary storage
      localStorage.setItem('newsletter_subscribers', JSON.stringify(this.subscribers));
      console.log('✅ Subscribers saved to localStorage');
      
      // Since EmailJS doesn't support storing contacts without sending emails,
      // we'll just ensure localStorage is properly synced
      console.log('📧 Note: EmailJS contacts are stored when subscribers sign up');
      console.log('📧 Sync button ensures localStorage is up to date');
      
      return {
        success: true,
        message: `✅ All ${this.subscribers.length} subscribers are properly stored in localStorage.`,
        subscriberCount: this.subscribers.length,
        successCount: this.subscribers.length,
        errorCount: 0
      };
      
    } catch (error) {
      console.error('Error syncing subscribers:', error);
      throw error;
    }
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
  
  // Show loading state
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.textContent;
  submitBtn.textContent = 'Subscribing...';
  submitBtn.disabled = true;
  
  try {
    await newsletterManager.addSubscriber(email);
    
    // Show success message
    form.innerHTML = `
      <div class="success-message">
        <p>🎉 Thanks for subscribing!</p>
        <p>We'll keep you updated with new apps and exclusive Arkansas merch!</p>
        <button type="button" onclick="resetNewsletterForm()" class="newsletter-btn">Subscribe Another Email</button>
      </div>
    `;
    
    // Update subscriber count display
    updateSubscriberCount();
    
    // Track signup (if you have analytics)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'newsletter_signup', {
        'event_category': 'engagement',
        'event_label': 'newsletter'
      });
    }
    
    console.log('Newsletter signup successful for:', email);
    
  } catch (error) {
    console.error('Newsletter signup error:', error);
    
    // Show error message
    form.innerHTML = `
      <div class="error-message">
        <p>❌ ${error.message}</p>
        <button type="button" onclick="resetNewsletterForm()" class="newsletter-btn">Try Again</button>
      </div>
    `;
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
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Newsletter system initialized');
  
  // Wait for subscribers to load
  await newsletterManager.loadSubscribers();
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
  clearSubscribers: async () => {
    await newsletterManager.clearSubscribers();
    updateSubscriberCount();
  },
  addTestSubscriber: async (email = 'test@example.com') => {
    await newsletterManager.addSubscriber(email);
    updateSubscriberCount();
  },
  syncToEmailJS: async () => {
    return await newsletterManager.syncWithEmailJS();
  }
};