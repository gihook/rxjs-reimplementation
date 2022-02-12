export interface Observer<T> {
  next(value: T): void;
  complete(): void;
  error(error: any): void;
}

export interface Subscription {
  unsubscribe: () => void;
}

export declare type SubscribeCallback<T> = (value: T) => void;

export declare type Operator<T, R> = (
  oldObservable: Observable<T>,
) => Observable<R>;

export class Observable<T> {
  constructor(
    private subscribeFunction: (observer: Observer<T>) => Subscription,
  ) {}

  subscribe(observer: Partial<Observer<T>>): Subscription {
    return this.subscribeFunction({
      next: observer.next || ((_value: T) => {}),
      complete: observer.complete || (() => {}),
      error: observer.error || ((_error: any) => {}),
    });
  }

  pipe(): Observable<T>;
  pipe<R>(operator: Operator<T, R>): Observable<R>;
  pipe<A, R>(
    operator1: Operator<T, A>,
    operator2: Operator<A, R>,
  ): Observable<R>;
  pipe<A, B, R>(
    operator1: Operator<T, A>,
    operator2: Operator<A, B>,
    operator3: Operator<B, R>,
  ): Observable<R>;

  pipe<A, B, C, R>(
    operator1: Operator<T, A>,
    operator2: Operator<A, B>,
    operator3: Operator<B, C>,
    operator4: Operator<C, R>,
  ): Observable<R>;

  pipe<A, B, C, D, R>(
    operator1: Operator<T, A>,
    operator2: Operator<A, B>,
    operator3: Operator<B, C>,
    operator4: Operator<C, D>,
    operator5: Operator<D, R>,
  ): Observable<R>;
  pipe() {
    let observable = this;

    for (let i = 0, len = arguments.length; i < len; i++) {
      const operator = arguments[i];
      observable = operator(observable);
    }

    return observable;
  }
}
