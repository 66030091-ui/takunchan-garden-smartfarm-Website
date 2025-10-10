
// Simple interactive demo for the dashboard mock
(function(){
  const $ = (q)=>document.querySelector(q);
  const moistEl = $("#metric-moist");
  const pumpEl = $("#pump-status");
  const spark = $("#spark");

  // Fake time-series for sparkline
  const data = Array.from({length:30}, (_,i)=> 25 + Math.round(8*Math.sin(i/4)) + Math.round(Math.random()*4));

  function drawSpark(){
    if(!spark) return;
    const ctx = spark.getContext("2d");
    const w = spark.width, h = spark.height;
    ctx.clearRect(0,0,w,h);
    ctx.lineWidth = 2;
    ctx.beginPath();
    data.forEach((v,i)=>{
      const x = i/(data.length-1)*w;
      const y = h - (v-20)/20*h;
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.strokeStyle = "#0ea5e9";
    ctx.stroke();
  }

  function updateMetrics(){
    // Rotate data to simulate live updates
    data.push(data.shift());
    drawSpark();
    const latest = data[data.length-1];
    if(moistEl) moistEl.textContent = latest + " %";
    if(pumpEl){
      const isOn = latest < 35;
      pumpEl.classList.toggle("on", isOn);
      pumpEl.classList.toggle("off", !isOn);
      pumpEl.querySelector(".label").textContent = isOn ? "ON" : "OFF";
    }
  }

  window.addEventListener("load", ()=>{
    if(spark){
      spark.width = spark.clientWidth * (window.devicePixelRatio||1);
      spark.height = spark.clientHeight * (window.devicePixelRatio||1);
    }
    drawSpark();
    updateMetrics();
    setInterval(updateMetrics, 1500);
  });
})();
