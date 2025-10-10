// ===== Takunchan Garden IoT Dashboard =====
// ดึงข้อมูลจาก ThingSpeak channel จริง
const CHANNEL_ID = "3069958";
const READ_API_KEY = "TX73L46FK87FRFGQ";
const URL = `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?results=1&api_key=${READ_API_KEY}`;

// อ้างอิง element บนหน้าเว็บ
const moistEl = document.getElementById("metric-moist");
const pumpEl = document.getElementById("pump-status");
const modeEl = document.getElementById("mode-status");

// ฟังก์ชันดึงข้อมูลจาก ThingSpeak
async function fetchThingSpeak() {
  try {
    const res = await fetch(URL);
    const data = await res.json();

    if (data.feeds && data.feeds.length > 0) {
      const feed = data.feeds[0];

      // ⚙️ ปรับตามฟิลด์จริงใน ThingSpeak ของคุณ
      const moisture = parseFloat(feed.field1);   // field1 = ความชื้น (%)
      const pumpState = parseInt(feed.field2);    // field2 = ปั๊ม (0 = OFF, 1 = ON)
      const mode = feed.field3 || "AUTO";         // field3 = โหมดควบคุม

      // 🧾 แสดงผลบนหน้าเว็บ
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

// เรียกข้อมูลครั้งแรก และอัปเดตทุก 15 วินาที
fetchThingSpeak();
setInterval(fetchThingSpeak, 15000);
