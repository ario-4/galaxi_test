document.addEventListener('DOMContentLoaded', async () => {
  await loadPerfumes();

  const searchInput = document.getElementById('searchInput');
  const resultsContainer = document.getElementById('results');
  const advancedToggle = document.getElementById('advancedSearchToggle');
  const advancedDiv = document.getElementById('advancedSearch');
  const advancedBtn = document.getElementById('advancedSearchBtn');
  const barcodeInput = document.getElementById('barcodeTest');
const barcodeBtn = document.getElementById('barcodeSearchBtn');

barcodeBtn.addEventListener('click', () => {
  const query = barcodeInput.value.trim();
  if (query.length > 0) {
    const results = searchPerfumes(query);
    displayResults(results);
  }
});


  function displayResults(results) {
    resultsContainer.innerHTML = '';
    if (results.length === 0) {
      resultsContainer.innerHTML = '<p>No se encontraron perfumes.</p>';
      return;
    }

    results.forEach(p => {
      const div = document.createElement('div');
      div.className = 'perfume-card';
      div.innerHTML = `
        <img src="${p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p><strong>Marca:</strong> ${p.brand}</p>
        <p><strong>Origen:</strong> ${p.origin}</p>
        <p><strong>Año:</strong> ${p.year} | <strong>Género:</strong> ${p.gender}</p>
        <p>${p.description}</p>
        <p><strong>Notas:</strong> Salida: ${p.nots.Top.join(', ')} | Corazón: ${p.nots.Heart.join(', ')} | Fondo: ${p.nots.Base.join(', ')}</p>
      `;
      resultsContainer.appendChild(div);
    });
  }

  searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim();

  if (query.length > 2) {
    const results = searchPerfumes(query);
    displayResults(results);
  } else if (query.length === 0) {
    resultsContainer.innerHTML = ''; // پاک کردن نتایج قبلی
  }
});


  advancedToggle.addEventListener('click', () => {
    advancedDiv.classList.toggle('hidden');
  });

  advancedBtn.addEventListener('click', () => {
    const acords = document.getElementById('acordsInput').value;
    const top = document.getElementById('topNotes').value;
    const heart = document.getElementById('heartNotes').value;
    const base = document.getElementById('baseNotes').value;
    const results = advancedSearch(top, heart, base, acords);
    displayResults(results);
  });
});
