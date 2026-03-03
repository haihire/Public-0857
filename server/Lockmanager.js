import Lock from "./Lock.js";

const Locks = new Lock();

export function getLock() {
  return Locks;
}
