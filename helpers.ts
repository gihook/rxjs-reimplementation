import { Observable } from "./rxjs";

export function fromArray<T>(items: T[]): Observable<T> {
  return new Observable<T>((observer) => {
    for (let i = 0, len = items.length; i < len; i++) {
      observer.next(items[i]);
    }

    observer.complete();

    return {
      unsubscribe: function () {},
    };
  });
}

export function of<T>(item: T): Observable<T> {
  let hasUnsubscribed = false;

  return new Observable<T>((observer) => {
    if (!hasUnsubscribed) {
      observer.next(item);
    }

    return {
      unsubscribe: function unsubscribe() {
        hasUnsubscribed = true;
      },
    };
  });
}

export function interval(intervalInMs: number = 0): Observable<number> {
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
