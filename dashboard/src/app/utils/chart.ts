function componentToHex(c: number) {
  const hex = c.toString(16);
  return hex.length == 1 ? '0' + hex : hex;
}

function rgbToHex(r: number, g: number, b: number) {
  return (
    '#' +
    componentToHex(Math.round(r)) +
    componentToHex(Math.round(g)) +
    componentToHex(Math.round(b))
  );
}

function hexToRgb(hex: string) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : {
        r: 255,
        g: 255,
        b: 255,
      };
}

export function getShadesOfColor(
  color: string | undefined,
  numbeOfShades: number
) {
  const shades: string[] = [];
  const rgb = hexToRgb(color ?? '#fff');
  const max = Math.max(Math.max(rgb.r, Math.max(rgb.g, rgb.b)), 1);
  const step = 255 / (max * numbeOfShades);

  for (let i = 1; i <= numbeOfShades; i++) {
    shades.push(rgbToHex(rgb.r * step * i, rgb.g * step * i, rgb.b * step * i));
  }

  return shades;
}
