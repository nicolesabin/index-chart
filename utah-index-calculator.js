/**
 * Utah resident index chart calculator
 * Looks up index score from the table and shows eligible scholarship.
 */
(function () {
    var form = document.getElementById('index-calc-form');
    var scoreInput = document.getElementById('index-calc-score');
    var gpaInput = document.getElementById('index-calc-gpa');
    var resultEl = document.getElementById('index-calc-result');
    var scoreHint = document.getElementById('index-calc-score-hint');
    var table = document.querySelector('.index-chart-table');
    var scholarships = [
        { min: 128, name: 'Presidential Scholarship', annual: '100% tuition & fees', total: '~$26,000', band: 'band-moench' },
        { min: 122, name: 'Trustees Scholarship', annual: '$3,500', total: '$14,000', band: 'band-dixon' },
        { min: 114, name: 'Deans Scholarship', annual: '$2,000', total: '$8,000', band: 'band-tracy' },
        { min: 105, name: 'Merit Scholarship', annual: '$1,500', total: '$6,000', band: 'band-miller' },
        { min: 99, name: 'Success Scholarship', annual: '$1,000', total: '$4,000', band: 'band-success' }
    ];
    var noAwardMsg = 'Your index score is below 99. You may still qualify for other aid. See <a href="https://www.weber.edu/FinancialAid/resident.html">Aid for Utah Residents New to WSU</a>.';

    if (!form || !scoreInput || !gpaInput || !resultEl) return;

    form.querySelectorAll('input[name="test-type"]').forEach(function (radio) {
        radio.addEventListener('change', function () {
            if (this.value === 'sat') {
                scoreInput.min = 400;
                scoreInput.max = 1600;
                scoreInput.placeholder = 'e.g. 1200';
                scoreHint.textContent = 'SAT 400–1600 or ACT 14–36';
            } else {
                scoreInput.min = 14;
                scoreInput.max = 36;
                scoreInput.placeholder = 'e.g. 24';
                scoreHint.textContent = 'SAT 400–1600 or ACT 14–36';
            }
            scoreInput.value = '';
        });
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var isACT = form.querySelector('input[name="test-type"]:checked').value === 'act';
        var score = parseInt(scoreInput.value, 10);
        var gpa = parseFloat(gpaInput.value);
        resultEl.hidden = true;
        resultEl.innerHTML = '';

        if (isNaN(score) || scoreInput.value.trim() === '') {
            resultEl.innerHTML = '<p class="index-calc-error">Please enter your ' + (isACT ? 'ACT' : 'SAT') + ' score.</p>';
            resultEl.hidden = false;
            return;
        }
        if (isACT && (score < 14 || score > 36)) {
            resultEl.innerHTML = '<p class="index-calc-error">Please enter an ACT score between 14 and 36.</p>';
            resultEl.hidden = false;
            return;
        }
        if (!isACT && (score < 400 || score > 1600)) {
            resultEl.innerHTML = '<p class="index-calc-error">Please enter an SAT score between 400 and 1600.</p>';
            resultEl.hidden = false;
            return;
        }
        if (isNaN(gpa) || gpaInput.value.trim() === '') {
            resultEl.innerHTML = '<p class="index-calc-error">Please enter your high school GPA (2.0 – 4.0).</p>';
            resultEl.hidden = false;
            return;
        }
        if (gpa < 2 || gpa > 4) {
            resultEl.innerHTML = '<p class="index-calc-error">Please enter a GPA between 2.0 and 4.0.</p>';
            resultEl.hidden = false;
            return;
        }

        var tbody = table && table.querySelector('tbody');
        if (!tbody || !tbody.rows.length) {
            resultEl.innerHTML = '<p class="index-calc-error">Unable to look up your score. Please use the table below.</p>';
            resultEl.hidden = false;
            return;
        }

        var rowIndex = -1;
        if (isACT) {
            for (var r = 0; r < tbody.rows.length; r++) {
                var actCell = tbody.rows[r].cells[1];
                if (actCell && parseInt(actCell.textContent.trim(), 10) === score) {
                    rowIndex = r;
                    break;
                }
            }
        } else {
            for (var r = 0; r < tbody.rows.length; r++) {
                var firstCell = tbody.rows[r].cells[0];
                var rangeText = firstCell ? firstCell.textContent.trim() : '';
                var parts = rangeText.split(/[\u2013\-–]/).map(function (s) { return parseInt(s.trim(), 10); });
                if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && score >= parts[0] && score <= parts[1]) {
                    rowIndex = r;
                    break;
                }
            }
        }

        if (rowIndex < 0) {
            resultEl.innerHTML = '<p class="index-calc-error">No matching row for your ' + (isACT ? 'ACT' : 'SAT') + ' score. Check the table below for valid ranges.</p>';
            resultEl.hidden = false;
            return;
        }

        var roundedGpa = Math.round(gpa * 10) / 10;
        roundedGpa = Math.max(2, Math.min(4, roundedGpa));
        var gpaColIndex = 2 + Math.round((4.0 - roundedGpa) * 10);
        if (gpaColIndex < 2) gpaColIndex = 2;
        if (gpaColIndex > 22) gpaColIndex = 22;

        var row = tbody.rows[rowIndex];
        var cell = row.cells[gpaColIndex];
        if (!cell) {
            resultEl.innerHTML = '<p class="index-calc-error">Unable to find index score for your GPA. Use the table below.</p>';
            resultEl.hidden = false;
            return;
        }

        var indexScore = parseInt(cell.textContent.trim(), 10);
        if (isNaN(indexScore)) {
            resultEl.innerHTML = '<p class="index-calc-error">Unable to read index score. Use the table below.</p>';
            resultEl.hidden = false;
            return;
        }

        var sch = null;
        for (var i = 0; i < scholarships.length; i++) {
            if (indexScore >= scholarships[i].min) {
                sch = scholarships[i];
                break;
            }
        }

        var resultClass = sch ? 'index-calc-result-inner ' + sch.band : 'index-calc-result-inner index-calc-no-scholarship';
        var msg = '<p class="index-calc-index-score"><strong>Your index score:</strong> ' + indexScore + '</p>';
        if (sch) {
            msg += '<p class="index-calc-scholarship">You may be eligible for: <strong>' + sch.name + '</strong> — ' + sch.annual + ' per year (up to ' + sch.total + ' over four years).</p>';
        } else {
            msg += '<p class="index-calc-scholarship">' + noAwardMsg + '</p>';
        }
        resultEl.innerHTML = '<div class="' + resultClass + '">' + msg + '</div>';
        resultEl.hidden = false;
    });
})();
