function uniq<T>(xs: Array<T>): Array<T> {
  return [...Array.from(new Set(xs))];
}

function intersectionBy<T>(
  xs: Array<T>,
  ys: Array<T>,
  f: (x: T, y: T) => boolean
) {
  return xs.some(x => ys.some(y => f(x, y)));
}

export { uniq, intersectionBy };
