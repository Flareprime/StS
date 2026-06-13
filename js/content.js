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
 * Expects content.json to be in the same directory as the HTML file
 * that loads this script. If the directory structure changes, update
 * CONTENT_URL below.
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
 * Update this if you move content.json to a subdirectory.
 */
const CONTENT_URL = 'content.json';

/**
 * Fetches content.json and extracts the data for a specific activity type.
 *
 * Questions are sorted by question_order (ascending) and then shuffled
 * using the Fisher-Yates algorithm so repeat visitors at kiosk events
 * see a different order each time. The question_order field in content.json
 * still defines the canonical sequence and can be used to restore a fixed
 * order if needed in the future.
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
  const response = await fetch(CONTENT_URL);
  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}: ${response.statusText}. ` +
      `Is content.json in the same folder as this HTML file?`
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
  const questions = [...activityData.questions]
    .sort((a, b) => a.question_order - b.question_order);

  // Fisher-Yates shuffle: iterates from the end, swapping each element
  // with a randomly chosen element at or before its position.
  // Result: every permutation is equally likely.
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }

  return { activityData, questions, resources };
}

/**
 * Builds the resources list on the completion screen from the resources array
 * returned by loadContent().
 *
 * Clears and rebuilds the #resourcesList element each time it is called.
 * resource_phone and resource_url may be null in content.json — those lines
 * are simply omitted from the rendered output.
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
    div.innerHTML = `
      <div class="resource-name">${r.resource_name}</div>
      ${r.resource_phone
        ? `<div class="resource-phone">${r.resource_phone}</div>`
        : ''}
      ${r.resource_url
        ? `<div class="resource-url">${r.resource_url}</div>`
        : '<div class="resource-url">Visit your local office for in-person support</div>'}
    `;
    container.appendChild(div);
  });
}
