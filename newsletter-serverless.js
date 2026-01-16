// Newsletter Management System with Serverless API (Secure)
// This version uses serverless functions to keep secrets secure on the server
// Replace newsletter.js with this file after setting up your serverless functions
// Version: 2026-01-16 - Added getHistoricalDataForChart method

class NewsletterManager {
  constructor() {
    this.subscribers = [];
    this.newsletterSends = 0; // Newsletter sends count from API
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
    
    // Only auto-load subscribers on admin pages (not on homepage)
    // Check if we're on an admin page by looking for admin-specific elements or URL
    const isAdminPage = window.location.pathname.includes('admin') || 
                        window.location.pathname.includes('send_newsletter') ||
                        document.getElementById('admin-dashboard') !== null ||
                        document.querySelector('.admin-panel') !== null;
    
    if (isAdminPage) {
      this.loadSubscribers();
    }
    // Otherwise, subscribers will be loaded on-demand when needed
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
          
          // Store newsletter sends count from API
          this.newsletterSends = cloudData.newsletterSends || 0;
          // Also cache to localStorage as fallback
          localStorage.setItem('newsletter_sends_count', this.newsletterSends.toString());
          console.log('✅ Loaded newsletter sends count:', this.newsletterSends);
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
      // Get existing historical data from localStorage (or use class property if available)
      const storedHistoricalData = localStorage.getItem('newsletter_historical_data');
      const historicalData = storedHistoricalData ? JSON.parse(storedHistoricalData) : [];
      
      // Use newsletter sends count from class property (loaded from API), fallback to localStorage
      const newsletterSends = this.newsletterSends || parseInt(localStorage.getItem('newsletter_sends_count'), 10) || 0;

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
      
      // Also load newsletter sends count from localStorage as fallback
      const storedSends = localStorage.getItem('newsletter_sends_count');
      this.newsletterSends = parseInt(storedSends, 10) || 0;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      this.subscribers = [];
      this.newsletterSends = 0;
    }
  }

  // Add subscriber (uses serverless API)
  async addSubscriber(email) {
    email = email.trim().toLowerCase();
    
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email address');
    }
    
    // Load subscribers if not already loaded (for homepage form submissions)
    if (this.subscribers.length === 0) {
      await this.loadSubscribers();
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

  // Get newsletter sends count (from API data, not localStorage)
  getNewsletterSendsCount() {
    return this.newsletterSends || 0;
  }

  // Get historical data for chart (returns array of {date, count, timestamp} objects)
  async getHistoricalDataForChart(days = 30) {
    try {
      // First, try to load fresh data from API if not already loaded
      if (!this.subscribers || this.subscribers.length === 0) {
        await this.loadSubscribers();
      }
      
      // Get historical data from localStorage (cached from API)
      const storedHistoricalData = localStorage.getItem('newsletter_historical_data');
      let historicalData = storedHistoricalData ? JSON.parse(storedHistoricalData) : [];
      
      // If no historical data, try fetching fresh from API
      if (!historicalData || historicalData.length === 0) {
        const apiData = await this.fetchFromServerlessAPI();
        if (apiData && apiData.historicalData && Array.isArray(apiData.historicalData)) {
          historicalData = apiData.historicalData;
          localStorage.setItem('newsletter_historical_data', JSON.stringify(historicalData));
        }
      }
      
      // Ensure we have an array
      if (!Array.isArray(historicalData)) {
        historicalData = [];
      }
      
      // Sort by date (oldest first)
      historicalData.sort((a, b) => {
        const dateA = a.date || a.timestamp || '';
        const dateB = b.date || b.timestamp || '';
        return dateA.localeCompare(dateB);
      });
      
      // If days parameter is provided, filter to last N days
      if (days && days > 0) {
        const today = new Date();
        const cutoffDate = new Date(today);
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
        
        historicalData = historicalData.filter(item => {
          const itemDate = item.date || (item.timestamp ? item.timestamp.split('T')[0] : '');
          return itemDate >= cutoffDateStr;
        });
      }
      
      return historicalData;
    } catch (error) {
      console.error('Error getting historical data for chart:', error);
      return [];
    }
  }

  // Track newsletter send - increments count and saves to API
  async trackNewsletterSend(recipientCount = 0) {
    // Increment the newsletter sends count
    this.newsletterSends = (this.newsletterSends || 0) + 1;
    
    // Save updated count to API (preserve subscribers and historical data)
    try {
      const saved = await this.saveToServerlessAPI(this.subscribers);
      if (saved) {
        console.log(`✅ Newsletter send tracked: ${this.newsletterSends} total sends`);
        return true;
      } else {
        console.warn('⚠️ Failed to save newsletter send count to API');
        return false;
      }
    } catch (error) {
      console.error('Error tracking newsletter send:', error);
      return false;
    }
  }

  // Save subscribers (updates the list and saves to API)
  async saveSubscribers(subscribers) {
    if (!Array.isArray(subscribers)) {
      throw new Error('Subscribers must be an array');
    }
    
    // Update the subscribers array
    this.subscribers = subscribers;
    
    // Save to serverless API
    const saved = await this.saveToServerlessAPI(subscribers);
    if (!saved) {
      console.warn('⚠️ Failed to save to serverless API, but subscribers updated locally');
    }
    
    // Also update localStorage as cache
    localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers));
    
    return saved;
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
// Only auto-initialize on admin pages or if explicitly requested
let newsletterManager;

// Check if we're on an admin page
const isAdminPage = window.location.pathname.includes('admin') || 
                    window.location.pathname.includes('send_newsletter') ||
                    document.getElementById('admin-dashboard') !== null ||
                    document.querySelector('.admin-panel') !== null;

// Only auto-initialize on admin pages
// On homepage, initialization will happen on-demand when newsletter form is submitted
if (isAdminPage) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      newsletterManager = new NewsletterManager();
    });
  } else {
    newsletterManager = new NewsletterManager();
  }
} else {
  // On homepage, create manager but don't auto-load subscribers
  // Subscribers will be loaded on-demand when needed (e.g., form submission)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      newsletterManager = new NewsletterManager();
    });
  } else {
    newsletterManager = new NewsletterManager();
  }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.newsletterManager = newsletterManager;
}
