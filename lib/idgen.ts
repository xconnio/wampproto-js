const ID_MAX = Math.pow(2, 32);
const MAX_SCOPE = Math.pow(2, 53);

export function generateSessionID(): number {
  return Math.floor(Math.random() * ID_MAX);
}

export class SessionScopeIDGenerator {
  private id: number = 0;

  next(): number {
    if (this.id === MAX_SCOPE) {
      this.id = 0;
    }

    return ++this.id;
  }
}
