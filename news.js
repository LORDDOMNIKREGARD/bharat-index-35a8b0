// netlify/functions/news.js
// This runs on Netlify's server — your API key never touches the browser
// The key lives only in Netlify's environment variables dashboard

exports.handler = async (event) => {
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  const key = process.env.NEWSDATA_KEY;
  if (!key) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: 'NEWSDATA_KEY not set in Netlify environment variables' }),
    };
  }

  try {
    const [r1, r2] = await Promise.all([
      fetch(`https://newsdata.io/api/1/news?apikey=${key}&country=in&language=en&size=10`),
      fetch(`https://newsdata.io/api/1/news?apikey=${key}&q=RBI+OR+Supreme+Court+OR+Parliament+OR+Modi&country=in&language=en&size=10`),
    ]);

    const [d1, d2] = await Promise.all([r1.json(), r2.json()]);
    const results = [...(d1.results || []), ...(d2.results || [])];

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ results }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
