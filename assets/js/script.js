const CHANNEL_ID = "3069958";
const READ_API_KEY = "TX73L46FK87FRFGQ";
const URL = `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?results=1&api_key=${READ_API_KEY}`;

const moistEl = document.getElementById("metric-moist");
const pumpEl = document.getElementById("pump-status");
const modeEl = document.getElementById("mode-status");

async function fetchThingSpeak() {
  try {
    const res = await fetch(URL);
    const data = await res.json();

    if (data.feeds && data.feeds.length > 0) {
      const feed = data.feeds[0];

      const moisture = parseFloat(feed.field1);
      const pumpState = parseInt(feed.field2);
      let modeValue = feed.field3;
      let mode;

      // ✅ 1 = AUTO, 0 = MANUAL
      if (modeValue === "1") {
        mode = "AUTO";
      } else if (modeValue === "0") {
        mode = "MANUAL";
      } else {
        mode = "-";
      }

      if (moistEl) moistEl.textContent = `${moisture.toFixed(1)} %`;

      if (pumpEl) {
        pumpEl.classList.toggle("on", pumpState === 1);
        pumpEl.classList.toggle("off", pumpState !== 1);
        const label = pumpEl.querySelector(".label");
        if (label) label.textContent = pumpState === 1 ? "ON" : "OFF";
      }

      if (modeEl) modeEl.textContent = mode;
    }
  } catch (err) {
    console.error("ThingSpeak fetch error:", err);
  }
}

fetchThingSpeak();
setInterval(fetchThingSpeak, 15000);
