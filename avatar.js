/**
 * avatar.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared avatar expression system for Spot the Signs.
 *
 * Exports one function: setAvatarExpression(expr)
 *
 * HOW IT WORKS
 * The question screen contains an <svg> with two <g> (group) elements:
 *   <g id="avatarFace"> — eyes, mouth, and expression details
 *   <g id="avatarArms"> — arm positions
 *
 * setAvatarExpression() replaces the innerHTML of those two groups to swap
 * between expressions without re-rendering the entire SVG.
 *
 * EXPRESSIONS
 *   'thinking'  — squiggly mouth, one arm to chin, thought dots
 *                 Used while the question is displayed and awaiting an answer.
 *   'happy'     — closed ^^ eyes, big smile, gold rosy cheeks, arms up
 *                 Used when the user answers correctly.
 *   'surprised' — wide eyes, O-shaped mouth, raised eyebrows, arms raised
 *                 Used when the user answers incorrectly.
 *                 Intentionally curious/surprised rather than sad — avoids negativity.
 *
 * AVATAR SWAP
 * When real artwork replaces the SVG stick figure, update this file only.
 * Option A (image files): replace innerHTML swaps with show/hide logic:
 *   document.getElementById('avatar-thinking').style.display = expr === 'thinking' ? 'block' : 'none';
 * Option B (animated sprite): update the class on a single <img> element.
 *
 * ADDING A NEW EXPRESSION
 * 1. Add a new key to FACE with the SVG inner HTML for the face features.
 * 2. Add a matching key to ARMS with the SVG inner HTML for the arm position.
 * 3. Call setAvatarExpression('yourNewKey') from the activity logic.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

// ── Face expression SVG templates ────────────────────────────────────────────
// Each value is the innerHTML for <g id="avatarFace">.
// Colors use CBC Hawk Blue (#002e6d) and Gold (#ffbf3b) where applicable.

const FACE = {

  thinking: `
    <circle cx="31" cy="13" r="1.8" fill="white"/>
    <circle cx="41" cy="13" r="1.8" fill="white"/>
    <circle cx="31.5" cy="13.4" r="1" fill="#0d1b2a"/>
    <circle cx="41.5" cy="13.4" r="1" fill="#0d1b2a"/>
    <!-- Squiggly uncertain mouth -->
    <path d="M31 19.5 Q33.5 18 36 19.5 Q38.5 21 41 19.5"
          stroke="white" stroke-width="1.6" stroke-linecap="round" fill="none"/>
    <!-- Floating thought dots (small → large = thinking direction) -->
    <circle cx="46" cy="10" r="1.2" fill="white" opacity="0.5"/>
    <circle cx="50" cy="7"  r="1.6" fill="white" opacity="0.65"/>
    <circle cx="55" cy="4"  r="2"   fill="white" opacity="0.8"/>`,

  happy: `
    <circle cx="31" cy="12.5" r="1.8" fill="white"/>
    <circle cx="41" cy="12.5" r="1.8" fill="white"/>
    <!-- Closed ^^ happy eyes -->
    <path d="M29.2 12.5 Q31 10.5 32.8 12.5" stroke="#0d1b2a" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    <path d="M39.2 12.5 Q41 10.5 42.8 12.5" stroke="#0d1b2a" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    <!-- Big smile -->
    <path d="M29 18 Q36 25 43 18" stroke="white" stroke-width="2.2" stroke-linecap="round" fill="none"/>
    <!-- Gold rosy cheeks -->
    <circle cx="29.5" cy="17" r="2" fill="#ffbf3b" opacity="0.5"/>
    <circle cx="42.5" cy="17" r="2" fill="#ffbf3b" opacity="0.5"/>`,

  surprised: `
    <!-- Wide open eyes with highlight dots -->
    <circle cx="31" cy="13" r="2.2" fill="white"/>
    <circle cx="41" cy="13" r="2.2" fill="white"/>
    <circle cx="31.5" cy="13.5" r="1.2" fill="#0d1b2a"/>
    <circle cx="41.5" cy="13.5" r="1.2" fill="#0d1b2a"/>
    <circle cx="31.8" cy="12.8" r="0.5" fill="white"/>
    <circle cx="41.8" cy="12.8" r="0.5" fill="white"/>
    <!-- O-shaped open mouth -->
    <ellipse cx="36" cy="20" rx="3.5" ry="2.5" fill="white"/>
    <!-- Raised eyebrows -->
    <path d="M31 9.5 Q31 7.5 33 7.5" stroke="white" stroke-width="1.3" stroke-linecap="round" fill="none"/>
    <path d="M41 9.5 Q41 7.5 39 7.5" stroke="white" stroke-width="1.3" stroke-linecap="round" fill="none"/>`

};

// ── Arm position SVG templates ────────────────────────────────────────────────
// Each value is the innerHTML for <g id="avatarArms">.
// Keys must match FACE keys exactly.

const ARMS = {

  // One arm down (relaxed), one bent up toward chin (thinking pose)
  thinking: `
    <line x1="36" y1="34" x2="20" y2="42" stroke="#002e6d" stroke-width="3" stroke-linecap="round"/>
    <line x1="36" y1="30" x2="48" y2="22" stroke="#002e6d" stroke-width="3" stroke-linecap="round"/>
    <line x1="48" y1="22" x2="44" y2="19" stroke="#002e6d" stroke-width="2.5" stroke-linecap="round"/>`,

  // Both arms raised out and up (celebratory / welcoming)
  happy: `
    <line x1="36" y1="33" x2="16" y2="24" stroke="#002e6d" stroke-width="3" stroke-linecap="round"/>
    <line x1="36" y1="33" x2="56" y2="24" stroke="#002e6d" stroke-width="3" stroke-linecap="round"/>`,

  // Both arms raised with hands up (surprised / "whoa!" — not defensive)
  surprised: `
    <line x1="36" y1="34" x2="18" y2="28" stroke="#002e6d" stroke-width="3" stroke-linecap="round"/>
    <line x1="36" y1="34" x2="54" y2="28" stroke="#002e6d" stroke-width="3" stroke-linecap="round"/>
    <line x1="18" y1="28" x2="14" y2="22" stroke="#002e6d" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="54" y1="28" x2="58" y2="22" stroke="#002e6d" stroke-width="2.5" stroke-linecap="round"/>`

};

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Swaps the avatar's facial expression and arm position.
 *
 * Looks for <g id="avatarFace"> and <g id="avatarArms"> in the DOM and
 * replaces their innerHTML with the templates above. If an unrecognised
 * expression key is passed, falls back to 'thinking' silently.
 *
 * @param {'thinking'|'happy'|'surprised'} expr - The expression to display.
 */
function setAvatarExpression(expr) {
  const faceEl = document.getElementById('avatarFace');
  const armsEl = document.getElementById('avatarArms');

  if (faceEl) faceEl.innerHTML = FACE[expr] || FACE.thinking;
  if (armsEl) armsEl.innerHTML = ARMS[expr] || ARMS.thinking;
}
