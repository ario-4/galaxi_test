let mobilenetModel;
let imageFeatures = [];

// بارگذاری مدل MobileNet
async function loadMobileNet() {
  if (mobilenetModel) return;
  mobilenetModel = await ml5.featureExtractor('MobileNet', () => {
    console.log('✅ MobileNet cargado correctamente');
  });
}

// بارگذاری تصاویر دیتابیس و استخراج ویژگی‌ها
async function generateFeatureDatabase() {
  await loadMobileNet();
  const response = await fetch('perfumes.json');
  const perfumes = await response.json();

  imageFeatures = [];

  for (const perfume of perfumes) {
    const img = await loadImageElement(perfume.image);
    const features = mobilenetModel.infer(img);
    imageFeatures.push({ id: perfume.id, features, perfume });
  }
}

// بارگذاری عکس به صورت Image Element
function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}

// دریافت تصویر کاربر و تطبیق با دیتابیس
async function identifyPerfumeFromImage(userImageSrc) {
  if (!mobilenetModel || imageFeatures.length === 0) await generateFeatureDatabase();

  const userImg = await loadImageElement(userImageSrc);
  const userFeatures = mobilenetModel.infer(userImg);

  let bestMatch = null;
  let highestSim = -1;

  for (const item of imageFeatures) {
    const sim = cosineSimilarity(userFeatures.arraySync(), item.features.arraySync());
    if (sim > highestSim) {
      highestSim = sim;
      bestMatch = item.perfume;
    }
  }

  return bestMatch;
}

// محاسبه شباهت کسینوسی
function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
