import { fromArray, interval, of } from "./helpers";
import { filter, map, scan, switchMap, take, tap } from "./operators";
import { BehaviourSubject, Subject } from "./rxjs";

const interval$ = interval(500);

const test$ = interval$.pipe(
  tap((tapNumber) => console.log({ tapNumber })),
  map((number) => number + 10),
  filter((num) => num > 12),
  take(10),
  scan((a, c) => a + c, 0),
  switchMap((value) => {
    if (value % 2 !== 0) return of(4);

    return fromArray([1, 2, 3, value]);
  }),
);

test$.subscribe({
  next: (value) => {
    console.log({ emitted: value });
  },
  complete: () => console.log("test$ completed"),
});

const testSubject$ = new Subject<number>();

const subscription = testSubject$.subscribe({
  next: (num) => console.log({ num }),
});

testSubject$.next(1);
testSubject$.next(2);

subscription.unsubscribe();

testSubject$.next(3);

const testBehaviourSubject$ = new BehaviourSubject(123);

testBehaviourSubject$.subscribe({
  next: (value) => console.log({ behaviourSubject: value }),
});

testBehaviourSubject$.next(4556);
