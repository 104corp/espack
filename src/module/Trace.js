export default class Trace {
  log(msg) {
    this.msg = msg;
    console.log(this.msg);
  }
}

export function sum(a, b) {
  return a + b;
}
