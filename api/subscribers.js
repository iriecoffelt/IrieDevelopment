// GET: list (optional Bearer) | POST { email } only: public one-address subscribe
import { setCorsForSubscriberRoutes, guardSubscribersApi } from './lib/subscriber-api-common.js';

function isValidSubscribeEmail(s) {
  return typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

function normalizeRecordForSubscribe(data) {
  if (Array.isArray(data)) {
    return {
      subscribers: data.map((e) => String(e).toLowerCase().trim()),
      historicalData: [],
      newsletterSends: 0,
    };
  }
  const subs = Array.isArray(data.subscribers)
    ? data.subscribers.map((e) => String(e).toLowerCase().trim())
    : [];
  return {
    subscribers: subs,
    historicalData: Array.isArray(data.historicalData) ? [...data.historicalData] : [],
    newsletterSends: typeof data.newsletterSends === 'number' ? data.newsletterSends : 0,
  };
}

function buildSnapshotForSubscribers(historicalData, subscriberCount) {
  const today = new Date().toISOString().split('T')[0];
  let processed = Array.isArray(historicalData) ? [...historicalData] : [];
  const todaySnapshot = processed.find((s) => s.date === today);
  if (!todaySnapshot || todaySnapshot.count !== subscriberCount) {
    const existingIndex = processed.findIndex((s) => s.date === today);
    const snapshot = {
      date: today,
      count: subscriberCount,
      timestamp: new Date().toISOString(),
    };
    if (existingIndex >= 0) {
      processed[existingIndex] = snapshot;
    } else {
      processed.push(snapshot);
    }
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);
    processed = processed.filter((s) => new Date(s.date) >= cutoffDate);
    processed.sort((a, b) => new Date(a.date) - new Date(b.date));
  }
  return processed;
}

/** Public: POST { email } — appends one subscriber (no full list in client). */
async function handlePublicSubscribePost(req, res) {
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  if (Array.isArray(body.subscribers)) {
    return res.status(400).json({
      error: 'Use POST /api/subscribers-save for full list',
    });
  }
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!isValidSubscribeEmail(email)) {
    return res.status(400).json({ error: 'Invalid request', message: 'Valid email is required' });
  }

  const jsonBinAccessKey = (process.env.JSONBIN_ACCESS_KEY || '').trim();
  const jsonBinBinId = (process.env.JSONBIN_BIN_ID || '').trim();
  if (!jsonBinAccessKey || !jsonBinBinId) {
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'JSONBin credentials not configured',
    });
  }

  const response = await fetch(`https://api.jsonbin.io/v3/b/${jsonBinBinId}/latest`, {
    method: 'GET',
    headers: {
      'X-Access-Key': jsonBinAccessKey,
      Accept: 'application/json',
    },
  });

  let record;
  if (!response.ok) {
    if (response.status === 404) {
      record = { subscribers: [], historicalData: [], newsletterSends: 0 };
    } else {
      return res.status(500).json({
        error: 'Failed to read subscribers',
        message: `JSONBin read error: ${response.status}`,
      });
    }
  } else {
    const result = await response.json();
    const raw = result.record;
    if (raw === undefined || raw === null) {
      record = { subscribers: [], historicalData: [], newsletterSends: 0 };
    } else if (raw.apps && Array.isArray(raw.apps) && !raw.subscribers) {
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'Subscriber bin is misconfigured',
      });
    } else {
      record = normalizeRecordForSubscribe(raw);
    }
  }

  if (record.subscribers.includes(email)) {
    return res.status(200).json({
      ok: true,
      alreadySubscribed: true,
      count: record.subscribers.length,
    });
  }

  const subscribers = [...record.subscribers, email];
  const historicalData = buildSnapshotForSubscribers(
    record.historicalData,
    subscribers.length
  );
  const dataToSave = {
    subscribers,
    lastUpdated: new Date().toISOString(),
    count: subscribers.length,
    historicalData,
    newsletterSends: record.newsletterSends || 0,
  };

  const putResponse = await fetch(`https://api.jsonbin.io/v3/b/${jsonBinBinId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Access-Key': jsonBinAccessKey,
    },
    body: JSON.stringify(dataToSave),
  });

  if (!putResponse.ok) {
    const errorText = await putResponse.text();
    return res.status(500).json({
      error: 'Failed to subscribe',
      message: `JSONBin save error: ${putResponse.status} - ${errorText}`,
    });
  }

  return res.status(200).json({
    ok: true,
    alreadySubscribed: false,
    count: subscribers.length,
  });
}

export default async function handler(req, res) {
  setCorsForSubscriberRoutes(req, res);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      return await handlePublicSubscribePost(req, res);
    } catch (err) {
      console.error('public subscribe POST error:', err);
      return res.status(500).json({ error: 'Failed to subscribe', message: err.message });
    }
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!guardSubscribersApi(req, res)) {
    return;
  }

  try {
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

    const response = await fetch(`https://api.jsonbin.io/v3/b/${jsonBinBinId}/latest`, {
      method: 'GET',
      headers: {
        'X-Access-Key': jsonBinAccessKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
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

    if (data.apps && Array.isArray(data.apps) && !data.subscribers) {
      console.warn('WARNING: Bin contains apps data, not subscribers. Initializing with empty subscribers structure.');
      return res.status(200).json({
        subscribers: [],
        historicalData: [],
        newsletterSends: 0,
        lastUpdated: new Date().toISOString(),
        count: 0
      });
    }

    let responseData;
    if (Array.isArray(data)) {
      responseData = {
        subscribers: data,
        historicalData: [],
        newsletterSends: 0,
        lastUpdated: new Date().toISOString(),
        count: data.length
      };
    } else {
      const subscribersArray = data.subscribers || [];
      responseData = {
        subscribers: subscribersArray,
        historicalData: data.historicalData || [],
        newsletterSends: data.newsletterSends || 0,
        lastUpdated: data.lastUpdated || new Date().toISOString(),
        count: subscribersArray.length
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
