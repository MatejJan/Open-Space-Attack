# Open Space Attack

## Brief

Build Space Attack, a small, polished browser arcade game where the player pilots a spaceship against waves of enemies.

It must include:
- Keyboard movement and firing, with on-screen instructions
- Enemy waves, working collisions, a visible score and player lives
- Increasing difficulty
- A start screen, game over and restart

## Original Space Attack description

Space Attack is a Space Invaders-style shooter where players control a missile launcher defending against waves of 
enemy spaceships.

The player moves their launcher left and right at the bottom of the screen, avoiding incoming rockets and enemy ships 
while shooting them down with the action button. The game presents six rows of enemy ships that move and fire, with some 
ships occasionally flying directly at the player's launcher. Players start with three lives (missile launchers), and the 
game ends when all lives are lost, though an extra life is awarded for every 5,000 points scored.

Scoring in the game varies based on the enemy ships' positions and behavior. Stationary ships in the lower rows are 
worth 30 points, while those in the top row are worth 60 points. However, ships flying towards the player's launcher 
become more valuable targets, ranging from 60 points for the bottom rows to 200 points for the top row. As waves of 
enemies are cleared, new squadrons appear to challenge the player. This game clearly draws heavy inspiration from the 
arcade classic Space Invaders, adapting the format for home console play on the Arcadia 2001 with some variations in 
enemy behavior and scoring mechanics.

## Official Space Attack description (Back of Box - Arcadia 2001 (US)

- TRY YOUR EVASIVE ACTION SKILL TO STOP THE SPACE CRAFT ROCKETING TO DESTROY YOU
- YOU HAVE THREE MISSILE LAUNCHER TO "WIPE" THEM OUT
- DIFFERENT SKILL LEVELS
- SEE THE SPACE CRAFT "PEEL OFF" AND ZERO ONTO YOUR MISSILE LAUNCHES
- ALSO YOU MUST AVOID A "RAIN" OF ROCKETS
- GREAT ACTION - COLOR - SOUND EFFECTS
- HIGH SCORE REMAINS ON SCREEN SO NEXT PLAYER CAN CHALLENGE
- DESTROY ALL THE SPACE CRAFT AND ANOTHER FASTER ARMADA APPEARS
- FUN FOR ALL THE FAMILY

## Gameplay mechanics

The title-screen.png screenshot defines the starting formation of the enemy spaceships and their colors. The formation
moves slowly left and right on top of the screen in unison and doesn't descend. Spaceships will randomly descend
towards the player, chosen from the outer (left/right side) remaining spaceships in the formation.

Two spaceships
can be gliding towards the player's missile launchers at once and they move diagonally down, bouncing off the edge of 
the screen. They shoot missiles towards the player and as soon as their existing missile has reached the bottom of the 
screen, they will shoot another one. The higher the level, the faster the enemy missiles move towards the player.
Nothing else changes between levels, just all the enemy spaceships reappear. 

If the player doesn't destroy a descending spaceship, it reappears in its spot in the formation.

The E bar at the bottom represents the enemies remaining in the current wave. Its green bar decreases as each enemy is
destroyed, leaving black space behind it rather than a red background. Player and enemy missiles are both 1 × 4 pixel
vertical lines. Player movement, enemy formation and diving movement, and all missile movement are 50 percent faster
than their original tuning. The player missile travels at 216 logical pixels per second.
The bottom-right number shows the current level without a player label. Spare launcher icons show the player's remaining
lives. Every enemy missile or diving-ship hit destroys one launcher. Only a destroyed player launcher displays the
explosion sprite; destroyed enemies disappear immediately.

## Technical specifications

Platform: Web-based (html/js)
Graphics library: three.js
Physics library: whathever appropriate
Resolution: 128 × 208 pixel art. 

The website uses a small bar at the bottom for instructions, the rest on the top is a three.js webgl canvas.
Render the game at the spec resolution to a render target and then scale with nearest neighbor with the maximum integer
scale factor so that the game still fits in the available canvas size. The horizontal scale needs to be 2x the vertical
scale (doubled flat pixels).

Have all sprites render at integer pixel coordinates.

Use OOP and create one .js file per class in the /classes folder. 
I will provide my own pixel art sprites in the /content folder after you've implemented the game (you can create placeholders).
5x7px font will be provided as well (in 6x8 boxes aligned left to right for numbers/letters, can also create a placeholder).
Include downloaded libraries in the /libraries folder.
Have the index.html include all the files via script tags.
