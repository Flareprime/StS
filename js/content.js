/**
 * content.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared content loading for Spot the Signs.
 *
 * Fetches content.json and returns the data a calling module needs.
 * Each activity module passes its own activity_type so this one function
 * works for myth_fact, scenario, warning_signs, and any future types.
 *
 * USAGE
 *   const { questions, resources } = await loadContent('myth_fact');
 *
 * The caller is responsible for handling the returned data and showing
 * the appropriate screen. This file handles only the fetch and parse step.
 *
 * ERROR HANDLING
 * loadContent() throws on any failure (network error, bad HTTP status,
 * invalid JSON, or missing activity type). The caller should wrap the
 * call in try/catch and display the error screen with the error message.
 *
 * DEPENDENCIES
 * Expects content.json to be in the data/ subdirectory, alongside the HTML
 * file that loads this script (e.g. /data/content.json). If the directory
 * structure changes, update CONTENT_URL below.
 *
 * NOTE ON fetch() AND LOCAL FILES
 * fetch() requires a web server — it does not work when opening HTML
 * files directly from the file system (file:// protocol). Always test
 * using a local server (e.g. python -m http.server 8000) or the live
 * GitHub Pages URL.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

/**
 * Path to the JSON content file, relative to the HTML file loading this script.
 * Update this if you move content.json to a different location.
 */
const CONTENT_URL = 'data/content.json';

/**
 * Maximum number of questions/scenarios shown per playthrough, even if
 * content.json contains more. Keeps activities short for booth use.
 */
const MAX_QUESTIONS = 10;

/**
 * Fetches content.json and extracts the data for a specific activity type.
 *
 * Questions are sorted by question_order (ascending), shuffled using the
 * Fisher-Yates algorithm so repeat visitors at kiosk events see a different
 * order each time, then capped at MAX_QUESTIONS. The question_order field
 * in content.json still defines the canonical sequence and can be used to
 * restore a fixed order if needed in the future.
 *
 * @param {string} activityType - The activity_type value to look for in the
 *   activities array. Must match exactly: 'myth_fact' | 'scenario' |
 *   'warning_signs' | 'resource'. See content.json for valid values.
 *
 * @returns {Promise<{ activityData: object, questions: object[], resources: object[] }>}
 *   - activityData: the full activity object from content.json
 *   - questions:    the sorted and shuffled questions array
 *   - resources:    the resources array (same for all activity types)
 *
 * @throws {Error} If the fetch fails, the JSON is invalid, or no activity
 *   matching activityType is found in content.json.
 */
async function loadContent(activityType) {

  // Fetch the file. fetch() resolves even on 404 — check response.ok manually.
const response = await fetch(CONTENT_URL + '?v=' + Date.now());  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}: ${response.statusText}. ` +
      `Is ${CONTENT_URL} present alongside this HTML file?`
    );
  }

  const data = await response.json();

  // Find the activity that matches the requested type.
  // Using find() means the first match wins — only one activity per type
  // is expected in the current data model.
  const activityData = data.activities.find(a => a.activity_type === activityType);
  if (!activityData) {
    throw new Error(
      `No activity with type "${activityType}" found in content.json. ` +
      `Valid types: ${data.activities.map(a => a.activity_type).join(', ')}`
    );
  }

  const resources = data.resources || [];

  // Sort by question_order to establish the canonical sequence,
  // then shuffle so each session is randomized.
  const sortedQuestions = [...activityData.questions]
    .sort((a, b) => a.question_order - b.question_order);

  // Cap the number of questions per playthrough, even if content.json
  // contains more than MAX_QUESTIONS.
  const questions = shuffleArray(sortedQuestions).slice(0, MAX_QUESTIONS);

  return { activityData, questions, resources };
}

/**
 * Fisher-Yates shuffle. Returns a new shuffled copy of the array — does not
 * mutate the input. Iterates from the end, swapping each element with a
 * randomly chosen element at or before its position, so every permutation
 * is equally likely.
 *
 * Exported separately (in addition to being used inside loadContent) so
 * activity modules can re-shuffle a "Play Again" round locally without
 * re-fetching content.json:
 *
 *   const sorted = [...activityData.questions].sort((a, b) => a.question_order - b.question_order);
 *   questions = shuffleArray(sorted).slice(0, MAX_QUESTIONS);
 *
 * @param {Array} arr - The array to shuffle.
 * @returns {Array} A new shuffled array.
 */
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Builds the resources list on the completion screen from the resources array
 * returned by loadContent().
 *
 * Clears and rebuilds the #resourcesList element each time it is called.
 * resource_phone and resource_url may be null in content.json — those lines
 * are simply omitted from the rendered output.
 *
 * Phone numbers in standard hyphenated format (e.g. "1-888-373-7888") are
 * rendered as tap-to-call (tel:) links. Short codes (e.g. "Text HOME to
 * 741741") are left as plain text since tel: links don't work for those.
 * resource_url values are rendered as links that open in a new tab.
 *
 * @param {object[]} resources - The resources array from loadContent().
 */
function buildResourcesList(resources) {
  const container = document.getElementById('resourcesList');
  if (!container) return;

  container.innerHTML = '';

  resources.forEach(r => {
    const div = document.createElement('div');
    div.className = 'resource-item';

    // Turn phone numbers like "1-888-373-7888" into tap-to-call links.
    // Short codes (e.g. "Text HOME to 741741") are left as plain text.
    let phoneHtml = '';
    if (r.resource_phone) {
      const linked = r.resource_phone.replace(
        /\d+-\d+-\d+(?:-\d+)?/g,
        match => `<a href="tel:${match.replace(/-/g, '')}">${match}</a>`
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
