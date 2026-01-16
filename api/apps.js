// Vercel Serverless Function: Get Apps
// This function retrieves apps data from JSONBin.io
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
    const jsonBinAccessKey = (process.env.JSONBIN_ACCESS_KEY || '').trim();
    // Apps bin ID: 69670ee1d0ea881f406a814c (public - contains apps data)
    const appsBinId = (process.env.JSONBIN_APPS_BIN_ID || process.env.JSONBIN_BIN_ID || '').trim() || '69670ee1d0ea881f406a814c';

    if (!jsonBinAccessKey) {
      console.error('Missing JSONBIN_ACCESS_KEY environment variable');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'JSONBin credentials not configured'
      });
    }

    // Fetch from JSONBin.io
    const response = await fetch(`https://api.jsonbin.io/v3/b/${appsBinId}/latest`, {
      method: 'GET',
      headers: {
        'X-Access-Key': jsonBinAccessKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Bin doesn't exist yet - return empty apps array
        return res.status(200).json({
          apps: [],
          lastUpdated: new Date().toISOString(),
          count: 0
        });
      }
      throw new Error(`JSONBin API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const data = result.record || result;

    // Return apps data
    return res.status(200).json({
      apps: data.apps || [],
      lastUpdated: data.lastUpdated || new Date().toISOString(),
      count: data.count || (data.apps ? data.apps.length : 0)
    });

  } catch (error) {
    console.error('Error fetching apps:', error);
    return res.status(500).json({
      error: 'Failed to fetch apps',
      message: error.message
    });
  }
}
