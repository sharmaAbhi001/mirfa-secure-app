import Fastify from "fastify";
import crypto from "crypto";
import cors from "@fastify/cors";
import "dotenv/config";

import { db } from "@repo/db";

import {
  encryptPayload,
  wrapDEK,
  unwrapDEK,
  decryptPayload,
} from "@repo/crypto";

const app = Fastify();

app.register(cors, { origin: true });

/* ---------------- ENCRYPT ---------------- */

app.post("/tx/encrypt", async (req, reply) => {
  const body: any = req.body;

  if (!body?.partyId || !body?.payload) {
    return reply.status(400).send({ error: "Invalid input" });
  }

  const id = crypto.randomUUID();

  const enc = encryptPayload(body.payload);
  const wrapped = wrapDEK(enc.dek);

  const record = await db.transaction.create({
    data: {
      id,
      partyId: body.partyId,
      payload_nonce: enc.payload_nonce,
      payload_ct: enc.payload_ct,
      payload_tag: enc.payload_tag,
      dek_wrap_nonce: wrapped.dek_wrap_nonce,
      dek_wrapped: wrapped.dek_wrapped,
      dek_wrap_tag: wrapped.dek_wrap_tag,
    },
  });

  return {
    id: record.id,
    partyId: record.partyId,
    createdAt: record.createdAt.toISOString(),
    payload_nonce: record.payload_nonce,
    payload_ct: record.payload_ct,
    payload_tag: record.payload_tag,
    dek_wrap_nonce: record.dek_wrap_nonce,
    dek_wrapped: record.dek_wrapped,
    dek_wrap_tag: record.dek_wrap_tag,
  };
});

/* ---------------- FETCH ---------------- */

app.get("/tx/:id", async (req: any, reply) => {
  const record = await db.transaction.findUnique({
    where: { id: req.params.id },
  });

  if (!record) {
    return reply.status(404).send({ error: "Not found" });
  }

  return {
    id: record.id,
    partyId: record.partyId,
    createdAt: record.createdAt.toISOString(),
    payload_nonce: record.payload_nonce,
    payload_ct: record.payload_ct,
    payload_tag: record.payload_tag,
    dek_wrap_nonce: record.dek_wrap_nonce,
    dek_wrapped: record.dek_wrapped,
    dek_wrap_tag: record.dek_wrap_tag,
  };
});

/* ---------------- DECRYPT ---------------- */

app.post("/tx/:id/decrypt", async (req: any, reply) => {
  try {
    const record = await db.transaction.findUnique({
      where: { id: req.params.id },
    });

    if (!record) {
      return reply.status(404).send({ error: "Transaction not found" });
    }

    try {
      const dek = unwrapDEK(
        record.dek_wrapped,
        record.dek_wrap_nonce,
        record.dek_wrap_tag
      );

      const payload = decryptPayload(
        record.payload_ct,
        record.payload_nonce,
        record.payload_tag,
        dek
      );

      return { payload };
    } catch (decryptError: any) {
      console.error("Decryption error:", decryptError.message);
      return reply.status(400).send({ 
        error: "Decryption failed",
        details: decryptError.message 
      });
    }
  } catch (error: any) {
    console.error("Decrypt endpoint error:", error);
    return reply.status(500).send({ 
      error: "Server error",
      details: error.message 
    });
  }
});

/* ---------------- LIST RECORDS ---------------- */

app.get("/records", async () => {
  const records = await db.transaction.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
  });

  return {
    total: records.length,
    records: records.map((r) => ({
      id: r.id,
      partyId: r.partyId,
      createdAt: r.createdAt.toISOString(),
    })),
  };
});

/* ---------------- START SERVER ---------------- */

app.listen({ port: 3001 }, () => {
  console.log("API running on http://localhost:3001");
});
