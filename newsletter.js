// Newsletter Management System with Cloud Storage (JSONBin.io)
class NewsletterManager {
  constructor() {
    this.subscribers = [];
    this.apiEndpoint = 'https://api.emailjs.com/api/v1.0/email/send';
    this.serviceId = 'service_ju06a1p';
    this.templateId = 'template_925ze9i';
    this.userId = 'zRYVGu1o6DDmrdc4f';
    
    // JSONBin.io Cloud Storage Configuration
    // Using Access Key for limited permissions (more secure for frontend)
    // Access Keys can be configured with specific permissions (read-only, write-only, etc.)
    this.jsonBinAccessKey = '$2a$10$.tte9gaAB5LnvRsH2dUz4OFuloHrp3GWDQsCdpRmgcfZ3uf4TYbsq'.trim();
    this.useAccessKey = true; // Using Access Key for better security
    this.jsonBinBinId = '6967037143b1c97be92f1730'; // Will be created automatically on first subscriber, or set manually if you have an existing bin ID
    this.jsonBinUrl = 'https://api.jsonbin.io/v3/b'; // JSONBin API v3
    this.jsonBinName = 'IRIEDEVELOPMENTSUBSCRIBERCOUNTS'; // Bin name for organization
    
    // Fallback: Also try GitHub raw content as backup
    this.githubRawUrl = 'https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/data/subscribers.json';
    
    this.loadSubscribers();
  }

  // Load subscribers from cloud storage (primary source)
  async loadSubscribers() {
    try {
      console.log('Loading subscribers from cloud storage...');
      
      // Try to fetch from JSONBin first
      let cloudData = await this.fetchFromJSONBin();
      
      // If JSONBin doesn't exist yet, create it with empty array
      if (!cloudData && !this.jsonBinBinId) {
        console.log('JSONBin bin not found, creating new bin...');
        const created = await this.initializeJSONBin();
        if (created) {
          // Try fetching again
          cloudData = await this.fetchFromJSONBin();
        }
      }
      
      // Handle the data from JSONBin (which now returns an object, not an array)
      // cloudData will be either null, an object { subscribers: [], historicalData: [] }, or (old format) an array
      if (cloudData) {
        // Handle both old format (array) and new format (object with subscribers array)
        if (Array.isArray(cloudData)) {
          // Old format - just an array of emails (shouldn't happen anymore, but handle it)
          this.subscribers = cloudData;
          console.log('✅ Loaded subscribers from cloud (old format):', this.subscribers.length, 'subscribers');
        } else if (cloudData && typeof cloudData === 'object' && cloudData.subscribers && Array.isArray(cloudData.subscribers)) {
          // New format - object with subscribers and historicalData
          this.subscribers = cloudData.subscribers;
          console.log('✅ Loaded subscribers from JSONBin:', this.subscribers.length, 'subscribers');
          // Store historical data if available
          if (cloudData.historicalData && Array.isArray(cloudData.historicalData)) {
            localStorage.setItem('newsletter_historical_data', JSON.stringify(cloudData.historicalData));
            console.log('✅ Loaded historical data:', cloudData.historicalData.length, 'data points');
          }
        } else {
          console.warn('⚠️ Unexpected data format from JSONBin:', cloudData);
          this.subscribers = [];
        }
        // Also update localStorage as cache
        localStorage.setItem('newsletter_subscribers', JSON.stringify(this.subscribers));
        console.log('💾 Cached', this.subscribers.length, 'subscribers to localStorage');
        return;
      }
      
      // If JSONBin fails, try GitHub raw content as fallback
      console.log('JSONBin fetch returned null, trying GitHub raw content...');
      let fallbackData = await this.fetchFromGitHub();
      
      // If GitHub fails, try local data file
      if (!fallbackData || !Array.isArray(fallbackData)) {
        console.log('GitHub fetch failed, trying local data file...');
        fallbackData = await this.fetchFromLocalFile();
      }
      
      if (fallbackData && Array.isArray(fallbackData)) {
        this.subscribers = fallbackData;
        console.log('✅ Loaded subscribers from fallback source:', this.subscribers.length, 'subscribers');
        localStorage.setItem('newsletter_subscribers', JSON.stringify(this.subscribers));
        return;
      }
      
      // Final fallback to localStorage
      console.warn('All cloud sources failed, falling back to localStorage');
      this.loadFromLocalStorage();
      
    } catch (error) {
      console.error('Error loading subscribers from cloud:', error);
      // Fallback to localStorage
      this.loadFromLocalStorage();
    }
  }

  // Initialize JSONBin with empty array if it doesn't exist
  async initializeJSONBin() {
    try {
      if (!this.jsonBinAccessKey || this.jsonBinAccessKey === 'YOUR_JSONBIN_ACCESS_KEY') {
        console.log('JSONBin Access Key not configured, skipping initialization');
        return false;
      }
      
      // Check if we already have a bin ID
      const savedBinId = localStorage.getItem('jsonbin_bin_id');
      if (savedBinId) {
        this.jsonBinBinId = savedBinId;
        console.log('Using existing JSONBin bin ID:', savedBinId);
        return true;
      }
      
      // Create new bin with empty array
      const dataToSave = {
        subscribers: [],
        lastUpdated: new Date().toISOString(),
        count: 0,
        historicalData: []
      };
      
      console.log('Creating new JSONBin...');
      
      const apiConfig = this.getApiKeyConfig();
      const headers = {
        'Content-Type': 'application/json',
        [apiConfig.header]: apiConfig.key,
        'X-Bin-Name': this.jsonBinName || 'Irie Development Newsletter Subscribers',
        'X-Bin-Private': 'true'
      };
      
      const response = await fetch(this.jsonBinUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(dataToSave)
      });
      
      if (response.ok) {
        const result = await response.json();
        this.jsonBinBinId = result.metadata.id;
        localStorage.setItem('jsonbin_bin_id', this.jsonBinBinId);
        console.log('✅ Created new JSONBin bin:', this.jsonBinBinId);
        console.log('📋 Bin ID saved to localStorage. You can now see it in your JSONBin.io account!');
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to create JSONBin:', response.status, errorText);
        
        // Provide helpful error message
        if (response.status === 401) {
          console.error('⚠️ API Key Error: Please verify your JSONBin.io API key is correct.');
          console.error('💡 Get your API key from: https://jsonbin.io/app/account/api-key');
          console.error('💡 Verify your API key format matches what\'s shown in your JSONBin.io account.');
          console.error('💡 Make sure there are no extra spaces or line breaks in the key.');
        }
        return false;
      }
    } catch (error) {
      console.error('Error initializing JSONBin:', error);
      return false;
    }
  }

  // Helper method to get the correct API key and header
  getApiKeyConfig() {
    // Using Access Key for better security
    if (this.jsonBinAccessKey) {
      return {
        key: this.jsonBinAccessKey,
        header: 'X-Access-Key'
      };
    }
    // Fallback (should not happen if Access Key is configured)
    throw new Error('JSONBin Access Key not configured');
  }

  // Fetch subscribers from JSONBin.io (primary cloud storage)
  async fetchFromJSONBin() {
    try {
      // If we don't have a bin ID yet, try to get it from localStorage or config
      if (!this.jsonBinBinId) {
        const savedBinId = localStorage.getItem('jsonbin_bin_id');
        if (savedBinId) {
          this.jsonBinBinId = savedBinId;
        } else {
          console.log('No JSONBin bin ID found, skipping JSONBin fetch');
          return null;
        }
      }
      
      // Build headers - use API key if available, otherwise try public access
      const headers = {
        'Accept': 'application/json'
      };
      
      const apiConfig = this.getApiKeyConfig();
      if (apiConfig.key && apiConfig.key !== 'YOUR_JSONBIN_ACCESS_KEY') {
        headers[apiConfig.header] = apiConfig.key;
      }
      
      const response = await fetch(`${this.jsonBinUrl}/${this.jsonBinBinId}/latest`, {
        method: 'GET',
        headers: headers,
        cache: 'no-store'
      });
      
      if (!response.ok) {
        // If 404, bin doesn't exist yet - that's okay
        if (response.status === 404) {
          console.log('JSONBin bin not found, will create on first subscriber');
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      const data = result.record || result;
      console.log('✅ Fetched from JSONBin:', data);
      // Return the full data object to preserve historical data
      if (Array.isArray(data)) {
        // Old format - just an array of emails
        return { subscribers: data, historicalData: [] };
      }
      // New format - object with subscribers and historicalData
      const dataObj = {
        subscribers: data.subscribers || [],
        historicalData: data.historicalData || []
      };
      // Also store historical data in localStorage for quick access
      if (dataObj.historicalData.length > 0) {
        localStorage.setItem('newsletter_historical_data', JSON.stringify(dataObj.historicalData));
      }
      return dataObj;
      
    } catch (error) {
      console.warn('Error fetching from JSONBin:', error.message);
      return null;
    }
  }

  // Save subscribers to JSONBin.io
  async saveToJSONBin(subscribers) {
    try {
      // If no Access Key is set, skip JSONBin save
      if (!this.jsonBinAccessKey || this.jsonBinAccessKey === 'YOUR_JSONBIN_ACCESS_KEY') {
        console.log('JSONBin Access Key not configured, skipping cloud save');
        return false;
      }
      
      // Record daily snapshot for analytics
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Get existing historical data
      let historicalData = this.getHistoricalData() || [];
      
      // Check if we already have a snapshot for today
      const todaySnapshot = historicalData.find(s => s.date === today);
      if (!todaySnapshot || todaySnapshot.count !== subscribers.length) {
        // Add or update today's snapshot
        const existingIndex = historicalData.findIndex(s => s.date === today);
        const snapshot = {
          date: today,
          count: subscribers.length,
          timestamp: new Date().toISOString()
        };
        
        if (existingIndex >= 0) {
          historicalData[existingIndex] = snapshot;
        } else {
          historicalData.push(snapshot);
        }
        
        // Keep only last 90 days of data
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 90);
        historicalData = historicalData.filter(s => new Date(s.date) >= cutoffDate);
        
        // Sort by date
        historicalData.sort((a, b) => new Date(a.date) - new Date(b.date));
      }
      
      const dataToSave = {
        subscribers: subscribers,
        lastUpdated: new Date().toISOString(),
        count: subscribers.length,
        historicalData: historicalData
      };
      
      // If we have a bin ID, update it
      if (this.jsonBinBinId) {
        const apiConfig = this.getApiKeyConfig();
        const response = await fetch(`${this.jsonBinUrl}/${this.jsonBinBinId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            [apiConfig.header]: apiConfig.key
          },
          body: JSON.stringify(dataToSave)
        });
        
        if (response.ok) {
          console.log('✅ Saved to JSONBin successfully');
          return true;
        }
      } else {
        // Create new bin
        const apiConfig = this.getApiKeyConfig();
        const response = await fetch(this.jsonBinUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            [apiConfig.header]: apiConfig.key,
            'X-Bin-Name': this.jsonBinName || 'Irie Development Newsletter Subscribers',
            'X-Bin-Private': 'true'
          },
          body: JSON.stringify(dataToSave)
        });
        
        if (response.ok) {
          const result = await response.json();
          this.jsonBinBinId = result.metadata.id;
          localStorage.setItem('jsonbin_bin_id', this.jsonBinBinId);
          console.log('✅ Created new JSONBin and saved:', this.jsonBinBinId);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error saving to JSONBin:', error);
      return false;
    }
  }

  // Fetch from GitHub raw content (fallback)
  async fetchFromGitHub() {
    try {
      const response = await fetch(this.githubRawUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn('Error fetching from GitHub:', error.message);
      return null;
    }
  }

  // Fetch from local data file (fallback)
  async fetchFromLocalFile() {
    try {
      const response = await fetch('/data/subscribers.json', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn('Error fetching from local file:', error.message);
      return null;
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

  // Save subscribers to cloud storage and localStorage
  async saveSubscribers() {
    try {
      console.log('Saving subscribers to cloud storage...');
      
      // Save to JSONBin.io (cloud storage)
      const cloudSaveSuccess = await this.saveToJSONBin(this.subscribers);
      if (cloudSaveSuccess) {
        console.log('✅ Subscribers saved to cloud (JSONBin)');
      } else {
        console.warn('⚠️ Cloud save failed, but continuing with local save');
      }
      
      // Also save to localStorage as cache/backup
      localStorage.setItem('newsletter_subscribers', JSON.stringify(this.subscribers));
      console.log('✅ Subscribers saved to localStorage (cache)');
      
    } catch (error) {
      console.error('Error saving subscribers:', error);
      // Still try to save to localStorage as backup
      try {
        localStorage.setItem('newsletter_subscribers', JSON.stringify(this.subscribers));
      } catch (localError) {
        console.error('Error saving to localStorage:', localError);
      }
    }
  }

  // Add new subscriber
  async addSubscriber(email) {
    console.log('Adding subscriber:', email);
    
    // Validate email
    if (!this.isValidEmail(email)) {
      throw new Error('Please enter a valid email address');
    }

    // CRITICAL: Always reload from cloud to ensure we have the latest data
    // This prevents overwriting the bin with only the new email
    // Even if subscribers array has data, it might be stale
    console.log('🔄 Reloading subscribers from cloud to ensure latest data...');
    await this.loadSubscribers();
    console.log('✅ Loaded', this.subscribers.length, 'existing subscribers from cloud');

    // Check if already subscribed
    if (this.subscribers.includes(email)) {
      throw new Error('You are already subscribed!');
    }

    // Add to subscribers array
    this.subscribers.push(email);
    console.log('📝 Adding to subscribers array. New total will be:', this.subscribers.length);
    await this.saveSubscribers();
    console.log('✅ Subscriber added successfully. Total subscribers:', this.subscribers.length);

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

      // Get subscriber count from cloud (always fresh)
  async getSubscriberCount() {
    try {
      // Always fetch fresh from cloud to get the latest count
      // Try JSONBin first, then fallbacks
      let cloudData = await this.fetchFromJSONBin();
      
      // Handle JSONBin data (which returns an object, not an array)
      if (cloudData) {
        // Handle both old format (array) and new format (object with subscribers array)
        if (Array.isArray(cloudData)) {
          // Old format - just an array
          this.subscribers = cloudData;
          const count = cloudData.length;
          console.log('✅ Getting subscriber count from cloud (old format):', count);
          localStorage.setItem('newsletter_subscribers', JSON.stringify(this.subscribers));
          return count;
        } else if (cloudData.subscribers && Array.isArray(cloudData.subscribers)) {
          // New format - object with subscribers and historicalData
          this.subscribers = cloudData.subscribers;
          if (cloudData.historicalData) {
            localStorage.setItem('newsletter_historical_data', JSON.stringify(cloudData.historicalData));
          }
          const count = cloudData.subscribers.length;
          console.log('✅ Getting subscriber count from cloud (new format):', count);
          localStorage.setItem('newsletter_subscribers', JSON.stringify(this.subscribers));
          return count;
        }
      }
      
      // If JSONBin fails, try fallbacks
      if (!cloudData) {
        cloudData = await this.fetchFromGitHub();
      }
      
      if (!cloudData || !Array.isArray(cloudData)) {
        cloudData = await this.fetchFromLocalFile();
      }
      
      if (cloudData && Array.isArray(cloudData)) {
        this.subscribers = cloudData;
        const count = cloudData.length;
        console.log('✅ Getting subscriber count from fallback source:', count);
        localStorage.setItem('newsletter_subscribers', JSON.stringify(this.subscribers));
        return count;
      }
    } catch (error) {
      console.warn('Failed to fetch count from cloud, using cached value:', error);
    }
    
    // Fallback to cached value if cloud fetch fails
    const count = this.subscribers.length;
    console.log('Getting subscriber count from cache:', count);
    return count;
  }
  
  // Get subscriber count synchronously (uses cached value)
  getSubscriberCountSync() {
    return this.subscribers.length;
  }

  // Get historical data from localStorage or cloud
  getHistoricalData() {
    try {
      const stored = localStorage.getItem('newsletter_historical_data');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading historical data:', error);
    }
    return [];
  }

  // Get historical data for analytics (last N days)
  async getHistoricalDataForChart(days = 30) {
    try {
      // Try to get from cloud first
      if (this.jsonBinBinId) {
        const apiConfig = this.getApiKeyConfig();
        const response = await fetch(`${this.jsonBinUrl}/${this.jsonBinBinId}/latest`, {
          headers: {
            [apiConfig.header]: apiConfig.key
          },
          cache: 'no-store'
        });
        
        if (response.ok) {
          const result = await response.json();
          const data = result.record || result;
          if (data.historicalData && Array.isArray(data.historicalData)) {
            // Store in localStorage for quick access
            localStorage.setItem('newsletter_historical_data', JSON.stringify(data.historicalData));
            
            // Filter to last N days
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            
            const filtered = data.historicalData.filter(s => new Date(s.date) >= cutoffDate);
            return filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
          }
        }
      }
      
      // Fallback to localStorage
      const historical = this.getHistoricalData();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      return historical.filter(s => new Date(s.date) >= cutoffDate)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return this.getHistoricalData();
    }
  }

  // Remove a single subscriber
  async removeSubscriber(email) {
    console.log('Removing subscriber:', email);
    
    if (!email) {
      throw new Error('Email is required');
    }
    
    // CRITICAL: Always reload from cloud to ensure we have the latest data
    console.log('🔄 Reloading subscribers from cloud to ensure latest data...');
    await this.loadSubscribers();
    console.log('✅ Loaded', this.subscribers.length, 'existing subscribers from cloud');
    
    const index = this.subscribers.indexOf(email);
    if (index === -1) {
      throw new Error('Subscriber not found');
    }
    
    // Remove from subscribers array
    this.subscribers.splice(index, 1);
    await this.saveSubscribers();
    console.log('✅ Subscriber removed successfully. Remaining subscribers:', this.subscribers.length);
    
    return true;
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
    
    // Update subscriber count display (fetches from cloud)
    await updateSubscriberCount();
    
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

// Update subscriber count display (fetches from cloud)
async function updateSubscriberCount() {
  try {
    // Fetch fresh count from cloud
    const count = await newsletterManager.getSubscriberCount();
    console.log('Updating subscriber count display to:', count);
    
    // Try multiple selectors to ensure we find the element
    const countElement = document.getElementById('subscriberCount');
    if (countElement) {
      countElement.textContent = count;
      console.log('✅ Updated subscriber count via #subscriberCount:', count);
    } else {
      // Fallback to class selector
      const countElements = document.querySelectorAll('.subscriber-count span');
      countElements.forEach(element => {
        if (element) {
          element.textContent = count;
          console.log('✅ Updated subscriber count via .subscriber-count span:', count);
        }
      });
    }
    
    // If no element found, log a warning
    if (!countElement && document.querySelectorAll('.subscriber-count span').length === 0) {
      console.warn('Subscriber count element not found in DOM');
    }
  } catch (error) {
    console.error('Error updating subscriber count:', error);
    // Fallback to cached count
    const cachedCount = newsletterManager.getSubscriberCountSync();
    const countElement = document.getElementById('subscriberCount');
    if (countElement) {
      countElement.textContent = cachedCount;
    }
  }
}

// Initialize on page load
async function initializeNewsletter() {
  console.log('Newsletter system initialized');
  
  // Wait for subscribers to load
  await newsletterManager.loadSubscribers();
  
  // Only update subscriber count if the element exists (not on front page)
  const countElement = document.getElementById('subscriberCount');
  if (countElement) {
    // Update subscriber count immediately (fetches from cloud)
    await updateSubscriberCount();
  }
  
  // Add debug info to console
  console.log('Current subscribers:', newsletterManager.subscribers);
  const count = await newsletterManager.getSubscriberCount();
  console.log('Subscriber count:', count);
  
  // Ensure form event listener is attached (only if form exists on this page)
  const form = document.querySelector('.newsletter-form');
  if (form) {
    console.log('Attaching event listener to newsletter form');
    // Remove existing listener if any to avoid duplicates
    form.removeEventListener('submit', handleNewsletterSignup);
    form.addEventListener('submit', handleNewsletterSignup);
    console.log('Event listener attached successfully');
  } else {
    // Not an error - some pages (like send_newsletter.html) don't have a subscription form
    console.log('Newsletter subscription form not found on this page (this is normal for some pages)');
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeNewsletter);
} else {
  // DOM is already ready
  initializeNewsletter();
}

// Debug functions (for testing)
window.newsletterDebug = {
  getSubscribers: () => newsletterManager.subscribers,
  getCount: async () => await newsletterManager.getSubscriberCount(),
  getCountSync: () => newsletterManager.getSubscriberCountSync(),
  clearSubscribers: async () => {
    await newsletterManager.clearSubscribers();
    await updateSubscriberCount();
  },
  addTestSubscriber: async (email = 'test@example.com') => {
    await newsletterManager.addSubscriber(email);
    await updateSubscriberCount();
  },
  syncToEmailJS: async () => {
    return await newsletterManager.syncWithEmailJS();
  },
  // Test JSONBin Access Key
  testJSONBinKey: async () => {
    console.log('Testing JSONBin Access Key...');
    const apiKey = newsletterManager.jsonBinAccessKey;
    console.log('Access Key length:', apiKey.length);
    console.log('Access Key (first 20 chars):', apiKey.substring(0, 20) + '...');
    
    try {
      const response = await fetch('https://api.jsonbin.io/v3/b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key': apiKey,
          'X-Bin-Name': 'Test Bin',
          'X-Bin-Private': 'true'
        },
        body: JSON.stringify({ test: true })
      });
      
      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response:', responseText);
      
      if (response.ok) {
        const result = JSON.parse(responseText);
        console.log('✅ API Key is valid! Bin ID:', result.metadata.id);
        return { success: true, binId: result.metadata.id };
      } else {
        console.error('❌ API Key test failed:', response.status, responseText);
        return { success: false, error: responseText };
      }
    } catch (error) {
      console.error('❌ Error testing API key:', error);
      return { success: false, error: error.message };
    }
  }
};