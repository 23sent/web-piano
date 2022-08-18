export function getNoteColor(midiNumber = 0) {
  const colors = [
    '#fd7f6f',
    '#7eb0d5',
    '#b2e061',
    '#bd7ebe',
    '#ffb55a',
    '#ffee65',
    '#beb9db',
    '#fdcce5',
    '#8bd3c7',
    '#ede15b',
    '#bdcf32',
    '#87bc45',
  ];
  const index = midiNumber % colors.length;
  // const index = Math.floor(Math.random() * colors.length);
  return colors[index];
}
