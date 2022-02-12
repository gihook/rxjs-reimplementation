export function createOperator<T, R>(
  onNext: (
    value: T,
    observer: Observer<R>,
    subscription?: Subscription,
  ) => void,
): Operator<T, R> {
  return function createNewObservable(
    oldObservable: Observable<T>,
  ): Observable<R> {
    return new Observable<R>((observer) => {
      const subscription = oldObservable.subscribe({
        next: (value) => {
          onNext(value, observer, subscription);
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

// operators
export function map<T, R>(mapper: (value: T) => R): Operator<T, R> {
  return createOperator((value, observer) => {
    const newValue = mapper(value);
    observer.next(newValue);
  });
}

export function filter<T>(doesPass: (value: T) => boolean): Operator<T, T> {
  return createOperator((value, observer) => {
    if (!doesPass(value)) return;

    observer.next(value);
  });
}

export function take<T>(numberOfItems: number): Operator<T, T> {
  let count = 0;

  return createOperator((value, observer, subscription) => {
    if (count == numberOfItems) {
      subscription?.unsubscribe();
      observer.complete();
      return;
    }

    count++;
    observer.next(value);
  });
}

export function scan<T, R>(
  reducer: (a: T, c: R) => R,
  initialValue: R,
): Operator<T, R> {
  let currentValue = JSON.parse(JSON.stringify(initialValue)) as R;

  return createOperator((value, observer, _subscription) => {
    const newValue = reducer(value, currentValue);
    observer.next(newValue);
    currentValue = newValue;
  });
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

  pipe<A, B, C, R>(
    operator1: Operator<T, A>,
    operator2: Operator<A, B>,
    operator3: Operator<B, C>,
    operator4: Operator<C, R>,
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
  take(10),
  scan((a, c) => a + c, 0),
  map((sum) => `current sum ${sum}`),
);

const subscription = test$.subscribe({
  next: (value) => {
    console.log(value);
  },
  complete: () => console.log("test$ completed"),
});

setTimeout(() => subscription.unsubscribe(), 300);
