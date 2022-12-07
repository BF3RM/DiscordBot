export type Constructor<T> = new (...args: any[]) => T;

export interface EsModule<T> {
  default: Constructor<T>;
}
