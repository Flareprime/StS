// ui.js
//
// Shared UI helper functions for Spot the Signs.
//
// Small set of functions used by every activity module to switch
// screens, move the progress bar, and show/hide the score pill and
// back button. None of these functions hold any state of their own -
// they just read/write the DOM each time they're called.
//
// EXPECTED ELEMENTS
// The HTML that loads this script should have these elements (the IDs
// must match exactly):
//   #progressFill - the inner, colored part of the progress bar
//   #scorePill    - the score badge shown in the header
//   #pillScore    - the "current score" number inside #scorePill
//   #pillTotal    - the "out of total" number inside #scorePill
//   #btnBack      - the back/home button in the header (optional)
//
// Not every page uses every element (e.g. resources.html has no score
// pill). Each function checks the element exists before touching it,
// so a missing element is just silently skipped - no errors.

'use strict';

// Shows one screen and hides all the others.
//
// Every element with class "screen" loses the "active" class, then the
// one matching id gets "active" added back. Also scrolls the page back
// to the top, so when the user moves to a new screen they start reading
// from the header instead of wherever they happened to be scrolled to.
//
// id - the id of the .screen element to show (e.g. "screenQuestion").
function showScreen(id)
{
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Updates the progress bar's width.
//
// fraction - a number from 0.0 (empty) to 1.0 (full).
//   - Pass 0 when an activity starts.
//   - Pass currentIndex / totalQuestions while answering questions.
//   - Pass 1 on the completion screen.
function updateProgress(fraction)
{
    const el = document.getElementById('progressFill');
    if (el) el.style.width = (fraction * 100) + '%';
}

// Updates the numbers shown in the score pill (e.g. "3 / 10").
//
// score - how many questions the user has answered correctly so far.
// total - total number of questions in this playthrough.
function refreshScorePill(score, total)
{
    const pillScore = document.getElementById('pillScore');
    const pillTotal = document.getElementById('pillTotal');

    if (pillScore) pillScore.textContent = score;
    if (pillTotal) pillTotal.textContent = total;
}

// Shows or hides the score pill in the header.
//
// The pill is hidden on the intro and completion screens, and shown
// during the question flow so the user can watch their score update
// live.
//
// visible - true to show the pill, false to hide it.
function showScorePill(visible)
{
    const el = document.getElementById('scorePill');
    if (el) el.classList.toggle('visible', visible);
}

// Shows or hides the back/home button in the header.
//
// Uses the "hidden" class with visibility:hidden rather than
// display:none, so the button keeps its space in the layout - that
// way the centered title doesn't jump sideways when the button
// disappears.
//
// visible - true to show the button, false to hide it.
function showBackBtn(visible)
{
    const el = document.getElementById('btnBack');
    if (el) el.classList.toggle('hidden', !visible);
}
