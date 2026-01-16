// Vercel Serverless Function: Get Subscribers
// This function retrieves subscribers from JSONBin.io
// Secrets are stored in Vercel environment variables, never exposed to the browser

export default async function handler(req, res) {
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

  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests FIRST (before method check)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get secrets from environment variables (set in Vercel dashboard)
    // Trim whitespace to prevent issues
    // Subscribers bin ID: 6967037143b1c97be92f1730 (private - contains subscribers, historicalData, newsletterSends)
    const jsonBinAccessKey = (process.env.JSONBIN_ACCESS_KEY || '').trim();
    const jsonBinBinId = (process.env.JSONBIN_BIN_ID || '').trim();

    if (!jsonBinAccessKey || !jsonBinBinId) {
      console.error('Missing environment variables:', {
        hasAccessKey: !!jsonBinAccessKey,
        hasBinId: !!jsonBinBinId,
        accessKeyLength: jsonBinAccessKey.length,
        binIdLength: jsonBinBinId.length
      });
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'JSONBin credentials not configured'
      });
    }

    // Fetch from JSONBin.io
    const response = await fetch(`https://api.jsonbin.io/v3/b/${jsonBinBinId}/latest`, {
      method: 'GET',
      headers: {
        'X-Access-Key': jsonBinAccessKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Bin doesn't exist yet - return empty data
        return res.status(200).json({
          subscribers: [],
          historicalData: [],
          newsletterSends: 0,
          lastUpdated: new Date().toISOString(),
          count: 0
        });
      }
      throw new Error(`JSONBin API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const data = result.record || result;

    // Check if bin contains apps data instead of subscribers (wrong bin type)
    if (data.apps && Array.isArray(data.apps) && !data.subscribers) {
      console.warn('WARNING: Bin contains apps data, not subscribers. Initializing with empty subscribers structure.');
      // Return empty subscribers structure (bin will be initialized on first save)
      return res.status(200).json({
        subscribers: [],
        historicalData: [],
        newsletterSends: 0,
        lastUpdated: new Date().toISOString(),
        count: 0
      });
    }

    // Handle both old format (array) and new format (object)
    let responseData;
    if (Array.isArray(data)) {
      // Old format - just an array of emails
      responseData = {
        subscribers: data,
        historicalData: [],
        newsletterSends: 0,
        lastUpdated: new Date().toISOString(),
        count: data.length
      };
    } else {
      // New format - object with subscribers, historicalData, and newsletterSends
      // Only use count if subscribers array exists, otherwise calculate from subscribers length
      const subscribersArray = data.subscribers || [];
      responseData = {
        subscribers: subscribersArray,
        historicalData: data.historicalData || [],
        newsletterSends: data.newsletterSends || 0,
        lastUpdated: data.lastUpdated || new Date().toISOString(),
        count: subscribersArray.length // Always use actual subscribers array length
      };
    }

    return res.status(200).json(responseData);

  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return res.status(500).json({
      error: 'Failed to fetch subscribers',
      message: error.message
    });
  }
}
