"use client";
import { useEffect, useState } from "react";
import { RuntimeLifecycle } from "@marlowe.io/runtime-lifecycle/api"
const blockfrostUrl = process.env.NEXT_PUBLIC_BLOCKFROST_URL;
const blockfrostProjectId = process.env.NEXT_PUBLIC_BLOCKFROST_ID;
const network = process.env.NEXT_PUBLIC_NETWORK;
const runtimeURL = process.env.NEXT_PUBLIC_RUNTIME_URL;

export default function Home() {
  const [runtime, setRuntime] = useState<RuntimeLifecycle | null>(null);
  useEffect(() => {
    const createLucid = async () => {
      console.log(
        "Configuring runtime"
      );
      const { mkLucidWallet } = await import("@marlowe.io/wallet/lucid");
      const { Lucid, Blockfrost } = await import("lucid-cardano");
      const { mkRuntimeLifecycle } = await import(
        "@marlowe.io/runtime-lifecycle"
      );

      const lucid = await Lucid.new(
        new Blockfrost(blockfrostUrl!, blockfrostProjectId),
        network as any
      );
      const api = await window.cardano.nami.enable();
      lucid.selectWallet(api);

      setRuntime(
        mkRuntimeLifecycle({
          runtimeURL: runtimeURL!,
          wallet: mkLucidWallet(lucid),
        })
      );
    };

    createLucid();
  }, []);

  const createContract = async () => {
    if (!runtime) {
      throw new Error("Runtime not initialized")
    }

    console.log("Wallet address", await runtime.wallet.getChangeAddress());
    console.log("Creating contract");
    const [contractId, txId] = await runtime.contracts.createContract({
      contract: "close"
    });
    console.log("Contract created", contractId);
    console.log("awaiting confirmation");
    await runtime.wallet.waitConfirmation(txId);
    console.log("Contract confirmed");
  };
  return (
    <main>
      <h1 className="text-xl font-bold mb-2">Marlowe NextJS test</h1>
      <button onClick={createContract} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Create contract
      </button>
    </main>
  );
}
