/** JS mirror of the motion tokens in styles/tokens.css. Keep in sync. */
export const duration = {
  instant: 0.09,
  fast: 0.16,
  base: 0.28,
  slow: 0.52,
  cinematic: 1.1,
} as const;

export const ease = {
  outExpo: [0.16, 1, 0.3, 1] as const,
  inOutQuart: [0.76, 0, 0.24, 1] as const,
  standard: [0.2, 0, 0, 1] as const,
  /** GSAP string equivalents */
  gsapOutExpo: "expo.out",
  gsapInOut: "power3.inOut",
};

/**
 * Damping half-lives (seconds) for maath `easing.damp*` in the 3D scene.
 * Smaller = snappier. Scroll-driven state uses a slightly heavier damp than
 * pointer response so camera moves feel weighted rather than glued to the wheel.
 */
export const damp = {
  scroll: 0.28,
  pointer: 0.18,
  drag: 0.12,
  /** Below this delta the scene is considered settled and stops rendering. */
  epsilon: 0.0005,
} as const;
