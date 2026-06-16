// Load content from the JSON file

"use strict";

// Location of content.json
const CONTENT_URL = "data/content.json";

// Limit questions per run
const MAX_QUESTIONS = 10;

// Load one activity from content.json
async function loadContent(activityType) {
  //Prevent browser using old JSON cache
  const response = await fetch(CONTENT_URL + "?v=" + Date.now());

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}: ${response.statusText}. ` +
        `Is ${CONTENT_URL} present alongside this HTML file?`,
    );
  }

  const data = await response.json();

  // find requested activity
  const activityData = data.activities.find(
    (a) => a.activity_type === activityType,
  );

  if (!activityData) {
    throw new Error(
      `No activity with type "${activityType}" found in content.json. ` +
        `Valid types: ${data.activities.map((a) => a.activity_type).join(", ")}`,
    );
  }

  // Shared resource list
  const resources = data.resources || [];

  // Sort then randomize questions
  const sortedQuestions = [...activityData.questions].sort(
    (a, b) => a.question_order - b.question_order,
  );

  const questions = shuffleArray(sortedQuestions).slice(0, MAX_QUESTIONS);

  return { activityData, questions, resources };
}

// Shuffle array without changing original
function shuffleArray(arr) {
  const a = [...arr];

  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }

  return a;
}

// Build resource list on results screen
function buildResourcesList(resources) {
  const container = document.getElementById("resourcesList");
  if (!container) return;

  container.innerHTML = "";

  resources.forEach((r) => {
    const div = document.createElement("div");
    div.className = "resource-item";

    // Make phone numbers clickable
    let phoneHtml = "";

    if (r.resource_phone) {
      const linked = r.resource_phone.replace(
        /\d+-\d+-\d+(?:-\d+)?/g,
        (match) => `<a href="tel:${match.replace(/-/g, "")}">${match}</a>`,
      );

      phoneHtml = `<div class="resource-phone">${linked}</div>`;
    }

    const urlHtml = r.resource_url
      ? `<div class="resource-url"><a href="${r.resource_url}" target="_blank" rel="noopener">${r.resource_url}</a></div>`
      : '<div class="resource-url">Visit your local office for in-person support</div>';

    div.innerHTML = `
            <div class="resource-name">${r.resource_name}</div>
            ${phoneHtml}
            ${urlHtml}
        `;

    container.appendChild(div);
  });
}
