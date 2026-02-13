"use client";

import React, { useState } from "react";;

interface EncryptedRecord {
  id: string;
  partyId: string;
  createdAt: string;
  payload_nonce: string;
  payload_ct: string;
  payload_tag: string;
  dek_wrap_nonce: string;
  dek_wrapped: string;
  dek_wrap_tag: string;
  alg: string;
  mk_version: number;
}

export default function Home() {
  const [partyId, setPartyId] = useState("");
  const [payload, setPayload] = useState("");
  const [encryptedResult, setEncryptedResult] = useState<EncryptedRecord | null>(null);
  const [decryptId, setDecryptId] = useState("");
  const [decryptedPayload, setDecryptedPayload] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetchedRecord, setFetchedRecord] = useState<EncryptedRecord | null>(null);

  const handleEncrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/tx/encrypt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partyId, payload }),
      });

      if (!res.ok) throw new Error("Failed to encrypt");
      const data = await res.json();
      setEncryptedResult(data);
      setPayload("");
      setPartyId("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchRecord = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:3001/tx/${decryptId}`);
      if (!res.ok) throw new Error("Record not found");
      const data = await res.json();
      setFetchedRecord(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:3001/tx/${decryptId}/decrypt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || errorData.error || "Failed to decrypt");
      }
      const data = await res.json();
      setDecryptedPayload(data.payload);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Secure Encryption
          </h1>
          <p className="text-gray-300 text-lg">
            Encrypt and decrypt your sensitive data with AES-256-GCM
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400">Error: {error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Encryption Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 rounded-2xl p-8 shadow-2xl hover:shadow-cyan-500/10 transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Encrypt Data</h2>
            </div>

            <form onSubmit={handleEncrypt} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Party ID
                </label>
                <input
                  type="text"
                  value={partyId}
                  onChange={(e) => setPartyId(e.target.value)}
                  placeholder="e.g., party-001"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Payload (JSON)
                </label>
                <textarea
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  placeholder='{"secret": "your-data"}'
                  rows={5}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-lg transition transform hover:scale-105 active:scale-95"
              >
                {loading ? "Encrypting..." : "Encrypt"}
              </button>
            </form>

            {encryptedResult && (
              <div className="mt-8 pt-8 border-t border-slate-600">
                <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Encryption Successful
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="bg-slate-900 p-3 rounded border border-slate-600">
                    <p className="text-gray-400">Transaction ID</p>
                    <p className="text-cyan-300 font-mono break-all">{encryptedResult.id}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-900 p-2 rounded border border-slate-600">
                      <p className="text-gray-500">Algorithm</p>
                      <p className="text-white">{encryptedResult.alg}</p>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-600">
                      <p className="text-gray-500">Created</p>
                      <p className="text-white">
                        {new Date(encryptedResult.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Decryption Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 rounded-2xl p-8 shadow-2xl hover:shadow-purple-500/10 transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <svg
                  className="w-6 h-6 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Decrypt Data</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Transaction ID
                </label>
                <input
                  type="text"
                  value={decryptId}
                  onChange={(e) => setDecryptId(e.target.value)}
                  placeholder="Enter transaction ID"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleFetchRecord}
                  disabled={!decryptId || loading}
                  className="py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-gray-700 text-white font-semibold rounded-lg transition transform hover:scale-105 active:scale-95"
                >
                  {loading ? "Fetching..." : "Fetch"}
                </button>
                <button
                  onClick={handleDecrypt}
                  disabled={!decryptId || loading}
                  className="py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-lg transition transform hover:scale-105 active:scale-95"
                >
                  {loading ? "Decrypting..." : "Decrypt"}
                </button>
              </div>

              {fetchedRecord && (
                <div className="mt-6 pt-6 border-t border-slate-600">
                  <h3 className="font-semibold text-cyan-400 mb-3">Transaction Details</h3>
                  <div className="space-y-2 text-xs">
                    <div className="bg-slate-900 p-2 rounded border border-slate-600">
                      <p className="text-gray-500">Party ID</p>
                      <p className="text-white truncate">{fetchedRecord.partyId}</p>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-600">
                      <p className="text-gray-500">Cipher Text (truncated)</p>
                      <p className="text-cyan-300 font-mono truncate">
                        {fetchedRecord.payload_ct.substring(0, 32)}...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {decryptedPayload && (
                <div className="mt-6 pt-6 border-t border-slate-600">
                  <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Decryption Successful
                  </h3>
                  <div className="bg-slate-900 p-4 rounded border border-green-500/50 overflow-auto max-h-64">
                    <pre className="text-green-400 font-mono text-sm">
                      {typeof decryptedPayload === "string"
                        ? (() => {
                            try {
                              return JSON.stringify(JSON.parse(decryptedPayload), null, 2);
                            } catch {
                              return decryptedPayload;
                            }
                          })()
                        : JSON.stringify(decryptedPayload, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500/20 rounded">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 13a3 3 0 105.196 1H7a1 1 0 010-2h3.773A3 3 0 005 13z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white">AES-256-GCM</h3>
            </div>
            <p className="text-gray-400 text-sm">Military-grade encryption using AES with 256-bit keys</p>
          </div>

          <div className="bg-slate-800 border border-slate-600 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-500/20 rounded">
                <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-semibold text-white">Secure Keys</h3>
            </div>
            <p className="text-gray-400 text-sm">Data Encryption Keys are wrapped and managed securely</p>
          </div>

          <div className="bg-slate-800 border border-slate-600 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-500/20 rounded">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-semibold text-white">Verified</h3>
            </div>
            <p className="text-gray-400 text-sm">AEAD authentication tags ensure data integrity</p>
          </div>
        </div>
      </div>
    </div>
  );
}
