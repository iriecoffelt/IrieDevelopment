// Vercel Serverless Function: Save Subscribers
// This function saves subscribers to JSONBin.io
// Secrets are stored in Vercel environment variables, never exposed to the browser

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers - allow requests from your domain
  const allowedOrigins = [
    'https://www.irie-development.com',
    'https://irie-development.com',
    'http://localhost:3000',
    'http://localhost:8080'
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Validate request body
    const { subscribers, historicalData, newsletterSends } = req.body;

    if (!Array.isArray(subscribers)) {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'subscribers must be an array'
      });
    }

    // Get secrets from environment variables (set in Vercel dashboard)
    const jsonBinAccessKey = process.env.JSONBIN_ACCESS_KEY;
    const jsonBinBinId = process.env.JSONBIN_BIN_ID;

    if (!jsonBinAccessKey || !jsonBinBinId) {
      console.error('Missing environment variables');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'JSONBin credentials not configured'
      });
    }

    // Prepare data to save
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Process historical data
    let processedHistoricalData = Array.isArray(historicalData) ? [...historicalData] : [];
    
    // Check if we already have a snapshot for today
    const todaySnapshot = processedHistoricalData.find(s => s.date === today);
    if (!todaySnapshot || todaySnapshot.count !== subscribers.length) {
      // Add or update today's snapshot
      const existingIndex = processedHistoricalData.findIndex(s => s.date === today);
      const snapshot = {
        date: today,
        count: subscribers.length,
        timestamp: new Date().toISOString()
      };
      
      if (existingIndex >= 0) {
        processedHistoricalData[existingIndex] = snapshot;
      } else {
        processedHistoricalData.push(snapshot);
      }
      
      // Keep only last 90 days of data
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);
      processedHistoricalData = processedHistoricalData.filter(
        s => new Date(s.date) >= cutoffDate
      );
      
      // Sort by date
      processedHistoricalData.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    const dataToSave = {
      subscribers: subscribers,
      lastUpdated: new Date().toISOString(),
      count: subscribers.length,
      historicalData: processedHistoricalData,
      newsletterSends: newsletterSends || 0
    };

    // Save to JSONBin.io
    const response = await fetch(`https://api.jsonbin.io/v3/b/${jsonBinBinId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Key': jsonBinAccessKey
      },
      body: JSON.stringify(dataToSave)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`JSONBin API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    
    return res.status(200).json({
      success: true,
      message: 'Subscribers saved successfully',
      binId: jsonBinBinId,
      count: subscribers.length,
      metadata: result.metadata
    });

  } catch (error) {
    console.error('Error saving subscribers:', error);
    return res.status(500).json({
      error: 'Failed to save subscribers',
      message: error.message
    });
  }
}
