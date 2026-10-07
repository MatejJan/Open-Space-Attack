# AGENTS.md

## Project overview

Open Space Attack is a small browser arcade game inspired by the Arcadia 2001 game Space Attack. The game is built with plain HTML and JavaScript, uses Three.js for rendering, and presents low-resolution pixel art scaled to the browser window.

The repository is currently at an early stage. Treat `design/gamedesign.md` and the reference screenshots in `design/` as the product and visual source of truth. Do not introduce a framework, package manager, bundler, or backend unless the user explicitly requests one.

## Repository layout

- `index.html`: application entry point; load project and library scripts with script tags.
- `classes/`: game classes, with one JavaScript file per class.
- `content/`: game sprites and other runtime assets. Placeholder sprites are acceptable until final art is supplied.
- `libraries/`: downloaded third-party browser libraries, including Three.js.
- `design/gamedesign.md`: gameplay rules and technical requirements.
- `design/*.png`: visual references from the original game.

## Required behavior

- Provide a title/start screen, active gameplay, game-over screen, and restart flow.
- Support keyboard movement and firing and show the controls on screen.
- Display score and three player lives/launchers.
- Arrange enemies in six rows based on the title-screen reference, including its row colors.
- Move the formation horizontally without making it descend.
- Select diving enemies from the outer remaining ships. At most two enemies may dive simultaneously.
- Make diving enemies travel diagonally, bounce from side edges, fire at the player, and return to their formation position if they survive.
- Spawn a full new formation after a wave is cleared. Increase only enemy missile speed between levels unless the design document is updated.
- Award an extra life for every 5,000 points and preserve the high score on screen.
- Follow the scoring rules in `design/gamedesign.md` for formation and diving enemies.

## Rendering constraints

- Render gameplay at a logical resolution of 128 × 208 pixels using a Three.js render target.
- Scale the result by the largest integer factor that fits the available canvas area and use nearest-neighbor filtering. Display horizontal pixels at twice the vertical scale.
- Keep sprite positions on integer pixel coordinates. Avoid antialiasing, smoothing, fractional transforms, and other effects that blur pixel art.
- Reserve a small bar below the canvas for instructions; keep the game itself in the canvas.
- Preserve the sparse, high-contrast look and formation layout shown in the reference screenshots.

## Code conventions

- Use object-oriented JavaScript and keep each class in its own file under `classes/`.
- Use classic browser scripts loaded by `index.html` unless the project is deliberately migrated to modules.
- Keep game state, rendering, input, collision handling, and audio responsibilities clearly separated.
- Prefer named constants for dimensions, speeds, scores, timing values, and level scaling.
- Base movement and firing on elapsed time so gameplay is consistent across display refresh rates.
- Keep collision bounds explicit and aligned with the visible pixel-art sprites.
- Avoid adding dependencies when a small, clear local implementation is sufficient.
- Keep third-party code in `libraries/`; do not edit vendored library files.

## Working practices

- Read `design/gamedesign.md` before changing gameplay or visual behavior.
- Preserve user-supplied art in `content/`. Add placeholders under distinct filenames so final assets can replace them cleanly.
- Update script tags in `index.html` whenever a class file is added, keeping dependency order valid.
- Do not commit editor state, generated files, or temporary artifacts.
- Keep changes focused. Do not reformat or reorganize unrelated files.

## Validation

There is currently no automated test or build command. Validate changes by serving the repository with a simple static HTTP server and testing in a browser. Check at minimum:

- start, play, game-over, and restart transitions;
- movement, firing, collisions, scoring, lives, and extra-life thresholds;
- wave reset and enemy missile speed increases;
- diving-enemy selection, two-diver limit, edge bouncing, firing, and formation return;
- integer scaling and crisp pixels at several viewport sizes;
- keyboard input after focus changes and browser resize behavior;
- absence of console errors and missing asset requests.

If a test runner, formatter, or build tool is added later, document its exact commands here.
