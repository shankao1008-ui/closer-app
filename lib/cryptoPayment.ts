export type PaymentCoin = "BTC" | "XMR";

// Only plain mainnet addresses are accepted. Final checksum, balance and fees
// are checked by the wallet. Never accept a user-supplied URI or restore link.
export function buildPayment(coin: PaymentCoin, inputAddress: string, inputAmount: string) {
  if (coin !== "BTC" && coin !== "XMR") throw new Error("address");
  const address = inputAddress.trim();
  const base58 = "[1-9A-HJ-NP-Za-km-z]";
  const addressOK = coin === "BTC"
    ? new RegExp(`^[13]${base58}{25,34}$`).test(address) || /^bc1[ac-hj-np-z02-9]{11,87}$/.test(address)
    : new RegExp(`^[48]${base58}{94}$|^4${base58}{105}$`).test(address);
  if (!addressOK) throw new Error("address");
  const amount = inputAmount.trim();
  const decimals = coin === "BTC" ? 8 : 12;
  if (!new RegExp(`^(0|[1-9][0-9]{0,14})(\\.[0-9]{1,${decimals}})?$`).test(amount)) throw new Error("amount");
  const [whole, fraction = ""] = amount.split(".");
  const atomic = BigInt(whole + fraction.padEnd(decimals, "0"));
  if (atomic <= 0n || (coin === "BTC" && atomic > 2100000000000000n)) throw new Error("amount");
  // Keep decimal text exact; no floating-point arithmetic or currency conversion.
  const uri = coin === "BTC" ? `bitcoin:${address}?amount=${amount}` : `monero:${address}?tx_amount=${amount}`;
  return { coin, address, amount, uri };
}
