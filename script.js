// Compute continued fraction representation
// Returns array of integer coefficients [a₀, a₁, a₂, ...]
function continuedFraction(x) {
  const terms = [];
  let remaining = x;
  const maxTerms = 100; // Safety limit to prevent infinite loops

  for (let i = 0; i < maxTerms; i++) {
    const integer = Math.floor(remaining);
    terms.push(integer);

    const fractional = remaining - integer;
    // Stop if fractional part is negligible (within floating point precision)
    if (Math.abs(fractional) < 1e-10) break;

    remaining = 1 / fractional;
    // Stop if remaining becomes too large (would indicate precision issues)
    if (!isFinite(remaining)) break;
  }

  return terms;
}

// Generator that yields convergents from continued fraction terms
// Uses recurrence: pₙ = aₙ * pₙ₋₁ + pₙ₋₂ (similarly for q)
function* generateConvergents(terms) {
  let [p_prev, p] = [1, terms[0]];
  let [q_prev, q] = [0, 1];

  yield { p, q };

  for (let i = 1; i < terms.length; i++) {
    [p_prev, p] = [p, terms[i] * p + p_prev];
    [q_prev, q] = [q, terms[i] * q + q_prev];
    yield { p, q };
  }
}

// Compute all convergents from continued fraction terms
function computeConvergents(terms) {
  return Array.from(generateConvergents(terms));
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
  return (error + 1e-6) * q * q;
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

  // Display convergents in table body
  const tbody = document.getElementById('convergents');
  let rowsHTML = '';

  sorted.forEach((conv) => {
    const decimal = conv.p / conv.q;
    const error = Math.abs(decimal - x);
    const errorPercent = (error / Math.abs(x)) * 100;
    const fractionString = `${conv.p}/${conv.q}`;

    rowsHTML += `
      <tr>
        <td class="decimal-cell">${formatDecimal(decimal)}</td>
        <td class="fraction-cell" onclick="copyFraction('${fractionString}')">
          <div class="fraction-display">
            <span class="fraction-numerator">${conv.p}</span>
            <div class="fraction-line"></div>
            <span class="fraction-denominator">${conv.q}</span>
          </div>
        </td>
        <td class="error-cell">${errorPercent.toFixed(4)}%</td>
      </tr>
    `;
  });

  tbody.innerHTML = rowsHTML;

  // Show results
  document.getElementById('results').classList.add('visible');
}

// Copy fraction to clipboard
function copyFraction(fractionString) {
  navigator.clipboard.writeText(fractionString).then(() => {
    // Optional: Could add visual feedback here
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
}

// Event listener
document.getElementById('numberInput').addEventListener('input', (e) => {
  const input = e.target;
  const value = parseFloat(input.value);

  if (!isNaN(value) && input.value !== '') {
    rationalize(value);
  } else {
    document.getElementById('results').classList.remove('visible');
  }
});
