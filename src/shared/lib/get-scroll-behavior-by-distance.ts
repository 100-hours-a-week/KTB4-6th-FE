const SMOOTH_SCROLL_MAX_VIEWPORTS = 2;

export const getScrollBehaviorByDistance = (
  distance: number,
  viewportHeight: number,
): ScrollBehavior =>
  Math.abs(distance) <= viewportHeight * SMOOTH_SCROLL_MAX_VIEWPORTS ? 'smooth' : 'auto';
