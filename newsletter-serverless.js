// Newsletter Management System with Serverless API (Secure)
// This version uses serverless functions to keep secrets secure on the server
// Replace newsletter.js with this file after setting up your serverless functions

class NewsletterManager {
  constructor() {
    this.subscribers = [];
    this.apiEndpoint = 'https://api.emailjs.com/api/v1.0/email/send';
    
    // Serverless API endpoint - UPDATE THIS with your Vercel/Netlify URL
    // Example: 'https://your-project.vercel.app/api'
    // Or: 'https://your-project.netlify.app/.netlify/functions'
    this.serverlessApiUrl = window.SERVERLESS_API_URL || 'https://your-project.vercel.app/api';
    
    // EmailJS configuration - can still use env-config.js or hardcoded fallbacks
    const envConfig = window.ENV_CONFIG || {};
    this.serviceId = envConfig.emailjsServiceId || 'service_ju06a1p';
    this.templateId = envConfig.emailjsTemplateId || 'template_925ze9i';
    this.userId = envConfig.emailjsUserId || 'zRYVGu1o6DDmrdc4f';
    
    // Note: JSONBin credentials are now stored server-side in your serverless functions
    // They are never exposed to the browser
    
    this.loadSubscribers();
  }

  // Load subscribers from serverless API (secure)
  async loadSubscribers() {
    try {
      console.log('Loading subscribers from serverless API...');
      
      // Fetch from serverless API
      const cloudData = await this.fetchFromServerlessAPI();
      
      if (cloudData && typeof cloudData === 'object') {
        // Handle the response from serverless API
        if (Array.isArray(cloudData.subscribers)) {
          this.subscribers = cloudData.subscribers;
          console.log('✅ Loaded subscribers from serverless API:', this.subscribers.length, 'subscribers');
          
          // Store historical data if available
          if (cloudData.historicalData && Array.isArray(cloudData.historicalData)) {
            localStorage.setItem('newsletter_historical_data', JSON.stringify(cloudData.historicalData));
            console.log('✅ Loaded historical data:', cloudData.historicalData.length, 'data points');
          }
          
          // Store newsletter sends count if available
          if (cloudData.newsletterSends !== undefined) {
            localStorage.setItem('newsletter_sends_count', cloudData.newsletterSends.toString());
            console.log('✅ Loaded newsletter sends count:', cloudData.newsletterSends);
          }
        } else {
          console.warn('⚠️ Unexpected data format from serverless API:', cloudData);
          this.subscribers = [];
        }
        
        // Also update localStorage as cache
        localStorage.setItem('newsletter_subscribers', JSON.stringify(this.subscribers));
        console.log('💾 Cached', this.subscribers.length, 'subscribers to localStorage');
        return;
      }
      
      // Fallback to localStorage if API fails
      console.warn('Serverless API fetch failed, falling back to localStorage');
      this.loadFromLocalStorage();
    } catch (error) {
      console.error('Error loading subscribers:', error);
      this.loadFromLocalStorage();
    }
  }

  // Fetch subscribers from serverless API
  async fetchFromServerlessAPI() {
    try {
      const response = await fetch(`${this.serverlessApiUrl}/subscribers`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('Serverless API endpoint not found - check your API URL');
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Fetched from serverless API:', data);
      return data;
    } catch (error) {
      console.warn('Error fetching from serverless API:', error.message);
      return null;
    }
  }

  // Save subscribers via serverless API (secure)
  async saveToServerlessAPI(subscribers) {
    try {
      // Get existing historical data and newsletter sends from localStorage
      const storedHistoricalData = localStorage.getItem('newsletter_historical_data');
      const historicalData = storedHistoricalData ? JSON.parse(storedHistoricalData) : [];
      
      const storedSends = localStorage.getItem('newsletter_sends_count');
      const newsletterSends = parseInt(storedSends, 10) || 0;

      const response = await fetch(`${this.serverlessApiUrl}/subscribers-save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          subscribers: subscribers,
          historicalData: historicalData,
          newsletterSends: newsletterSends
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Serverless API error: ${response.status} - ${errorData.message || errorData.error}`);
      }
      
      const result = await response.json();
      console.log('✅ Saved to serverless API successfully:', result);
      return true;
    } catch (error) {
      console.error('Error saving to serverless API:', error);
      return false;
    }
  }

  // Load from localStorage (fallback)
  loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('newsletter_subscribers');
      if (stored) {
        this.subscribers = JSON.parse(stored);
        console.log('✅ Loaded subscribers from localStorage:', this.subscribers.length, 'subscribers');
      } else {
        this.subscribers = [];
        console.log('No subscribers found in localStorage');
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      this.subscribers = [];
    }
  }

  // Add subscriber (uses serverless API)
  async addSubscriber(email) {
    email = email.trim().toLowerCase();
    
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email address');
    }
    
    if (this.subscribers.includes(email)) {
      throw new Error('Email already subscribed');
    }
    
    this.subscribers.push(email);
    localStorage.setItem('newsletter_subscribers', JSON.stringify(this.subscribers));
    
    // Save to serverless API
    const saved = await this.saveToServerlessAPI(this.subscribers);
    if (!saved) {
      console.warn('⚠️ Failed to save to serverless API, but subscriber added locally');
    }
    
    // Send welcome email via EmailJS
    await this.sendWelcomeEmail(email);
    
    return true;
  }

  // Remove subscriber (uses serverless API)
  async removeSubscriber(email) {
    email = email.trim().toLowerCase();
    const index = this.subscribers.indexOf(email);
    
    if (index === -1) {
      throw new Error('Email not found in subscribers');
    }
    
    this.subscribers.splice(index, 1);
    localStorage.setItem('newsletter_subscribers', JSON.stringify(this.subscribers));
    
    // Save to serverless API
    const saved = await this.saveToServerlessAPI(this.subscribers);
    if (!saved) {
      console.warn('⚠️ Failed to save to serverless API, but subscriber removed locally');
    }
    
    return true;
  }

  // Send welcome email via EmailJS
  async sendWelcomeEmail(email) {
    try {
      const templateParams = {
        to_email: email,
        to_name: email.split('@')[0],
        from_name: 'Irie Development',
        message: 'Welcome to our newsletter!'
      };

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: this.serviceId,
          template_id: this.templateId,
          user_id: this.userId,
          template_params: templateParams
        })
      });

      if (response.ok) {
        console.log('✅ Welcome email sent to:', email);
        return true;
      } else {
        console.warn('⚠️ Failed to send welcome email:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  }

  // Validate email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Get subscriber count
  getSubscriberCount() {
    return this.subscribers.length;
  }

  // Get all subscribers
  getSubscribers() {
    return [...this.subscribers];
  }

  // Sync with EmailJS (if needed)
  async syncWithEmailJS() {
    // This method can be implemented if you need to sync subscribers with EmailJS
    // For now, we just send welcome emails when subscribers are added
    console.log('Sync with EmailJS - subscribers are synced automatically on add');
    return true;
  }
}

// Initialize newsletter manager when DOM is ready
let newsletterManager;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    newsletterManager = new NewsletterManager();
  });
} else {
  newsletterManager = new NewsletterManager();
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.newsletterManager = newsletterManager;
}
