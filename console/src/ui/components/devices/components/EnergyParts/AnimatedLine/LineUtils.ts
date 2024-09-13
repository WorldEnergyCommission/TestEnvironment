export type Point = {
  x: number;
  y: number;
};

export type Size = {
  width: number;
  height: number;
};

export const calculatePoints = (
  point1: Point,
  point2: Point,
  flipped: boolean,
  isMobileView: boolean,
  arePointsInOneLine?: boolean,
): Point[] => {
  const path = [];
  const start = flipped ? point2 : point1;
  const end = flipped ? point1 : point2;

  const coeficient = arePointsInOneLine ? 15 : 5;

  // distance from start to end, scaled down by coeficient
  const dy = (end.y - start.y) / coeficient;
  const dx = (end.x - start.x) / coeficient;

  // offset for avoiding overlaping based on the distance - plus/minus 20px
  const offsetY = dy > 0 ? Math.min(20, dy) : Math.max(-20, dy);
  const offsetX = dx > 0 ? Math.min(20, dx) : Math.max(-20, dx);

  if (arePointsInOneLine) {
    // offset should be inverse proportion to the distance, no offset if the distance is very small (near zero)
    let offset = Math.abs(dx) > 1 ? (1 / Math.abs(offsetX)) * (coeficient * 10) : 0;
    offset = end.y > start.y ? offset : offset * -1;

    path.push({ x: start.x + offsetX, y: start.y + offset });
    path.push({ x: end.x, y: start.y + offset });
  } else {
    // first line
    path.push({ x: start.x + offsetX, y: start.y + offsetY });

    const offset = isMobileView ? 5 : 2;
    // calculation for the break point
    const pathX = start.x + (end.x - start.x) / 2 + offsetX / offset;
    const pathY = start.y + (end.y - start.y) / 2 + offsetY / offset;

    // threshold decides whether the first line should be vertical or horizontal
    const threshold = isMobileView ? 40 : 100;

    // 2 lines to break points - first horizontally, then vertically, or vice versa
    if (start.x - threshold < end.x && start.x + threshold > end.x) {
      path.push({ x: start.x + offsetX, y: pathY });
      path.push({ x: end.x, y: pathY });
    } else {
      path.push({ x: pathX, y: start.y + offsetY });
      path.push({ x: pathX, y: end.y });
    }
  }

  // path to the end
  path.push({ x: end.x, y: end.y });

  return path;
};

export const getPathForMovingObject = (points: Point[], flipped: boolean): string => {
  const flippedPoints = flipped ? points.reverse() : points;
  let path = `M${flippedPoints[0].x},${flippedPoints[0].y}`;
  flippedPoints.slice(1).forEach((point) => {
    path = path + ` L${point.x},${point.y} M${point.x},${point.y}`;
  });

  return path + "z";
};
