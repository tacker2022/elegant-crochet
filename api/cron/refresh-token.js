// api/cron/refresh-token.js
// Vercel Cron Job to refresh the long-lived Instagram token monthly

const FALLBACK_TOKEN = "IGAAUuhE5c1Y5BZAGFRZAHc2WWR0MXBKWERaai1hbF9Qc1pkcmQ3aEc2YUlsMHVJUUFJMUJrQ1BHOFlnMXlsQ3NFdVMwUDJYamxwY0xaMlMzbW5ycXJ0U0lRV25CanlZAWnc0Y18wcGYwOG13aGx4eHUwTWt5Nkd6NTZARQnNDeFV4cwZDZD";

module.exports = async (req, res) => {
  // Verify Cron authorization
  const authHeader = req.headers.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    res.status(401).json({ success: false, error: "Unauthorized access" });
    return;
  }

  // Check KV availability
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    res.status(500).json({ 
      success: false, 
      error: "Vercel KV configuration is missing. Cannot refresh token." 
    });
    return;
  }

  let currentToken = FALLBACK_TOKEN;

  // 1. Get the current token from KV
  try {
    const kvGetUrl = `${process.env.KV_REST_API_URL}/get/instagram_access_token`;
    const kvResponse = await fetch(kvGetUrl, {
      headers: {
        Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`
      }
    });

    if (kvResponse.ok) {
      const kvData = await kvResponse.json();
      if (kvData && kvData.result) {
        let tokenVal = kvData.result;
        if (typeof tokenVal === "string") {
          tokenVal = tokenVal.replace(/^["']|["']$/g, "");
        }
        currentToken = tokenVal;
        console.log("Current token loaded from KV for refresh.");
      }
    }
  } catch (error) {
    console.error("Error reading current token from KV:", error);
    // If reading fails, we can try to refresh the fallback token as a recovery measure
  }

  // 2. Call Instagram API to refresh the token
  try {
    const refreshUrl = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${currentToken}`;
    const refreshResponse = await fetch(refreshUrl);

    if (!refreshResponse.ok) {
      const errorText = await refreshResponse.text();
      throw new Error(`Instagram token refresh failed: ${refreshResponse.status} ${errorText}`);
    }

    const refreshData = await refreshResponse.json();
    const newToken = refreshData.access_token;

    if (!newToken) {
      throw new Error("No access_token returned in Instagram refresh response.");
    }

    console.log("Instagram token successfully refreshed. Expiry in:", refreshData.expires_in);

    // 3. Save the new token back to Vercel KV
    const kvSetUrl = `${process.env.KV_REST_API_URL}/set/instagram_access_token`;
    const kvSetResponse = await fetch(kvSetUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newToken) // Store token as JSON string value in Upstash
    });

    if (!kvSetResponse.ok) {
      const kvSetErrorText = await kvSetResponse.text();
      throw new Error(`Failed to save new token to Vercel KV: ${kvSetResponse.status} ${kvSetErrorText}`);
    }

    res.status(200).json({ 
      success: true, 
      message: "Instagram access token successfully refreshed and stored in KV.",
      expires_in: refreshData.expires_in
    });
  } catch (error) {
    console.error("Cron Token Refresh Error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to refresh token",
      message: error.message 
    });
  }
};
