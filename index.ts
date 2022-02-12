// operators
export function map<T, R>(mapper: (value: T) => R): Operator<T, R> {
  return function createNewObservable(
    oldObservable: Observable<T>,
  ): Observable<R> {
    return new Observable<R>((observer) => {
      const subscription = oldObservable.subscribe({
        next: (oldValue) => {
          const newValue = mapper(oldValue);
          observer.next(newValue);
        },
        complete: () => observer.complete(),
        error: (error) => observer.error(error),
      });

      return {
        unsubscribe: function () {
          subscription.unsubscribe();
        },
      };
    });
  };
}

export function filter<T>(doesPass: (value: T) => boolean): Operator<T, T> {
  return function createNewObservable(
    oldObservable: Observable<T>,
  ): Observable<T> {
    return new Observable<T>((observer) => {
      const subscription = oldObservable.subscribe({
        next: (value) => {
          if (!doesPass(value)) return;

          observer.next(value);
        },
        complete: () => observer.complete(),
        error: (error) => observer.error(error),
      });

      return {
        unsubscribe: function () {
          subscription.unsubscribe();
        },
      };
    });
  };
}

export function takeUntil<T>(shouldEnd: (value: T) => boolean): Operator<T, T> {
  return function createNewObservable(
    oldObservable: Observable<T>,
  ): Observable<T> {
    return new Observable<T>((observer) => {
      const subscription = oldObservable.subscribe({
        next: (value) => {
          if (shouldEnd(value)) {
            observer.complete();
            subscription.unsubscribe();
            return;
          }

          observer.next(value);
        },
      });

      return {
        unsubscribe: function () {
          subscription.unsubscribe();
        },
      };
    });
  };
}

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
  ) {
  }

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
  pipe() {
    let observable = this;

    for (let i = 0, len = arguments.length; i < len; i++) {
      const operator = arguments[i];
      observable = operator(observable);
    }

    return observable;
  }
}

function interval(intervalInMs: number = 0): Observable<number> {
  return new Observable((observer) => {
    let counter = 0;
    const intervalReference = setInterval(() => {
      observer.next(counter++);
    }, intervalInMs);

    return {
      unsubscribe: function clearReference() {
        clearInterval(intervalReference);
      },
    };
  });
}

const interval$ = interval();

const test$ = interval$.pipe(
  filter((num) => num % 4 == 0),
  takeUntil((num) => num > 200),
  map((num) => `Hello ${num}`),
);

const subscription = test$.subscribe({
  next: (value: any) => {
    console.log({ value });
  },
  complete: () => console.log("test$ completed"),
});
