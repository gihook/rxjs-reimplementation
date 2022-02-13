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
    protected subscribeFunction: (observer: Observer<T>) => Subscription,
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

  pipe<A, B, C, D, E, R>(
    operator1: Operator<T, A>,
    operator2: Operator<A, B>,
    operator3: Operator<B, C>,
    operator4: Operator<C, D>,
    operator5: Operator<D, E>,
    operator6: Operator<E, R>,
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

export class Subject<T> extends Observable<T> implements Observer<T> {
  private canEmit: boolean = true;
  protected observer!: Observer<T>;

  constructor() {
    super((observer) => {
      this.observer = observer;

      return {
        unsubscribe: () => {
          this.canEmit = false;
        },
      };
    });
  }

  next(value: T): void {
    if (!this.canEmit) return;

    this.observer.next(value);
  }

  complete(): void {
    this.canEmit = false;
    this.observer.complete();
  }

  error(error: any): void {
    this.canEmit = false;
    this.observer.error(error);
  }
}

export class BehaviourSubject<T> extends Observable<T> {
  private canEmit: boolean = true;
  protected observer!: Observer<T>;

  constructor(initialValue: T) {
    super((observer) => {
      this.observer = observer;

      observer.next(initialValue);

      return {
        unsubscribe: () => {
          this.canEmit = false;
        },
      };
    });
  }

  next(value: T): void {
    if (!this.canEmit) return;

    this.observer.next(value);
  }

  complete(): void {
    this.canEmit = false;
    this.observer.complete();
  }

  error(error: any): void {
    this.canEmit = false;
    this.observer.error(error);
  }
}
