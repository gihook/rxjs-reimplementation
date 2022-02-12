import { fromArray, interval, of } from "./helpers";
import { filter, map, scan, switchMap, take } from "./operators";

const interval$ = interval(100);

const test$ = interval$.pipe(
  map((number) => number + 10),
  filter((num) => num > 30),
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
