class Node {
  key: string;
  value: any;
  next: Node | null;
  prev: Node | null;

  constructor(key: string, value: any) {
    this.key = key;
    this.value = value;
    this.next = null;
    this.prev = null;
  }
}
class LRUCache {
  private cache: Map<string, Node>;
  private head: Node | null;
  private tail: Node | null;
  private size: number;
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.cache = new Map();
    this.head = null;
    this.tail = null;
    this.size = 0;
    this.maxSize = maxSize;
  }

  #addNode(node: Node) {
    if (!this.head || !this.tail) {
      this.head = node;
      this.tail = node;
    } else {
      this.head.next = node;
      node.prev = this.head;
      this.head = node;
    }
    this.size++;
  }

  #removeNode(node: Node) {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.tail = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.head = node.prev;
    }

    this.size--;
  }

  #moveNodeToHead(node: Node) {
    if (node === this.head) return;
    this.#removeNode(node);
    this.#addNode(node);
  }

  #evictLRUNode() {
    const node = this.tail;
    if (node) {
      this.#removeNode(node);
      this.cache.delete(node.key);
    }
  }

  has(key: string) {
    return this.cache.has(key);
  }

  get(key: string) {
    const node = this.cache.get(key);
    if (node) {
      this.#moveNodeToHead(node);
      return node.value;
    }
    return null;
  }

  add(key: string, value: any) {
    const newNode = new Node(key, value);
    this.#addNode(newNode);
    this.cache.set(key, newNode);
    if (this.size > this.maxSize) {
      this.#evictLRUNode();
    }
  }
}

const memoizeLRU = <T extends (...args: any[]) => any>(
  fn: T,
  maxSize: number = 1000
): T => {
  const cache = new LRUCache(maxSize);

  const stringifyWithUndefined = (args: any[]): string => {
    return args
      .map((arg) => (arg === undefined ? "__undefined__" : JSON.stringify(arg)))
      .join("|");
  };

  return function (this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = stringifyWithUndefined(args);
    if (cache.has(key)) {
      const result = cache.get(key);
      return result as ReturnType<T>;
    }

    const result = fn.apply(this, args);
    cache.add(key, result);
    return result;
  } as T;
};

export default memoizeLRU;
