// api/youtube.js
// Vercel Serverless Function to fetch latest 3 YouTube videos from Elegant Crochet channel

const FALLBACK_VIDEOS = [
  {
    videoId: "h77sBW7iklQ",
    title: "Elegant Crochet Video 1",
    thumbnail: "https://img.youtube.com/vi/h77sBW7iklQ/hqdefault.jpg"
  },
  {
    videoId: "_U7Om1najbs",
    title: "Elegant Crochet Video 2",
    thumbnail: "https://img.youtube.com/vi/_U7Om1najbs/hqdefault.jpg"
  },
  {
    videoId: "8pdxIogkpIw",
    title: "Elegant Crochet Video 3",
    thumbnail: "https://img.youtube.com/vi/8pdxIogkpIw/hqdefault.jpg"
  }
];

const CHANNEL_ID = "UCKVZCmUqrnV1xfZrMiFufsw";
const CACHE_KEY = "youtube_cache_3";
const CACHE_TTL = 21600000; // 6 hours in milliseconds

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

  const apiKey = process.env.YOUTUBE_API_KEY;
  const isKvConfigured = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

  // 1. If API Key is not set, immediately return fallback videos
  if (!apiKey) {
    console.log("YOUTUBE_API_KEY environment variable not found. Serving fallback videos.");
    res.status(200).json({
      success: true,
      data: FALLBACK_VIDEOS,
      cached: false,
      fallback: true
    });
    return;
  }

  // 2. Check Vercel KV cache first
  if (isKvConfigured) {
    try {
      const kvGetUrl = `${process.env.KV_REST_API_URL}/get/${CACHE_KEY}`;
      const kvGetResponse = await fetch(kvGetUrl, {
        headers: {
          Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`
        }
      });

      if (kvGetResponse.ok) {
        const kvGetData = await kvGetResponse.json();
        if (kvGetData && kvGetData.result) {
          let cachedPayload = kvGetData.result;

          // Decode JSON if double-stringified
          if (typeof cachedPayload === "string") {
            try {
              cachedPayload = JSON.parse(cachedPayload);
              if (typeof cachedPayload === "string") {
                cachedPayload = JSON.parse(cachedPayload);
              }
            } catch (e) {
              // Proceed if parsing fails
            }
          }

          if (cachedPayload && cachedPayload.timestamp && cachedPayload.data) {
            if (Date.now() - cachedPayload.timestamp < CACHE_TTL) {
              console.log("Serving YouTube videos from Vercel KV cache.");
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
      console.error("Cache read error for YouTube:", cacheReadError);
    }
  } else {
    console.log("Vercel KV environment variables not found. Fetching fresh data without cache.");
  }

  // 3. Fetch fresh data from YouTube API
  try {
    const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=3&type=video`;
    const response = await fetch(youtubeUrl);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`YouTube API responded with status ${response.status}: ${errorText}`);
    }

    const responseData = await response.json();
    const items = responseData.items || [];

    if (items.length === 0) {
      throw new Error("No videos found on the channel.");
    }

    const videos = items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title || "Elegant Crochet Video",
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || `https://img.youtube.com/vi/${item.id.videoId}/hqdefault.jpg`
    }));

    // 4. Save to Redis Cache (only if we got valid data back)
    if (isKvConfigured && videos.length > 0) {
      try {
        const kvSetUrl = `${process.env.KV_REST_API_URL}/set/${CACHE_KEY}`;
        const cachePayload = {
          timestamp: Date.now(),
          data: videos
        };

        await fetch(kvSetUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(cachePayload)
        });
        console.log("Saved YouTube videos to Vercel KV cache.");
      } catch (cacheWriteError) {
        console.error("Cache write error for YouTube:", cacheWriteError);
      }
    }

    res.status(200).json({
      success: true,
      data: videos,
      cached: false
    });

  } catch (error) {
    console.error("Error fetching YouTube videos, serving fallbacks:", error);
    // Gracefully degrade to fallbacks so the site works perfectly!
    res.status(200).json({
      success: true,
      data: FALLBACK_VIDEOS,
      cached: false,
      fallback: true,
      error: error.message
    });
  }
};
