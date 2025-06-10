let perfumes = [];

async function loadPerfumes() {
  const response = await fetch('perfumes.json');
  perfumes = await response.json();
}
function normalize(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// Match متنی با درصد خطا (fuzzy search ساده)
function fuzzyMatch(input, target) {
  input = normalize(input);
  target = normalize(target);
  return target.includes(input) || levenshtein(input, target) <= 2;
}


// فاصله Levenshtein برای تشخیص اشتباه تایپی
function levenshtein(a, b) {
  const matrix = Array(a.length + 1).fill().map(() => Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      matrix[i][j] = a[i - 1] === b[j - 1]
        ? matrix[i - 1][j - 1]
        : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[a.length][b.length];
}

// جستجوی ساده براساس نام یا برند
function searchPerfumes(query) {
  query = normalize(query);
  return perfumes.filter(p =>
    fuzzyMatch(query, p.name) ||
    fuzzyMatch(query, p.brand) ||
    normalize(p.barcode).includes(query)
  );
}

// جستجوی پیشرفته با نت‌ها
function advancedSearch(top, heart, base, acordText) {
  const topArr = top ? top.split(',').map(normalize) : [];
  const heartArr = heart ? heart.split(',').map(normalize) : [];
  const baseArr = base ? base.split(',').map(normalize) : [];
  const acordArr = acordText ? acordText.split(',').map(normalize) : [];

  return perfumes.filter(p => {
    const notes = p.nots;
    const checkNotes = (arr, actual) => arr.every(n =>
      actual.map(normalize).includes(n.trim())
    );
    const checkAcords = acordArr.every(ac =>
      p.acords.map(normalize).includes(ac.trim())
    );

    return (!top || checkNotes(topArr, notes.Top)) &&
           (!heart || checkNotes(heartArr, notes.Heart)) &&
           (!base || checkNotes(baseArr, notes.Base)) &&
           (!acordText || checkAcords);
  });
}


