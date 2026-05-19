// api/instagram.js
// Vercel Serverless Function to fetch latest 6 Instagram posts

const FALLBACK_TOKEN = "IGAAUuhE5c1Y5BZAGFRZAHc2WWR0MXBKWERaai1hbF9Qc1pkcmQ3aEc2YUlsMHVJUUFJMUJrQ1BHOFlnMXlsQ3NFdVMwUDJYamxwY0xaMlMzbW5ycXJ0U0lRV25CanlZAWnc0Y18wcGYwOG13aGx4eHUwTWt5Nkd6NTZARQnNDeFV4cwZDZD";

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

  let accessToken = FALLBACK_TOKEN;

  // Attempt to load token from Vercel KV if configured
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const kvUrl = `${process.env.KV_REST_API_URL}/get/instagram_access_token`;
      const kvResponse = await fetch(kvUrl, {
        headers: {
          Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`
        }
      });
      if (kvResponse.ok) {
        const kvData = await kvResponse.json();
        if (kvData && kvData.result) {
          accessToken = kvData.result;
          console.log("Token successfully loaded from Vercel KV.");
        } else {
          console.warn("No token found in Vercel KV, using fallback token.");
        }
      } else {
        console.warn("Failed to fetch token from Vercel KV, using fallback token.", kvResponse.statusText);
      }
    } catch (kvError) {
      console.error("Error reading token from Vercel KV:", kvError);
    }
  } else {
    console.log("Vercel KV environment variables not found, using fallback token.");
  }

  // Fetch media from Instagram Graph API (Instagram API with Instagram Login)
  try {
    const instagramUrl = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=${accessToken}&limit=6`;
    const response = await fetch(instagramUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Instagram API responded with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    // Return the media items
    res.status(200).json({
      success: true,
      data: data.data || []
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
