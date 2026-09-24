import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import React from "react";
import { SessionProvider } from "next-auth/react";
import { renderHook, act, cleanup } from "@testing-library/react";
import { useCartSession } from "../src/components/cart/use-cart-session.ts";
import { CartProvider, useCart } from "../src/components/cart/cart-provider.tsx";

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost:3000"
});
globalThis.BroadcastChannel = undefined;
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.React = React;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const originalFetch = globalThis.fetch;
afterEach(() => {
  cleanup();
  window.localStorage.clear();
  globalThis.fetch = originalFetch;
});
const wrapper = ({ children }) =>
  React.createElement(SessionProvider, { session: null, refetchOnWindowFocus: false }, children);
const customer = { user: { id: "customer-1", name: "Test" }, expires: "2099-01-01" };

test("stale unauthenticated provider accepts fresh authenticated cookie session", async () => {
  globalThis.fetch = async () => Response.json(customer);
  const { result } = renderHook(() => useCartSession(), { wrapper });
  let authenticated;
  await act(async () => {
    authenticated = await result.current.requireSession();
  });
  assert.equal(authenticated, true);
  assert.equal(result.current.error, null);
});
test("signed-out session requests login", async () => {
  globalThis.fetch = async () => Response.json(null);
  const { result } = renderHook(() => useCartSession(), { wrapper });
  let authenticated;
  await act(async () => {
    authenticated = await result.current.requireSession();
  });
  assert.equal(authenticated, false);
});
test("session network failure does not redirect or add an item", async () => {
  globalThis.fetch = async () => {
    throw new Error("offline");
  };
  const { result } = renderHook(() => useCartSession(), { wrapper });
  let authenticated;
  await act(async () => {
    authenticated = await result.current.requireSession();
  });
  assert.equal(authenticated, null);
  assert.match(result.current.error, /try again/);
});
test("cart hydration does not erase existing items, including StrictMode", () => {
  const items = [{ productId: "glass", name: "Glass", slug: "glass", price: 499, quantity: 2 }];
  window.localStorage.setItem("kanchkart-cart", JSON.stringify(items));
  const { result } = renderHook(() => useCart(), {
    wrapper: ({ children }) =>
      React.createElement(React.StrictMode, null, React.createElement(CartProvider, null, children))
  });
  assert.equal(result.current.count, 2);
  assert.deepEqual(JSON.parse(window.localStorage.getItem("kanchkart-cart")), items);
});
