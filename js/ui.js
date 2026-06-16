//UI helper functions

"use strict";

//show one screen and hide the others
function showScreen(id) {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));

  document.getElementById(id).classList.add("active");

  // Go back to top of page
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Update progress bar
function updateProgress(fraction) {
  const el = document.getElementById("progressFill");

  if (el) {
    el.style.width = fraction * 100 + "%";
  }
}

// update score
function refreshScorePill(score, total) {
  const pillScore = document.getElementById("pillScore");
  const pillTotal = document.getElementById("pillTotal");

  if (pillScore) pillScore.textContent = score;
  if (pillTotal) pillTotal.textContent = total;
}

// Show or hide score
function showScorePill(visible) {
  const el = document.getElementById("scorePill");
  if (el) {
    el.classList.toggle("visible", visible);
  }
}

// Show or hide back button
function showBackBtn(visible) {
  const el = document.getElementById("btnBack");

  if (el) {
    el.classList.toggle("hidden", !visible);
  }
}
