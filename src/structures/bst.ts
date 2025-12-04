export class NodoBST<T> {
  constructor(
    public key: number,
    public dato: T,
    public left: NodoBST<T> | null = null,
    public right: NodoBST<T> | null = null
  ) { }
}

export class ArbolBST<T> {
  public root: NodoBST<T> | null = null;

  insertar(key: number, dato: T): void {
    this.root = this._insert(this.root, key, dato);
  }

  private _insert(node: NodoBST<T> | null, key: number, dato: T): NodoBST<T> {
    if (!node) return new NodoBST(key, dato);
    if (key <= node.key) {
      node.left = this._insert(node.left, key, dato);
    } else {
      node.right = this._insert(node.right, key, dato);
    }
    return node;
  }

  inorder(): T[] {
    const result: T[] = [];
    this._inorder(this.root, result);
    return result;
  }

  private _inorder(node: NodoBST<T> | null, result: T[]): void {
    if (node) {
      this._inorder(node.left, result);
      result.push(node.dato);
      this._inorder(node.right, result);
    }
  }
} type HistoryBST = ArbolBST<CollisionHistoryItem>;
