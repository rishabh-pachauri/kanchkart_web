import { test } from "node:test";
import assert from "node:assert/strict";
import { parseSavedCart } from "../src/lib/cart-storage";
import { safeCallbackUrl } from "../src/lib/auth-navigation";

test("preserves storefront return paths including filters", () => {
  assert.equal(safeCallbackUrl("/shop?category=jars#products"), "/shop?category=jars#products");
});
test("rejects external URLs, auth loops and privileged destinations", () => {
  for (const url of [
    "https://evil.test",
    "//evil.test",
    "/\\evil.test",
    "/login",
    "/register?callbackUrl=/login",
    "/admin/orders",
    "/api/auth/signout",
    "/shop/../login"
  ]) {
    assert.equal(safeCallbackUrl(url), "/account", url);
  }
  assert.equal(safeCallbackUrl("", "/admin"), "/admin");
});
test("saved cart survives serialization", () => {
  const items = [{ productId: "glass-1", name: "Glass", slug: "glass", price: 499, quantity: 2 }];
  assert.deepEqual(parseSavedCart(JSON.stringify(items)), items);
});
test("malformed and invalid stored carts recover without crashing", () => {
  for (const value of ["{", "null", "{}", '[{"quantity":-1}]'])
    assert.deepEqual(parseSavedCart(value), []);
});
