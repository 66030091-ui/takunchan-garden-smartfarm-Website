// ===== Takunchan Garden IoT Dashboard + Chart =====
const CHANNEL_ID = "3069958";
const READ_API_KEY = "TX73L46FK87FRFGQ";
const FEED_URL = `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?results=20&api_key=${READ_API_KEY}`;

const moistEl = document.getElementById("metric-moist");
const npkEl = document.getElementById("metric-npk"); // เพิ่มกรณีมี NPK
const pumpEl = document.getElementById("pump-status");
const modeEl = document.getElementById("mode-status");
const modeTableEl = document.getElementById("mode-status-table");

const ctx = document.getElementById("spark");
let moistChart;

// === ฟังก์ชันควบคุมแอนิเมชันรดน้ำ IoT ===
function updatePumpAnimation(isOn) {
  if (isOn) {
    document.body.classList.add("pump-on");
  } else {
    document.body.classList.remove("pump-on");
  }
}

// === ฟังก์ชันหลัก: ดึงข้อมูลจาก ThingSpeak ===
async function fetchThingSpeak() {
  try {
    const res = await fetch(FEED_URL);
    const data = await res.json();

    if (data.feeds && data.feeds.length > 0) {
      const latest = data.feeds[data.feeds.length - 1];

      const moisture = parseFloat(latest.field1);
      const pumpState = parseInt(latest.field2);   // field2 = ปั๊มน้ำ
      const modeValue = latest.field3;             // field3 = โหมด AUTO/MANUAL
      const npkValue = latest.field4;              // field4 = NPK (ถ้ามี)

      let mode = "-";
      if (modeValue === "1") mode = "AUTO";
      else if (modeValue === "0") mode = "MANUAL";

      // 🧾 แสดงค่าล่าสุดบนหน้าเว็บ
      if (moistEl) moistEl.textContent = `${moisture.toFixed(1)} %`;
      if (npkEl && npkValue) npkEl.textContent = `${npkValue}`;
      
      if (pumpEl) {
        pumpEl.classList.toggle("on", pumpState === 1);
        pumpEl.classList.toggle("off", pumpState !== 1);
        const label = pumpEl.querySelector(".label");
        if (label) label.textContent = pumpState === 1 ? "ON" : "OFF";
      }

      if (modeEl) modeEl.textContent = mode;
      if (modeTableEl) modeTableEl.textContent = mode;

      // 💧 อัปเดตแอนิเมชันรดน้ำตามสถานะปั๊ม
      updatePumpAnimation(pumpState === 1);

      // 📊 เตรียมข้อมูลสำหรับกราฟ
      const moistData = data.feeds.map(f => parseFloat(f.field1));
      const labels = data.feeds.map(f => {
        const t = new Date(f.created_at);
        return t.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
      });

      if (moistChart) {
        // อัปเดตข้อมูลกราฟเดิม
        moistChart.data.labels = labels;
        moistChart.data.datasets[0].data = moistData;
        moistChart.update();
      } else if (ctx) {
        // สร้างกราฟใหม่
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
              pointBackgroundColor: moistData.map(v => (v < 35 ? "#ef4444" : "#10b981"))
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                title: { display: true, text: "%" },
                ticks: { color: "#9ca3af" },
                grid: { color: "rgba(255,255,255,0.05)" }
              },
              x: {
                title: { display: true, text: "เวลา" },
                ticks: { color: "#9ca3af" },
                grid: { color: "rgba(255,255,255,0.05)" }
              }
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                mode: "index",
                intersect: false,
                backgroundColor: "rgba(0,0,0,0.7)",
                titleColor: "#00ffae",
                bodyColor: "#e2e8f0"
              }
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
