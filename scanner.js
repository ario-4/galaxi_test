let model, videoStream;
let video, canvas, ctx;
let running = false, stopScan = false;

// بارگذاری مطمئن مدل با backend مناسب
(async () => {
  await tf.setBackend('webgl');
  await tf.ready();
  model = await cocoSsd.load();
  console.log('✅ Modelo COCO-SSD cargado correctamente');
})();

// DOM
const scanBtn = document.getElementById('scanBtn');
const cancelBtn = document.getElementById('cancel-scan');
const loading = document.getElementById('loading');
const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('results');

scanBtn.addEventListener('click', async () => {
  if (running) return;
  running = true;
  stopScan = false;
  loading.classList.remove('hidden');
  cancelBtn.classList.remove('hidden');

  // پاک‌سازی هر عنصر قدیمی
  document.querySelectorAll('video, canvas').forEach(el => el.remove());

  video = document.createElement('video');
  canvas = document.createElement('canvas');
  ctx = canvas.getContext('2d');

  try {
    videoStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    video.srcObject = videoStream;
    await video.play();
  } catch (e) {
    alert("❌ No se puede acceder a la cámara.");
    finishScan();
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  video.style.cssText = `
    position: fixed; top: 0; left: 0;
    width: 100vw; height: 100vh;
    object-fit: cover;
    z-index: 9998;
  `;

  canvas.style.cssText = `
    position: fixed; top: 0; left: 0;
    width: 100vw; height: 100vh;
    z-index: 9999;
  `;

  document.body.appendChild(video);
  document.body.appendChild(canvas);

  detectLoop();
});

cancelBtn.addEventListener('click', () => {
  stopScan = true;
  running = false;
  cleanup();
});

async function detectLoop() {
  if (!model || stopScan || !running) return;

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  try {
    const predictions = await model.detect(canvas);
    const bottle = predictions.find(p => p.class === 'bottle' && p.score > 0.5);

    if (bottle) {
      drawEffect(bottle.bbox);
      setTimeout(() => finishScan(canvas), 1000);
      return;
    }
  } catch (e) {
    console.warn('⚠️ Error al detectar:', e);
  }

  requestAnimationFrame(detectLoop);
}

function drawEffect([x, y, w, h]) {
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.clearRect(x, y, w, h);

  ctx.strokeStyle = 'cyan';
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 6]);
  ctx.lineDashOffset = -Date.now() / 15;
  ctx.strokeRect(x, y, w, h);
}

function finishScan() {
  running = false;
  stopScan = true;

  const imageData = canvas.toDataURL();
  cleanup();

  // OCR
  Tesseract.recognize(imageData, 'eng').then(({ data: { text } }) => {
    if (text.trim()) {
      searchInput.value = text.trim();
      const results = searchPerfumes(text.trim());
      if (results.length > 0) displayResults(results);
    }
  });

  // BARCODE
  Quagga.decodeSingle({
    src: imageData,
    numOfWorkers: 0,
    inputStream: { size: 800 },
    decoder: { readers: ['ean_reader', 'code_128_reader'] }
  }, async result => {
    if (result?.codeResult?.code) {
      searchInput.value = result.codeResult.code;
      const results = searchPerfumes(result.codeResult.code);
      if (results.length > 0) displayResults(results);
    } else {
      // اگر بارکد و OCR نتیجه ندادن، از تصویر استفاده کن
      const match = await identifyPerfumeFromImage(imageData);
      if (match) {
        searchInput.value = match.name;
        displayResults([match]);
      } else {
        resultsContainer.innerHTML = '<p>No se pudo identificar el perfume.</p>';
      }
    }
  });
}

function cleanup() {
  loading.classList.add('hidden');
  cancelBtn.classList.add('hidden');
  if (videoStream) videoStream.getTracks().forEach(track => track.stop());
  document.querySelectorAll('video, canvas').forEach(el => el.remove());
}

