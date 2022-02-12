import { Observable, Observer, Operator, Subscription } from "./rxjs";

export function switchMap<T, R>(
  mapToNewObservable: (value: T) => Observable<R>,
): Operator<T, R> {
  return function createNewObservable(
    oldObservable: Observable<T>,
  ): Observable<R> {
    return new Observable<R>((observer) => {
      let newObservableSubscription: Subscription;

      const subscription = oldObservable.subscribe({
        next: (value) => {
          newObservableSubscription?.unsubscribe();
          const newObservable = mapToNewObservable(value);
          newObservableSubscription = newObservable.subscribe({
            next: function handleMapperObservable(mapperValue) {
              observer.next(mapperValue);
            },
          });
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
