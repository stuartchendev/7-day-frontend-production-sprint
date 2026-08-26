import { useState } from 'react'
import { Link } from 'react-router-dom'
import './day-three.css'

type Product = {
  id: string
  name: string
  description: string
  price: number
}

type CartLineItem = {
  product: Product
  quantity: number
}

type ProductListProps = {
  products: Product[]
  onAdd: (productId: string) => void
  addedProductIds: Set<string>;
}

type ProductCardProps = {
  product: Product
  onAdd: (productId: string) => void
  isAdded: boolean
}

type CartPanelProps = {
  cartItems: CartLineItem[]
  onIncrement: (productId: string) => void
  onDecrement: (productId: string) => void
  onCheckout: () => void
  isLocked: boolean
}

type CartItemProps = {
  item: CartLineItem
  onIncrement: (productId: string) => void
  onDecrement: (productId: string) => void
  isLocked: boolean
}

type CartSummaryProps = {
  cartItems: CartLineItem[]
  onCheckout: () => void
}

type CheckoutViewProps = {
  cartItems: CartLineItem[]
  onCancel: () => void
  onAccept: () => void
}

type PaymentSuccessProps = {
  onContinueShopping: () => void
}

type CheckoutViewState = 'idle' | 'review' | 'success'

const products: Product[] = [
  {
    id: 'canvas-tote',
    name: 'Canvas tote',
    description: 'A sturdy everyday carry with a quiet, simple form.',
    price: 28,
  },
  {
    id: 'field-notebook',
    name: 'Field notebook',
    description: 'A small grid notebook for sketches, lists, and loose ideas.',
    price: 12,
  },
  {
    id: 'desk-cup',
    name: 'Desk cup',
    description: 'A hand-finished cup made for a slower start to the day.',
    price: 24,
  },
]

function ProductCard({ product, onAdd, isAdded }: ProductCardProps) {
  return (
    <article className="product-card" data-added={isAdded || undefined}>
      <div className="product-card__content">
        <h3>{product.name}</h3>
        <p>{product.description}</p>
      </div>
      <p className="product-card__price">${product.price}</p>
      <button
        className="product-card__action"
        type="button"
        onClick={() => onAdd(product.id)}
        disabled={isAdded}
      >
        {isAdded ? 'Added ✓' : 'Add to cart'}
      </button>
    </article>
  )
}

function ProductList({ products, onAdd, addedProductIds }: ProductListProps) {
  return (
    <section className="product-list" aria-labelledby="products-title">
      <div className="product-list__heading">
        <p className="day-three__eyebrow">Products</p>
        <h2 id="products-title">Pick something useful</h2>
      </div>
      <div className="product-list__grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAdd={onAdd} isAdded={addedProductIds.has(product.id)} />
        ))}
      </div>
    </section>
  )
}

function CartItem({
  item,
  onIncrement,
  onDecrement,
  isLocked,
}: CartItemProps) {
  const { product, quantity } = item

  return (
    <li>
      <span>{product.name}</span>
      <span>${product.price}</span>
      <div className="cart-item__quantity">
        <span>Quantity</span>
        <div className="cart-item__quantity-controls">
          <button
            className={quantity === 1 ? 'cart-item__remove' : undefined}
            type="button"
            aria-label={
              quantity === 1
                ? `Remove ${product.name} from cart`
                : `Decrease ${product.name} quantity`
            }
            onClick={() => onDecrement(product.id)}
            disabled={isLocked}
          >
            {quantity === 1 ? 'Remove' : '−'}
          </button>
          <span aria-label={`${product.name} quantity`}>{quantity}</span>
          <button
            type="button"
            aria-label={`Increase ${product.name} quantity`}
            onClick={() => onIncrement(product.id)}
            disabled={isLocked}
          >
            +
          </button>
        </div>
      </div>
    </li>
  )
}

function CartSummary({ cartItems, onCheckout }: CartSummaryProps) {
  const itemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  )
  const subtotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  )

  return (
    <section className="cart-summary" aria-label="Cart summary">
      <dl>
        <div>
          <dt>Items</dt>
          <dd>{itemCount}</dd>
        </div>
        <div>
          <dt>Subtotal</dt>
          <dd>${subtotal.toFixed(2)}</dd>
        </div>
      </dl>
      <button type="button" onClick={onCheckout}>
        Checkout
      </button>
    </section>
  )
}

function CheckoutView({ cartItems, onCancel, onAccept }: CheckoutViewProps) {
  const subtotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  )

  return (
    <section className="checkout-view" aria-labelledby="checkout-title">
      <p className="day-three__eyebrow">Checkout review</p>
      <h2 id="checkout-title">Review your order</h2>
      <ul className="checkout-view__items">
        {cartItems.map((item) => {
          const lineTotal = item.product.price * item.quantity

          return (
            <li key={item.product.id}>
              <div>
                <strong>{item.product.name}</strong>
                <span>
                  {item.quantity} × ${item.product.price}
                </span>
              </div>
              <strong>${lineTotal.toFixed(2)}</strong>
            </li>
          )
        })}
      </ul>
      <dl className="checkout-view__total">
        <div>
          <dt>Subtotal</dt>
          <dd>${subtotal.toFixed(2)}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd>${subtotal.toFixed(2)}</dd>
        </div>
      </dl>
      <div className="checkout-view__actions">
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" onClick={onAccept}>
          Accept
        </button>
      </div>
    </section>
  )
}

function PaymentSuccess({ onContinueShopping }: PaymentSuccessProps) {
  return (
    <section className="payment-success" aria-labelledby="payment-success-title">
      <p className="day-three__eyebrow">Payment success</p>
      <h2 id="payment-success-title">Your demo order is confirmed.</h2>
      <p>
        Payment was accepted locally. No real charge or order was created.
      </p>
      <button type="button" onClick={onContinueShopping}>
        Continue Shopping
      </button>
    </section>
  )
}

function CartPanel({
  cartItems,
  onIncrement,
  onDecrement,
  onCheckout,
  isLocked,
}: CartPanelProps) {
  return (
    <aside
      className="cart-panel"
      aria-labelledby="cart-title"
      data-locked={isLocked || undefined}
    >
      <p className="day-three__eyebrow">Current cart</p>
      <h2 id="cart-title">Your items</h2>
      {cartItems.length === 0 ? (
        <p className="cart-panel__empty">Your cart is ready when you are.</p>
      ) : (
        <>
          <ul>
            {cartItems.map((item) => (
              <CartItem
                key={item.product.id}
                item={item}
                onIncrement={onIncrement}
                onDecrement={onDecrement}
                isLocked={isLocked}
              />
            ))}
          </ul>
          <CartSummary cartItems={cartItems} onCheckout={onCheckout} />
        </>
      )}
    </aside>
  )
}

export function DayThreePage() {
  const [cartItems, setCartItems] = useState<CartLineItem[]>([])
  const [checkoutViewState, setCheckoutViewState] =
    useState<CheckoutViewState>('idle')

  const addedProductIds = new Set(
    cartItems.map((item) => item.product.id),
  )

  function addProduct(productId: string) {
    const product = products.find((candidate) => candidate.id === productId)


    if (!product) {
      return
    }

    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.product.id === product.id,
      )

      if (!existingItem) {
        return [...currentItems, { product, quantity: 1 }]
      }

      return currentItems;
    })
  }

  function incrementQuantity(productId: string) {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    )
  }

  function decrementQuantity(productId: string) {
    setCartItems((currentItems) =>
      currentItems.flatMap((item) => {
        if (item.product.id !== productId) {
          return [item]
        }

        return item.quantity === 1
          ? []
          : [{ ...item, quantity: item.quantity - 1 }]
      }),
    )
  }

  function acceptOrder() {
    setCartItems([])
    setCheckoutViewState('success')
  }

  return (
    <main className="day-three">
      <Link className="day-three__back-link" to="/">
        ← Back to Sprint Home
      </Link>
      <header className="day-three__header">
        <p className="day-three__eyebrow">Day 3 · Cart state</p>
        <h1>Small shop, clear ownership</h1>
        <p>
          The page owns the cart while product and cart components receive only
          the data and callbacks they need.
        </p>
      </header>
      <div className="day-three__content">
        {checkoutViewState === 'idle' ? (
          <ProductList
            products={products}
            onAdd={addProduct}
            addedProductIds={addedProductIds}
          />
        ) : checkoutViewState === 'review' ? (
          <CheckoutView
            cartItems={cartItems}
            onCancel={() => setCheckoutViewState('idle')}
            onAccept={acceptOrder}
          />
        ) : (
          <PaymentSuccess
            onContinueShopping={() => setCheckoutViewState('idle')}
          />
        )}
        <CartPanel
          cartItems={cartItems}
          onIncrement={incrementQuantity}
          onDecrement={decrementQuantity}
          onCheckout={() => setCheckoutViewState('review')}
          isLocked={checkoutViewState === 'review'}
        />
      </div>
    </main>
  )
}
