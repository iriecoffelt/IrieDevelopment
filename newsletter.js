// Newsletter Management System with GitHub Storage
class NewsletterManager {
  constructor() {
    this.subscribers = [];
    this.apiEndpoint = 'https://api.emailjs.com/api/v1.0/email/send';
    this.serviceId = 'service_ju06a1p';
    this.templateId = 'template_925ze9i';
    this.userId = 'zRYVGu1o6DDmrdc4f';
    
    // GitHub configuration
    this.githubConfig = {
      repo: 'iriecoffelt/IrieDevelopment', // Your actual GitHub repository
      filePath: 'data/subscribers.json',
      branch: 'main'
    };
    
    this.loadSubscribers();
  }

  // Load subscribers from GitHub
  async loadSubscribers() {
    try {
      console.log('Loading subscribers from GitHub...');
      
      // Try to get the file from GitHub
      const response = await fetch(`https://api.github.com/repos/${this.githubConfig.repo}/contents/${this.githubConfig.filePath}`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Irie-Development-Newsletter'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const content = atob(data.content);
        this.subscribers = JSON.parse(content);
        console.log('Loaded subscribers from GitHub:', this.subscribers);
      } else if (response.status === 404) {
        // File doesn't exist yet, start with empty array
        this.subscribers = [];
        console.log('No existing subscribers file found, starting fresh');
      } else {
        console.error('Error loading from GitHub:', response.status);
        // Fallback to localStorage for offline functionality
        this.loadFromLocalStorage();
      }
    } catch (error) {
      console.error('Error loading subscribers from GitHub:', error);
      // Fallback to localStorage for offline functionality
      this.loadFromLocalStorage();
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

  // Save subscribers to GitHub
  async saveSubscribers() {
    try {
      console.log('Saving subscribers to GitHub...');
      
      // Get current file SHA if it exists
      let sha = null;
      try {
        const response = await fetch(`https://api.github.com/repos/${this.githubConfig.repo}/contents/${this.githubConfig.filePath}`, {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Irie-Development-Newsletter'
          }
        });
        if (response.ok) {
          const data = await response.json();
          sha = data.sha;
        }
      } catch (error) {
        console.log('File doesn\'t exist yet, will create new file');
      }

      // Prepare the commit
      const content = btoa(JSON.stringify(this.subscribers, null, 2));
      const commitData = {
        message: `Update newsletter subscribers - ${new Date().toISOString()}`,
        content: content,
        branch: this.githubConfig.branch
      };

      if (sha) {
        commitData.sha = sha;
      }

      // For now, we'll use a public approach (no authentication required for read)
      // The file will be publicly readable but only writable through the admin interface
      console.log('Subscribers saved locally, will be synced to GitHub via admin interface');
      
      // Also save to localStorage as backup
      localStorage.setItem('newsletter_subscribers', JSON.stringify(this.subscribers));
      
    } catch (error) {
      console.error('Error saving to GitHub:', error);
      // Fallback to localStorage
      localStorage.setItem('newsletter_subscribers', JSON.stringify(this.subscribers));
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

    // Try to send to email service (but don't fail if it doesn't work)
    try {
      await this.sendToEmailService(email);
    } catch (error) {
      console.warn('Email service failed, but subscriber was saved:', error);
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
        to_email: 'iriecoffelt@gmail.com',
        from_email: email,
        subject: 'New Newsletter Signup',
        message: `New subscriber: ${email}`,
        from_name: 'Irie Development Newsletter'
      }, this.userId);

      console.log('Email sent successfully:', response);
    } catch (error) {
      console.warn('Email service error:', error);
      console.warn('This is normal for local testing - subscribers are still saved');
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

  // Sync with GitHub (for admin use)
  async syncWithGitHub(githubToken) {
    try {
      console.log('Syncing subscribers to GitHub...');
      
      // Get current file SHA if it exists
      let sha = null;
      try {
        const response = await fetch(`https://api.github.com/repos/${this.githubConfig.repo}/contents/${this.githubConfig.filePath}`, {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Irie-Development-Newsletter'
          }
        });
        if (response.ok) {
          const data = await response.json();
          sha = data.sha;
        }
      } catch (error) {
        console.log('File doesn\'t exist yet, will create new file');
      }

      // Prepare the commit
      const content = btoa(JSON.stringify(this.subscribers, null, 2));
      const commitData = {
        message: `Update newsletter subscribers - ${new Date().toISOString()}`,
        content: content,
        branch: this.githubConfig.branch
      };

      if (sha) {
        commitData.sha = sha;
      }

      // Make the API call to update the file
      const response = await fetch(`https://api.github.com/repos/${this.githubConfig.repo}/contents/${this.githubConfig.filePath}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Irie-Development-Newsletter'
        },
        body: JSON.stringify(commitData)
      });

      if (response.ok) {
        console.log('Successfully synced subscribers to GitHub');
        return true;
      } else {
        const error = await response.json();
        console.error('Failed to sync to GitHub:', error);
        throw new Error(`GitHub API error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error syncing with GitHub:', error);
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
  syncToGitHub: async (token) => {
    return await newsletterManager.syncWithGitHub(token);
  }
};