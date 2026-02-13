export function assertLength(buf: Buffer, len: number, name: string) {
  if (buf.length !== len) {
    throw new Error(`${name} invalid length`);
  }
}

export function safeFromHex(hex: string, name: string) {
  if (!/^[0-9a-fA-F]+$/.test(hex)) {
    throw new Error(`${name} invalid hex`);
  }
  return Buffer.from(hex, "hex");
}
