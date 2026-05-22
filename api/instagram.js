// api/instagram.js
// Vercel Serverless Function to fetch latest 6 Instagram posts

const FALLBACK_TOKEN = "IGAAUuhE5c1Y5BZAGFVVWQzSEJlUU5PbXFfLU9rTkMtNjQtdmlpVDYwMkFFbGtGQURRS0JEUTNVWEhmYnB6cUhlYXpCT3dxa2lsV1AwMm9XdlFtU3hNWE9hb3JLd3kxTE12QzJkVUJRZAkNXdktmclBXSUhmUnhGcmRsVWEwQ1llZAwZDZD";

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Parse limit parameter (default is 6, maximum 100)
  let limit = req.query.limit ? parseInt(req.query.limit, 10) : 6;
  if (isNaN(limit) || limit <= 0 || limit > 100) {
    limit = 6;
  }

  const cacheKey = `instagram_cache_${limit}`;
  const isKvConfigured = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

  let accessToken = FALLBACK_TOKEN;
  let forceFreshFetch = false;

  // 1. Load Instagram Access Token from KV & Sync
  if (isKvConfigured) {
    try {
      const kvUrl = `${process.env.KV_REST_API_URL}/get/instagram_access_token`;
      const kvResponse = await fetch(kvUrl, {
        headers: {
          Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`
        }
      });
      if (kvResponse.ok) {
        const kvData = await kvResponse.json();
        let tokenVal = kvData && kvData.result;
        if (typeof tokenVal === "string") {
          tokenVal = tokenVal.replace(/^["']|["']$/g, "");
        }
        
        // If the token in KV does not match the new FALLBACK_TOKEN, sync it to KV
        if (tokenVal !== FALLBACK_TOKEN) {
          console.log("KV token is outdated. Syncing new token to Vercel KV...");
          const kvSetUrl = `${process.env.KV_REST_API_URL}/set/instagram_access_token`;
          await fetch(kvSetUrl, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(FALLBACK_TOKEN)
          });
          console.log("Vercel KV synced successfully.");
          forceFreshFetch = true; // Bypass cache to force a fresh fetch with the new token
        }
        accessToken = FALLBACK_TOKEN;
        console.log("Token successfully loaded/synced in Vercel KV.");
      } else {
        console.warn("Failed to fetch token from Vercel KV, using fallback token.", kvResponse.statusText);
      }
    } catch (kvError) {
      console.error("Error reading/syncing token from Vercel KV:", kvError);
    }
  } else {
    console.log("Vercel KV environment variables not found, using fallback token.");
  }

  // 2. Check Redis Cache first (unless token just changed and we need a fresh fetch)
  if (isKvConfigured && !forceFreshFetch) {
    try {
      const kvGetUrl = `${process.env.KV_REST_API_URL}/get/${cacheKey}`;
      const kvGetResponse = await fetch(kvGetUrl, {
        headers: {
          Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`
        }
      });
      if (kvGetResponse.ok) {
        const kvGetData = await kvGetResponse.json();
        if (kvGetData && kvGetData.result) {
          let cachedPayload = kvGetData.result;
          
          // Decode JSON if double stringified
          if (typeof cachedPayload === "string") {
            try {
              cachedPayload = JSON.parse(cachedPayload);
              if (typeof cachedPayload === "string") {
                cachedPayload = JSON.parse(cachedPayload);
              }
            } catch (e) {
              // Proceed with fallback if parsing fails
            }
          }
          
          if (cachedPayload && cachedPayload.timestamp && cachedPayload.data) {
            const CACHE_TTL = 3600000; // 1 hour
            if (Date.now() - cachedPayload.timestamp < CACHE_TTL) {
              console.log(`Serving ${limit} items from Redis cache.`);
              res.status(200).json({
                success: true,
                data: cachedPayload.data,
                cached: true
              });
              return;
            }
          }
        }
      }
    } catch (cacheReadError) {
      console.error("Cache read error:", cacheReadError);
    }
  }

  // 3. Fetch media from Instagram Graph API
  try {
    const instagramUrl = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=${accessToken}&limit=${limit}`;
    const response = await fetch(instagramUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Instagram API responded with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const mediaData = data.data || [];

    // 4. Save to Redis Cache (only if we got valid data back)
    if (isKvConfigured && mediaData.length > 0) {
      try {
        const kvSetUrl = `${process.env.KV_REST_API_URL}/set/${cacheKey}`;
        const cachePayload = {
          timestamp: Date.now(),
          data: mediaData
        };
        
        await fetch(kvSetUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(cachePayload)
        });
        console.log(`Saved ${limit} items to Redis cache.`);
      } catch (cacheWriteError) {
        console.error("Cache write error:", cacheWriteError);
      }
    }
    
    // Return the media items
    res.status(200).json({
      success: true,
      data: mediaData,
      cached: false
    });
  } catch (error) {
    console.error("Error fetching Instagram media:", error);
    res.status(500).json({
      success: false,
      error: "Instagram media could not be fetched",
      message: error.message
    });
  }
};
