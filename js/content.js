// content.js
//
// Shared content loading for Spot the Signs.
//
// Fetches content.json and hands back the data a calling module needs.
// Every activity module (myth-vs-fact, safe-or-sus, scenarios) calls
// loadContent() with its own activity_type, so this one file covers
// all of them - and any future activity types too.
//
// USAGE
//   const { questions, resources } = await loadContent('myth_fact');
//
// The caller is responsible for handling the returned data and showing
// the right screen. This file only does the fetch + parse step.
//
// ERROR HANDLING
// loadContent() throws on any failure: network error, bad HTTP status,
// invalid JSON, or an activity_type that doesn't exist in content.json.
// Callers should wrap it in try/catch and show their error screen with
// err.message.
//
// FILE LOCATION
// Expects content.json to live in a data/ folder next to the HTML file
// that loads this script (e.g. /data/content.json). If you move it,
// update CONTENT_URL below - that's the only place the path is set.
//
// NOTE ON fetch() AND LOCAL FILES
// fetch() needs a real web server. It will NOT work if you open the
// HTML file directly from disk (file:// in the address bar) - the
// browser blocks that for security reasons. Use a local server (e.g.
// `python -m http.server 8000`) or the live GitHub Pages URL.

'use strict';

// Where content.json lives, relative to the HTML file using this script.
const CONTENT_URL = 'data/content.json';

// Cap on how many questions/scenarios show up per playthrough, even if
// content.json has more than this. Keeps things short for booth visitors.
const MAX_QUESTIONS = 10;

// Fetches content.json and pulls out everything needed for one activity.
//
// Questions are sorted by question_order (low to high) first, so
// content.json stays human-readable and easy to reorder. Then they're
// shuffled with shuffleArray() so repeat visitors at the booth see a
// different order each time, and finally capped at MAX_QUESTIONS.
//
// activityType - which activity_type to look for in content.json's
// "activities" array. Must be one of: 'myth_fact' | 'scenario' |
// 'safe_or_sus'. (See content.json for the exact list currently used.)
//
// Returns a promise that resolves to:
//   activityData - the full activity object from content.json (title,
//                   description, full question list, etc.)
//   questions    - the sorted, shuffled, and capped questions array
//                   that this playthrough should use
//   resources    - the top-level "resources" array (hotlines/orgs),
//                   same for every activity type
//
// Throws if the fetch fails, the JSON is invalid, or no activity in
// content.json matches activityType.
async function loadContent(activityType)
{
    // fetch() resolves even on a 404 - response.ok has to be checked
    // by hand, it won't throw on its own.
    // The "?v=" + Date.now() on the end is a cache-buster so browsers
    // (and GitHub Pages) don't serve a stale copy of content.json
    // after we edit it.
    const response = await fetch(CONTENT_URL + '?v=' + Date.now());

    if (!response.ok)
    {
        throw new Error(
            `HTTP ${response.status}: ${response.statusText}. ` +
            `Is ${CONTENT_URL} present alongside this HTML file?`
        );
    }

    const data = await response.json();

    // find() returns the first match - we only expect one activity per
    // activity_type in content.json right now.
    const activityData = data.activities.find(a => a.activity_type === activityType);

    if (!activityData)
    {
        throw new Error(
            `No activity with type "${activityType}" found in content.json. ` +
            `Valid types: ${data.activities.map(a => a.activity_type).join(', ')}`
        );
    }

    // resources is shared across all activities, so just default to an
    // empty array if it's missing rather than throwing.
    const resources = data.resources || [];

    // Sort first (this defines the "canonical" order an editor sees in
    // content.json), then shuffle for the actual playthrough.
    const sortedQuestions = [...activityData.questions]
        .sort((a, b) => a.question_order - b.question_order);

    const questions = shuffleArray(sortedQuestions).slice(0, MAX_QUESTIONS);

    return { activityData, questions, resources };
}

// Fisher-Yates shuffle.
//
// Returns a NEW shuffled array - the input array is not changed. Walks
// backwards from the end, swapping each element with a random element
// at or before its own position, so every ordering is equally likely.
//
// This is also exported on its own (not just used inside loadContent)
// so an activity's "Play Again" button can re-shuffle without
// re-fetching content.json:
//
//   const sorted = [...activityData.questions]
//     .sort((a, b) => a.question_order - b.question_order);
//   questions = shuffleArray(sorted).slice(0, MAX_QUESTIONS);
//
// arr - the array to shuffle.
// Returns a new shuffled array (same items, new order).
function shuffleArray(arr)
{
    const a = [...arr];

    for (let i = a.length - 1; i > 0; i--)
    {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }

    return a;
}

// Builds the "hotlines & resources" list shown on every activity's
// completion screen (and on the Get Help & Learn More page).
//
// Clears out #resourcesList and rebuilds it from scratch each time
// it's called, so it's safe to call this more than once (e.g. on
// "Play Again").
//
// Fields per resource (see content.json):
//   resource_name  - always shown.
//   resource_phone - optional (can be null). If present, any
//                    XXX-XXX-XXXX / X-XXX-XXX-XXXX style number inside
//                    it becomes a tap-to-call tel: link. Short codes
//                    like "Text HOME to 741741" don't match that
//                    pattern, so they're left as plain text - tel:
//                    links don't make sense for those anyway.
//   resource_url   - optional (can be null). If present, shown as a
//                    link that opens in a new tab. If null, we show a
//                    generic "visit your local office" line instead.
//
// resources - the resources array from loadContent() (or read
// straight from content.json on the resources page).
function buildResourcesList(resources)
{
    const container = document.getElementById('resourcesList');
    if (!container) return;

    container.innerHTML = '';

    resources.forEach(r =>
    {
        const div = document.createElement('div');
        div.className = 'resource-item';

        // Turn things like "1-888-373-7888" into <a href="tel:...">
        // links. The regex looks for digit groups separated by hyphens
        // (2 or 3 groups), which matches normal phone numbers but not
        // 6-digit short codes like "741741".
        let phoneHtml = '';

        if (r.resource_phone)
        {
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
