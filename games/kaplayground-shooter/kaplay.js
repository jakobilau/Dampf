// 1) Must run before anything else touches KAPLAY's API.
//
// Your `kaplay()` initializer itself is ambient (calling it bare here works
// fine) - but its RETURN VALUE, the object holding every function you
// actually use (vec2, add, loadSprite, onKeyDown, scene, go, ...), is NOT
// automatically spread onto globals in your project. That's what caused
// "loadSprite is not defined": assets.js called loadSprite(...) as a bare
// global, but it only exists on the object kaplay() returns.
//
// So: capture that object here and export it. Every other file imports it
// as `k` and destructures exactly the pieces it uses, e.g.:
//   import k from "../kaplay.js";
//   const { vec2, add } = k;

const k = kaplay();
export default k;
