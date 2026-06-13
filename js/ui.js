/**
 * ui.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared UI helper functions for Spot the Signs.
 *
 * Provides screen switching, progress bar updates, and score pill / back
 * button visibility controls used by all activity modules.
 *
 * DEPENDENCIES
 * Expects the following element IDs to exist in the HTML that loads this file:
 *   #progressFill   — the inner div of the progress bar
 *   #scorePill      — the score display in the header
 *   #pillScore      — the current score number inside #scorePill
 *   #pillTotal      — the total questions number inside #scorePill
 *   #btnBack        — the back/home button in the header (optional)
 *
 * Not all modules use every element. Functions check for element existence
 * before acting, so missing elements don't cause errors.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

/**
 * Shows one screen and hides all others.
 *
 * Removes the 'active' class from every element with class 'screen',
 * then adds it to the target element. Scrolls to the top of the page
 * so the user always starts reading from the header.
 *
 * @param {string} id - The id attribute of the .screen element to show.
 */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Updates the progress bar width to reflect how far through the activity
 * the user is.
 *
 * @param {number} fraction - A value between 0.0 (empty) and 1.0 (full).
 *   Pass 0 at the start of an activity, currentIndex/total during questions,
 *   and 1 on the completion screen.
 */
function updateProgress(fraction) {
  const el = document.getElementById('progressFill');
  if (el) el.style.width = (fraction * 100) + '%';
}

/**
 * Updates the score pill text in the header with the current score and
 * total number of questions.
 *
 * @param {number} score  - Number of correct answers so far.
 * @param {number} total  - Total number of questions in the activity.
 */
function refreshScorePill(score, total) {
  const pillScore = document.getElementById('pillScore');
  const pillTotal = document.getElementById('pillTotal');
  if (pillScore) pillScore.textContent = score;
  if (pillTotal) pillTotal.textContent = total;
}

/**
 * Shows or hides the score pill in the header.
 *
 * The pill is hidden on the intro and completion screens and visible
 * during the question flow so the user can track their score live.
 *
 * @param {boolean} visible - true to show, false to hide.
 */
function showScorePill(visible) {
  const el = document.getElementById('scorePill');
  if (el) el.classList.toggle('visible', visible);
}

/**
 * Shows or hides the back / home button in the header.
 *
 * Uses visibility:hidden (not display:none) so the button stays in the
 * layout and the centered title doesn't shift when it disappears.
 *
 * @param {boolean} visible - true to show, false to hide.
 */
function showBackBtn(visible) {
  const el = document.getElementById('btnBack');
  if (el) el.classList.toggle('hidden', !visible);
}
