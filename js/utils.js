// https://gist.github.com/gre/1650294?permalink_comment_id=3139302#gistcomment-3139302
export function cubicBezier(x1, y1, x2, y2, time) {

  // Inspired by Don Lancaster's two articles
  // http://www.tinaja.com/glib/cubemath.pdf
  // http://www.tinaja.com/text/bezmath.html

  // Set start and end point
  var x0 = 0,
    y0 = 0,
    x3 = 1,
    y3 = 1,

    // Convert the coordinates to equation space
    A = x3 - 3*x2 + 3*x1 - x0,
    B = 3*x2 - 6*x1 + 3*x0,
    C = 3*x1 - 3*x0,
    D = x0,
    E = y3 - 3*y2 + 3*y1 - y0,
    F = 3*y2 - 6*y1 + 3*y0,
    G = 3*y1 - 3*y0,
    H = y0,

    // Variables for the loop below
    t = time,
    iterations = 5,
    i, slope, x, y;

  // Loop through a few times to get a more accurate time value, according to the Newton-Raphson method
  // http://en.wikipedia.org/wiki/Newton's_method
  for (i = 0; i < iterations; i++) {

    // The curve's x equation for the current time value
    x = A* t*t*t + B*t*t + C*t + D;

    // The slope we want is the inverse of the derivate of x
    slope = 1 / (3*A*t*t + 2*B*t + C);

    // Get the next estimated time value, which will be more accurate than the one before
    t -= (x - time) * slope;
    t = t > 1 ? 1 : (t < 0 ? 0 : t);
  }

  // Find the y value through the curve's y equation, with the now more accurate time value
  y = Math.abs(E*t*t*t + F*t*t + G*t * H);

  return y;
}
