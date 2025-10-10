// ===== Takunchan Garden IoT Dashboard + Chart =====
const CHANNEL_ID = "3069958";
const READ_API_KEY = "TX73L46FK87FRFGQ";
const FEED_URL = `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?results=20&api_key=${READ_API_KEY}`;

const moistEl = document.getElementById("metric-moist");
const pumpEl = document.getElementById("pump-status");
const modeEl = document.getElementById("mode-status");
const modeTableEl = document.getElementById("mode-status-table");

// ตัวแปรกราฟ
const ctx = document.getElementById("spark");
let moistChart;

// ฟังก์ชันหลัก ดึงข้อมูลจาก ThingSpeak
async function fetchThingSpeak() {
  try {
    const res = await fetch(FEED_URL);
    const data = await res.json();

    if (data.feeds && data.feeds.length > 0) {
      // ข้อมูลล่าสุด
      const latest = data.feeds[data.feeds.length - 1];
      const moisture = parseFloat(latest.field1);
      const pumpState = parseInt(latest.field2);
      const modeValue = latest.field3;
      let mode = "-";

      // ✅ แปลงค่าจาก field3: 1 = AUTO, 0 = MANUAL
      if (modeValue === "1") mode = "AUTO";
      else if (modeValue === "0") mode = "MANUAL";

      // 🧾 แสดงค่าล่าสุดบนหน้าเว็บ
      if (moistEl) moistEl.textContent = `${moisture.toFixed(1)} %`;

      if (pumpEl) {
        pumpEl.classList.toggle("on", pumpState === 1);
        pumpEl.classList.toggle("off", pumpState !== 1);
        const label = pumpEl.querySelector(".label");
        if (label) label.textContent = pumpState === 1 ? "ON" : "OFF";
      }

      if (modeEl) modeEl.textContent = mode;
      if (modeTableEl) modeTableEl.textContent = mode;

      // 📊 เตรียมข้อมูลสำหรับกราฟ
      const moistData = data.feeds.map(f => parseFloat(f.field1));
      const labels = data.feeds.map(f => {
        const t = new Date(f.created_at);
        return t.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
      });

      // ถ้ามีกราฟอยู่แล้วให้ update ค่าใหม่
      if (moistChart) {
        moistChart.data.labels = labels;
        moistChart.data.datasets[0].data = moistData;
        moistChart.update();
      } else if (ctx) {
        moistChart = new Chart(ctx, {
          type: "line",
          data: {
            labels: labels,
            datasets: [{
              label: "ค่าความชื้น (%)",
              data: moistData,
              borderColor: "#10b981",
              backgroundColor: "rgba(16,185,129,0.15)",
              tension: 0.3,
              fill: true,
              pointRadius: 2,
              pointBackgroundColor: moistData.map(v => (v < 35 ? "#ef4444" : "#10b981")) // จุดแดงเมื่อแห้ง
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                title: { display: true, text: "%" }
              },
              x: {
                title: { display: true, text: "เวลา" }
              }
            },
            plugins: {
              legend: { display: false },
              tooltip: { mode: "index", intersect: false }
            }
          }
        });
      }
    }
  } catch (err) {
    console.error("ThingSpeak fetch error:", err);
  }
}

// 🔁 ดึงข้อมูลครั้งแรก และอัปเดตทุก 15 วินาที
fetchThingSpeak();
setInterval(fetchThingSpeak, 15000);
