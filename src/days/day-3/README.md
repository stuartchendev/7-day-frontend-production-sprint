# Day 3 — Ecommerce Cart Demo

Day 3 is a local, single-page ecommerce-cart demo at `/day-3`. It demonstrates
clear state ownership for a small cart and checkout interaction; it has no
backend, API calls, persistence, payment integration, or routing within the
checkout flow.

## Ownership and component boundaries

`DayThreePage` owns the two pieces of state for the demo:

- `cartItems` is the canonical cart state. Each line keeps a fixed product and
  its quantity.
- `checkoutViewState` controls the page flow: `idle`, `review`, or `success`.
  It is intentionally separate from the cart, so an empty cart does not imply a
  successful payment.

The fixed three-product fixture also lives in `DayThreePage.tsx`. Child
components are presentational and receive data plus callbacks:

- `ProductList` renders the fixture, and `ProductCard` emits a product ID.
- `CartPanel` renders the current cart and passes mutation callbacks to
  `CartItem`.
- `CartSummary` derives the item count and subtotal from `cartItems`; it does
  not store either value.
- `CheckoutView` derives review line totals and total from the same `cartItems`.
- `PaymentSuccess` only renders the completed local-demo state and emits the
  Continue Shopping intent.

Keeping these components co-located is deliberate: this is a small one-page
demo, and the page-level data flow remains easy to follow without introducing a
second abstraction or duplicated state.

## Demo flow

1. In `idle`, select one of the three products. A product can be added once;
   its card then shows `Added ✓` and its Add button is disabled.
2. `cartItems` is updated immutably. Cart controls increment a quantity, or
   decrement it; when quantity is one, the decrement action becomes Remove and
   removes that line.
3. The cart summary derives the total item count and subtotal, then offers
   Checkout when the cart is non-empty.
4. Checkout moves the page to `review`: the product list is replaced by the
   order review while `CartPanel` stays visible. Cart mutation controls are
   disabled, but the panel still renders the same canonical cart data.
5. Cancel returns to `idle` without changing the cart. Accept clears
   `cartItems` and moves to `success`.
6. Continue Shopping returns from `success` to `idle`; the cart remains empty
   because the accepted order already cleared it.

## Styling

`day-three.css` is imported directly by `DayThreePage.tsx`. Day 3 styles are
kept there rather than added to the legacy global `src/app/app.css`.

The product grid uses flex cards so different description lengths do not move
the price and action out of alignment. The Added state uses a muted success
treatment, Remove is styled as a restrained destructive action, and cart
controls are muted while checkout review locks mutations.

## Routes and test coverage

`src/days/sprintDays.ts` registers Day 3 in the shared day registry. The
registry drives both its Sprint Index card and the `/day-3` route through the
app's route factory.

There is currently no Day 3-specific test file. The existing
`src/app/routes.test.tsx` verifies the general route-factory behaviour, but it
does not exercise the Day 3 cart or checkout interactions. Any future Day 3
tests should cover the immutable cart updates and the `idle → review → success`
transitions without duplicating implementation details.

## Verification commands

```bash
npm test
npm run typecheck
npm run lint
npm run build
```
