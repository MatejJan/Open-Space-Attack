# Artwork

`sprites.png` is a 56×8 single-row atlas containing seven 8×8 monochrome sprites in this order:

1. top-row enemy;
2. mid-row enemy A;
3. mid-row enemy B;
4. descending top-row enemy;
5. descending mid-row enemy;
6. player launcher;
7. explosion.

The game tints the white pixels with its saturated row and player colors. Every atlas sprite is static. Diving enemies switch to the corresponding top-row or mid-row descending cell and return to their row-specific cell when they rejoin the formation.

`font.png` contains the 5×7 font in 6×8 source cells. Its glyph order is `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ`. On screen, each character occupies an 8×8 cell: the six source columns followed by two empty columns. The patterns in `classes/PixelText.js` act as a fallback while the image loads and for punctuation missing from the atlas.

Both images use nearest-neighbor filtering. Preserve transparent backgrounds and avoid partial alpha values.
