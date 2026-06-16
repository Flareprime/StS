/* avatar.js
Shared avatar expression system 
Exports one function: setAvatarExpression(expr)

question screen has an <svg> with two <g> (group) elements:
   <g id="avatarFace">  - eyes, mouth, and other face details
   <g id="avatarArms">  - arm positions

 setAvatarExpression() swaps the innerHTML of those two groups so we
can change the avatar's expression without re-rendering the whole SVG.

expresions
thinking  - squiggly mouth, one arm up near the chin, thought dots
           floating off to the side. Shown while a question is on
           screen and waiting for an answer.
happy     - closed ^^ eyes, big smile, gold rosy cheeks, both arms up.
           Shown when the user answers correctly.
surprised - wide eyes, O-shaped mouth, raised eyebrows, both arms up.
             Shown when the user answers incorrectly. This is meant to
             read as curious/surprised, NOT sad - we don't want the
             avatar to look disappointed in the user.

 SWAPPING IN REAL ARTWORK
 When the SVG stick figure gets replaced with real avatar art, this is
 the only file that should need to change.
*/
"use strict";

// Face SVG for each expression
// Each value becomes the innerHTML of <g id="avatarFace">.
// Colors: CBC Hawk Blue (#002e6d) and Gold (#ffbf3b).
const FACE = {
  /*Eyes: small white dots with dark pupils.
   Mouth: squiggly "wavy" line - reads as unsure/considering.
   Extra: a few floating dots above the head, like thought bubbles,
   getting bigger further away (a common "thinking" visual shorthand) */
  thinking: `
    <circle cx="31" cy="13" r="1.8" fill="white"/>
    <circle cx="41" cy="13" r="1.8" fill="white"/>
    <circle cx="31.5" cy="13.4" r="1" fill="#0d1b2a"/>
    <circle cx="41.5" cy="13.4" r="1" fill="#0d1b2a"/>
    <path d="M31 19.5 Q33.5 18 36 19.5 Q38.5 21 41 19.5"
          stroke="white" stroke-width="1.6" stroke-linecap="round" fill="none"/>
    <circle cx="46" cy="10" r="1.2" fill="white" opacity="0.5"/>
    <circle cx="50" cy="7"  r="1.6" fill="white" opacity="0.65"/>
    <circle cx="55" cy="4"  r="2"   fill="white" opacity="0.8"/>`,

  /* Eyes: closed, drawn as little upward ^^ arcs - a "happy squint".
     Mouth: big open smile.
     gold circles on the cheeks for a rosy/blushing look
   */
  happy: `
    <circle cx="31" cy="12.5" r="1.8" fill="white"/>
    <circle cx="41" cy="12.5" r="1.8" fill="white"/>
    <path d="M29.2 12.5 Q31 10.5 32.8 12.5" stroke="#0d1b2a" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    <path d="M39.2 12.5 Q41 10.5 42.8 12.5" stroke="#0d1b2a" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    <path d="M29 18 Q36 25 43 18" stroke="white" stroke-width="2.2" stroke-linecap="round" fill="none"/>
    <circle cx="29.5" cy="17" r="2" fill="#ffbf3b" opacity="0.5"/>
    <circle cx="42.5" cy="17" r="2" fill="#ffbf3b" opacity="0.5"/>`,

  /* Eyes: wide circles with a small white highlight dot - "wide eyed"
     Mouth: open oval, like an "oh!"
    Extra: short raised eyebrow lines above each eye
  */
  surprised: `
    <circle cx="31" cy="13" r="2.2" fill="white"/>
    <circle cx="41" cy="13" r="2.2" fill="white"/>
    <circle cx="31.5" cy="13.5" r="1.2" fill="#0d1b2a"/>
    <circle cx="41.5" cy="13.5" r="1.2" fill="#0d1b2a"/>
    <circle cx="31.8" cy="12.8" r="0.5" fill="white"/>
    <circle cx="41.8" cy="12.8" r="0.5" fill="white"/>
    <ellipse cx="36" cy="20" rx="3.5" ry="2.5" fill="white"/>
    <path d="M31 9.5 Q31 7.5 33 7.5" stroke="white" stroke-width="1.3" stroke-linecap="round" fill="none"/>
    <path d="M41 9.5 Q41 7.5 39 7.5" stroke="white" stroke-width="1.3" stroke-linecap="round" fill="none"/>`,
};

/* Arm SVG for each expression.
   Each value becomes the innerHTML of <g id="avatarArms">.
   Keys here MUST match the keys in FACE exactly - setAvatarExpression()
   looks up both objects using the same expr string.
 */
const ARMS = {
  // One arm relaxed at the side,  other bent up toward the chin -
  // "thinking" pose.
  thinking: `
    <line x1="36" y1="34" x2="20" y2="42" stroke="#002e6d" stroke-width="3" stroke-linecap="round"/>
    <line x1="36" y1="30" x2="48" y2="22" stroke="#002e6d" stroke-width="3" stroke-linecap="round"/>
    <line x1="48" y1="22" x2="44" y2="19" stroke="#002e6d" stroke-width="2.5" stroke-linecap="round"/>`,

  // Both arms raised out and up - celebratory/welcoming.
  happy: `
    <line x1="36" y1="33" x2="16" y2="24" stroke="#002e6d" stroke-width="3" stroke-linecap="round"/>
    <line x1="36" y1="33" x2="56" y2="24" stroke="#002e6d" stroke-width="3" stroke-linecap="round"/>`,

  // Both arms up with hands raised higher , "whoa!" gesture.
  surprised: `
    <line x1="36" y1="34" x2="18" y2="28" stroke="#002e6d" stroke-width="3" stroke-linecap="round"/>
    <line x1="36" y1="34" x2="54" y2="28" stroke="#002e6d" stroke-width="3" stroke-linecap="round"/>
    <line x1="18" y1="28" x2="14" y2="22" stroke="#002e6d" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="54" y1="28" x2="58" y2="22" stroke="#002e6d" stroke-width="2.5" stroke-linecap="round"/>`,
};

/* Swaps the avatar's facial expression and arm position.
Looks for <g id="avatarFace"> and <g id="avatarArms"> in the page and
replaces their innerHTML with the matching templates above.

If expr doesn't match a known key, this quietly falls back to
'thinking' instead of throwing - a typo here shouldn't crash the activity.
*/
// expr - one of 'thinking', 'happy', or 'surprised'.
function setAvatarExpression(expr) {
  const faceEl = document.getElementById("avatarFace");
  const armsEl = document.getElementById("avatarArms");

  if (faceEl) faceEl.innerHTML = FACE[expr] || FACE.thinking;
  if (armsEl) armsEl.innerHTML = ARMS[expr] || ARMS.thinking;
}
