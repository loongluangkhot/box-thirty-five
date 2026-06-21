/* Module-level handle to the live YouTube ambience player.
   App.jsx's <Ambience> publishes it after onReady; consumers (e.g. the
   wishes-page bobbleheads) call getMusicPlayer() to read currentTime
   so visuals can phase-lock to the music. */
let player = null;

export function setMusicPlayer(p) { player = p; }
export function getMusicPlayer() { return player; }
