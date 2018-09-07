function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

function gen(count) {
  let out = '';
  for (let i = 0; i < count; i += 1) {
    out += s4();
  }
  return out;
}

export function randomID() {
  return `${Date.now()}-${gen(1)}`;
}

export default function GUID() {
  return `${gen(2)}-${gen(1)}-${gen(1)}-${gen(1)}-${gen(3)}`;
}
