import assert from "node:assert/strict"
import test from "node:test"

import { cn } from "./utils"

test("cn merges class names and removes duplicates", () => {
  assert.equal(cn("px-2", "px-4"), "px-4")
})

test("cn keeps truthy conditional classes", () => {
  const output = cn("base", { hidden: false, visible: true }).split(" ")

  assert.ok(output.includes("base"))
  assert.ok(output.includes("visible"))
  assert.ok(!output.includes("hidden"))
})

test("cn resolves class arrays", () => {
  const output = cn(["mt-2", "text-lg"], ["mt-4"]).split(" ")

  assert.ok(output.includes("text-lg"))
  assert.ok(output.includes("mt-4"))
  assert.ok(!output.includes("mt-2"))
})
