import { describe, it, expect } from "vitest"

import {
  encryptPayload,
  decryptPayload,
  wrapDEK,
  unwrapDEK
} from "../index"

describe("Envelope Encryption", () => {

  const sample = { amount: 100, currency: "AED" }

  it("encrypt → decrypt works", () => {
    const enc = encryptPayload(sample)

    const wrapped = wrapDEK(enc.dek)

    const unwrapped = unwrapDEK(
      wrapped.dek_wrapped,
      wrapped.dek_wrap_nonce,
      wrapped.dek_wrap_tag
    )

    const dec = decryptPayload(
      enc.payload_ct,
      enc.payload_nonce,
      enc.payload_tag,
      unwrapped
    )

    expect(dec).toEqual(sample)
  })

  it("tampered ciphertext fails", () => {
    const enc = encryptPayload(sample)
    const wrapped = wrapDEK(enc.dek)

    const unwrapped = unwrapDEK(
      wrapped.dek_wrapped,
      wrapped.dek_wrap_nonce,
      wrapped.dek_wrap_tag
    )

    const badCt = enc.payload_ct.slice(0, -1) + "a"

    expect(() =>
      decryptPayload(
        badCt,
        enc.payload_nonce,
        enc.payload_tag,
        unwrapped
      )
    ).toThrow()
  })

  it("tampered tag fails", () => {
    const enc = encryptPayload(sample)

    const badTag = enc.payload_tag.slice(0, -1) + "a"

    expect(() =>
      decryptPayload(
        enc.payload_ct,
        enc.payload_nonce,
        badTag,
        enc.dek
      )
    ).toThrow()
  })

  it("wrong nonce length fails", () => {
    const enc = encryptPayload(sample)

    expect(() =>
      decryptPayload(
        enc.payload_ct,
        "abcd",
        enc.payload_tag,
        enc.dek
      )
    ).toThrow()
  })

  it("invalid hex fails", () => {
    const enc = encryptPayload(sample)

    expect(() =>
      decryptPayload(
        "zzzz",
        enc.payload_nonce,
        enc.payload_tag,
        enc.dek
      )
    ).toThrow()
  })

})
