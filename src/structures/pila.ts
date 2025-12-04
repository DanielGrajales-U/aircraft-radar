export class Pila<T> {
  private items: T[];

  constructor() {
    this.items = [];
  }

  push(dato: T): void {
    this.items.push(dato);
  }

  pop(): T | string {
    if (this.estaVacia()) {
      return "Underflow: La pila está vacía";
    }
    // El tipo 'T' está garantizado si no está vacía
    return this.items.pop() as T;
  }

  top(): T | null {
    if (this.estaVacia()) {
      return null;
    }
    return this.items[this.items.length - 1];
  }

  estaVacia(): boolean {
    return this.items.length === 0;
  }

  tamano(): number {
    return this.items.length;
  }

  toString(): string {
    return `Pila: [${this.items.join(", ")}]`;
  }
}
