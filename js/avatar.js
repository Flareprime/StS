// avatar.js
// Shared avatar expression system for the detective penguin.
// Exports one function: setAvatarExpression(expr)
//
// HOW IT WORKS
// The question screen has a single <img id="avatarImg">. Instead of
// redrawing SVG faces and arms like the old stick figure did, we just
// swap that image's src to a different penguin PNG.
//
// The function name and the expression names ('thinking', 'happy',
// 'surprised') are the SAME as the old SVG version on purpose. That
// way none of the quiz logic in the module pages has to change - they
// keep calling setAvatarExpression() exactly like before.
//
// EXPRESSIONS
// thinking  - penguin with question marks. Shown while a question is on
//             screen and waiting for an answer.
// happy     - waving, eyes closed, sparkles. Shown on a correct answer.
// surprised - holding a red flag with a sweat drop. Shown on a wrong
//             answer. Meant to read as "ooh, red flag!" - concerned and
//             curious, NOT disappointed in the user.
// main      - neutral pose with magnifying glass. For intro screens.
// excite    - "!!" with magnifying glass. For a strong finish.
//
// SWAPPING IN NEW ARTWORK
// When the hand-drawn penguins arrive, just overwrite the PNG files in
// images/ using the same file names. No code changes needed here.

"use strict";

// Where all the penguin images live, relative to the HTML pages.
const AVATAR_PATH = "images/";

// Maps each expression name to its PNG file.
// Keys are what the module pages pass into setAvatarExpression().
const AVATAR_IMAGES =
{
  thinking: "SdetPen_question.png",
  happy: "SdetPen_happy.png",
  surprised: "SdetPen_sad.png",
  main: "SdetPen_main.png",
  excite: "SdetPen_excite.png",
};

// Preload every penguin as soon as this script runs.
// Without this, the first time an expression is shown the browser has to
// go download it, and the avatar can flicker or vanish for a moment on a
// slow booth wifi connection. Preloading puts them all in the cache up
// front so swaps are instant.
for (const file of Object.values(AVATAR_IMAGES))
{
  const img = new Image();
  img.src = AVATAR_PATH + file;
}

// Swaps the penguin to the requested expression.
// Looks for <img id="avatarImg"> on the page and changes its src.
//
// If expr doesn't match a known key, this quietly falls back to
// 'thinking' instead of throwing - a typo shouldn't crash the activity.
// If the page has no avatarImg (like a page with only a static penguin),
// it just does nothing.
//
// expr - one of 'thinking', 'happy', 'surprised', 'main', or 'excite'.
function setAvatarExpression(expr)
{
  const avatarEl = document.getElementById("avatarImg");

  // No dynamic avatar on this page, nothing to do.
  if (!avatarEl)
  {
    return;
  }

  // Unknown expression? Fall back to the thinking penguin.
  const file = AVATAR_IMAGES[expr] || AVATAR_IMAGES.thinking;
  avatarEl.src = AVATAR_PATH + file;
}