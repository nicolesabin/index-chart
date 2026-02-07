/**
 * WSU Financial Aid — International Student Index Chart
 * Crosshair (row/column highlight) + index/scholarship calculator.
 *
 * For standalone pages: load this script after the chart HTML (e.g. <script src="int-index-chart-embed.js"></script>).
 * For Weber CMS: host this file and add <script src=".../int-index-chart-embed.js"></script> in template,
 * or paste this file's contents into the Custom JavaScript field.
 *
 * Requires: .chart-page wrapper, .index-chart-table (with tbody), and a form with input name="score", name="gpa".
 * Creates the result div if missing. Retries init at 300ms and 800ms for late-loaded CMS content.
 */
(function () {
    function init() {
        var chartPage = document.querySelector('.chart-page');
        if (!chartPage) return false;
        var wrap = chartPage.querySelector('#int-index-chart') || chartPage.querySelector('.index-chart-wrap');
        var table = wrap ? wrap.querySelector('.index-chart-table') : chartPage.querySelector('.index-chart-table');
        var form = chartPage.querySelector('#index-calc-form') || chartPage.querySelector('.index-calculator form') || (function () {
            var forms = chartPage.querySelectorAll('form');
            for (var f = 0; f < forms.length; f++) {
                if (forms[f].querySelector('input[name="score"]') && forms[f].querySelector('input[name="gpa"]')) return forms[f];
            }
            return null;
        })();
        var scoreInput = (form && form.querySelector('input[name="score"]')) || chartPage.querySelector('#index-calc-score');
        var gpaInput = (form && form.querySelector('input[name="gpa"]')) || chartPage.querySelector('#index-calc-gpa');
        var resultEl = chartPage.querySelector('#index-calc-result') || chartPage.querySelector('.index-calc-result');
        if (!resultEl && form) {
            resultEl = document.createElement('div');
            resultEl.className = 'index-calc-result';
            resultEl.setAttribute('aria-live', 'polite');
            resultEl.setAttribute('aria-atomic', 'true');
            resultEl.hidden = true;
            form.parentNode.insertBefore(resultEl, form.nextSibling);
        }
        var scoreHint = chartPage.querySelector('#index-calc-score-hint') || (form && form.querySelector('.index-calc-hint'));
        var scholarships = [
            { min: 116, name: 'Louis F. Moench Scholarship', annual: '$8,000', total: '$32,000', band: 'band-moench' },
            { min: 105, name: 'H. Aldous Dixon Scholarship', annual: '$6,000', total: '$24,000', band: 'band-dixon' },
            { min: 97, name: 'Aaron W. Tracy Scholarship', annual: '$5,000', total: '$20,000', band: 'band-tracy' },
            { min: 90, name: 'William P. Miller Scholarship', annual: '$4,000', total: '$16,000', band: 'band-miller' }
        ];
        function bandClass(n) {
            if (n >= 116) return 'band-moench';
            if (n >= 105) return 'band-dixon';
            if (n >= 97) return 'band-tracy';
            if (n >= 90) return 'band-miller';
            return 'band-below';
        }
        if (wrap && table) {
            var tbody = table.querySelector('tbody');
            if (tbody) {
                for (var ri = 0; ri < tbody.rows.length; ri++) {
                    var cells = tbody.rows[ri].querySelectorAll('td');
                    for (var ci = 0; ci < cells.length; ci++) {
                        if (ci === 0) continue;
                        var num = parseInt(cells[ci].textContent.trim(), 10);
                        if (!isNaN(num)) cells[ci].classList.add(bandClass(num));
                    }
                }
                function highlightCell(ev) {
                    var cell = ev.target.closest('td, th');
                    if (!cell || !table.contains(cell)) return;
                    var tr = cell.closest('tr');
                    var rowIndex = Array.prototype.indexOf.call(tbody.rows, tr) + 1;
                    wrap.setAttribute('data-hover-col', String(cell.cellIndex + 1));
                    wrap.setAttribute('data-hover-row', String(rowIndex));
                }
                function clearHighlight() {
                    wrap.removeAttribute('data-hover-col');
                    wrap.removeAttribute('data-hover-row');
                }
                table.addEventListener('mouseenter', highlightCell, true);
                table.addEventListener('mouseleave', clearHighlight);
            }
        }
        if (!form || !scoreInput || !gpaInput || !resultEl) return true;
        if (scoreHint && form.querySelectorAll('input[name="test-type"]').length) {
            form.querySelectorAll('input[name="test-type"]').forEach(function (radio) {
                radio.addEventListener('change', function () {
                    if (this.value === 'sat') {
                        scoreInput.min = 400;
                        scoreInput.max = 1600;
                        scoreInput.placeholder = 'e.g. 1200';
                        if (scoreHint) scoreHint.textContent = 'SAT 400\u20131600 or ACT 14\u201336';
                    } else {
                        scoreInput.min = 14;
                        scoreInput.max = 36;
                        scoreInput.placeholder = 'e.g. 24';
                        if (scoreHint) scoreHint.textContent = 'SAT 400\u20131600 or ACT 14\u201336';
                    }
                    scoreInput.value = '';
                });
            });
        }
        function doCalculate() {
            var isACT = (form.querySelector('input[name="test-type"]:checked') || {}).value === 'act';
            var score = parseInt(scoreInput.value, 10);
            var gpa = parseFloat(gpaInput.value);
            resultEl.hidden = true;
            resultEl.innerHTML = '';
            if (!resultEl) return;
            if (isNaN(score) || !scoreInput.value.trim()) {
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
            if (isNaN(gpa) || !gpaInput.value.trim()) {
                resultEl.innerHTML = '<p class="index-calc-error">Please enter your high school GPA (2.0 \u2013 4.0).</p>';
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
                msg += '<p class="index-calc-scholarship">You may be eligible for: <strong>' + sch.name + '</strong> \u2014 ' + sch.annual + ' per year (up to ' + sch.total + ' over four years).</p>';
            } else {
                msg += '<p class="index-calc-scholarship">Your index score is below 90. You may still qualify for other aid. See <a href="https://www.weber.edu/FinancialAid/international.html">WSU Aid for International Students</a>.</p>';
            }
            resultEl.innerHTML = '<div class="' + resultClass + '">' + msg + '</div>';
            resultEl.hidden = false;
        }
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            e.stopPropagation();
            doCalculate();
            return false;
        });
        var btn = form.querySelector('button[type="submit"]') || form.querySelector('input[type="submit"]') || (function () {
            var b = form.querySelector('button');
            if (b && /calculate|scholarship/i.test(b.textContent || b.innerText || '')) return b;
            return null;
        })();
        if (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                doCalculate();
                return false;
            });
        }
        return true;
    }
    function run() {
        if (init()) return;
        setTimeout(function () {
            if (init()) return;
            setTimeout(init, 800);
        }, 300);
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }
})();
