// Vercel Serverless Function: Save Apps
// This function saves apps data to JSONBin.io
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

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests FIRST (before method check)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate request body
    const { apps } = req.body;

    if (!Array.isArray(apps)) {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'apps must be an array'
      });
    }

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

    const dataToSave = {
      apps: apps,
      lastUpdated: new Date().toISOString(),
      count: apps.length
    };

    // Save to JSONBin.io
    const response = await fetch(`https://api.jsonbin.io/v3/b/${appsBinId}`, {
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
      message: 'Apps saved successfully',
      binId: appsBinId,
      count: apps.length,
      metadata: result.metadata
    });

  } catch (error) {
    console.error('Error saving apps:', error);
    return res.status(500).json({
      error: 'Failed to save apps',
      message: error.message
    });
  }
}
