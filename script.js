// Compute continued fraction representation
// Returns array of integer coefficients [a₀, a₁, a₂, ...]
function continuedFraction(x, maxTerms = 15) {
  const terms = [];
  let remaining = x;

  for (let i = 0; i < maxTerms; i++) {
    const integer = Math.floor(remaining);
    terms.push(integer);

    const fractional = remaining - integer;
    if (Math.abs(fractional) < 1e-10) break;

    remaining = 1 / fractional;
  }

  return terms;
}

// Compute convergents (p/q) from continued fraction terms
// Each convergent is computed using recurrence relations:
//   p₋₁ = 1, p₀ = a₀
//   pₙ = aₙ * pₙ₋₁ + pₙ₋₂
// (similarly for q)
function computeConvergents(terms) {
  const convergents = [];
  let p_prev2 = 1, p_prev1 = terms[0];
  let q_prev2 = 0, q_prev1 = 1;

  // First convergent
  convergents.push({ p: p_prev1, q: q_prev1 });

  // Remaining convergents
  for (let i = 1; i < terms.length; i++) {
    const a = terms[i];
    const p = a * p_prev1 + p_prev2;
    const q = a * q_prev1 + q_prev2;

    convergents.push({ p, q });

    p_prev2 = p_prev1;
    p_prev1 = p;
    q_prev2 = q_prev1;
    q_prev1 = q;
  }

  return convergents;
}

// Format continued fraction as [a₀; a₁, a₂, ...]
function formatCF(terms) {
  if (terms.length === 0) return '[]';
  if (terms.length === 1) return `[${terms[0]}]`;
  return `[${terms[0]}; ${terms.slice(1).join(', ')}]`;
}

// Quality metric: balances accuracy with simplicity
// Lower score is better. Penalizes both error and large denominators.
function quality(p, q, x) {
  const error = Math.abs(p / q - x);
  // Add small epsilon to penalize large denominators even with zero error
  return (error + 1e-5) * q;
}

// Format decimal to up to 15 significant digits without trailing zeros
function formatDecimal(value) {
  // Round to 15 significant figures to eliminate floating-point errors
  const rounded = parseFloat(value.toPrecision(15));
  // Convert to string and remove trailing zeros
  return rounded.toString().replace(/\.0+$/, '');
}

// Main computation and display
function rationalize(x) {
  const terms = continuedFraction(x);
  const convergents = computeConvergents(terms);

  // Display continued fraction
  document.getElementById('cfSequence').textContent = formatCF(terms);

  // Sort convergents by quality (lower is better)
  const sorted = convergents
    .map(conv => ({
      ...conv,
      score: quality(conv.p, conv.q, x)
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 5); // Limit to 5 approximations

  // Display convergents in table
  const convergentsDiv = document.getElementById('convergents');
  let tableHTML = `
    <table>
      <thead>
        <tr>
          <th>Decimal</th>
          <th>Fraction</th>
          <th>Error %</th>
        </tr>
      </thead>
      <tbody>
  `;

  sorted.forEach((conv) => {
    const decimal = conv.p / conv.q;
    const error = Math.abs(decimal - x);
    const errorPercent = (error / Math.abs(x)) * 100;

    tableHTML += `
      <tr>
        <td class="decimal-cell">${formatDecimal(decimal)}</td>
        <td class="fraction-cell">${conv.p} / ${conv.q}</td>
        <td class="error-cell">${errorPercent.toFixed(4)}%</td>
      </tr>
    `;
  });

  tableHTML += `
      </tbody>
    </table>
  `;

  convergentsDiv.innerHTML = tableHTML;

  // Show results
  document.getElementById('results').classList.add('visible');
}

// Event listener
document.getElementById('numberInput').addEventListener('input', (e) => {
  const value = parseFloat(e.target.value);
  if (!isNaN(value)) {
    rationalize(value);
  }
});

// Help icon toggle
document.getElementById('helpIcon').addEventListener('click', () => {
  document.getElementById('helpPopup').classList.toggle('visible');
});

// Close popup when clicking outside
document.addEventListener('click', (e) => {
  const popup = document.getElementById('helpPopup');
  const icon = document.getElementById('helpIcon');
  if (!popup.contains(e.target) && !icon.contains(e.target)) {
    popup.classList.remove('visible');
  }
});
