import {
  Address,
  KeyPairSigner,
  MessageSigner,
  Rpc,
  RpcSubscriptions,
  SolanaRpcApi,
  SolanaRpcSubscriptionsApi,
  TransactionSigner,
  airdropFactory,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransaction,
  generateKeyPairSigner,
  getAddressEncoder,
  getExplorerLink,
  getProgramDerivedAddress,
  getSignatureFromTransaction,
  lamports,
  sendAndConfirmTransactionFactory,
  signTransactionMessageWithSigners,
} from "gill";
import {
  getAssociatedTokenAccountAddress,
  TOKEN_PROGRAM_ADDRESS, // Use legacy token program
} from "gill/programs/token";
import * as codama from "../clients/js/src/generated/index.ts";
import { describe } from "mocha";

type Client = {
  rpc: Rpc<SolanaRpcApi>;
  rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
  sendAndConfirmTransaction: ReturnType<
    typeof sendAndConfirmTransactionFactory
  >;
  wallet: TransactionSigner & MessageSigner;
};

let client: Client;
// Create the RPC, RPC Subscriptions and airdrop function.
const rpc = createSolanaRpc("http://127.0.0.1:8899");
const rpcSubscriptions = createSolanaRpcSubscriptions("ws://127.0.0.1:8900");
const airdrop = airdropFactory({ rpc, rpcSubscriptions });

describe("Tether Program", () => {
  let wallet: KeyPairSigner;
  const mint = "6YBqSoUNBP4WVMyP1BBBdDsS5Y6cQNaHRAUfEX8iUHyJ" as Address;
  const systemProgram = "11111111111111111111111111111111" as Address;
  const tokenProgram = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" as Address;

  const seed = BigInt(1);

  let shared: {
    participant: Address;
    participantAta: Address;
  };

  before(async () => {
    wallet = await generateKeyPairSigner();

    await airdrop({
      recipientAddress: wallet.address,
      lamports: lamports(BigInt(3_000_000_000)),
      commitment: "confirmed",
    });

    const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
      rpc,
      rpcSubscriptions,
    });

    client = { rpc, rpcSubscriptions, sendAndConfirmTransaction, wallet };

    const balance = await client.rpc.getBalance(wallet.address).send();
    console.log("Balance: ", balance.value);

    const seedBuffer = Buffer.alloc(8);
    seedBuffer.writeBigUInt64LE(seed);

    const addressEncoder = getAddressEncoder();
    const [pda, bumpSeed] = await getProgramDerivedAddress({
      programAddress: codama.PROGRAM_PROGRAM_ADDRESS,
      seeds: [
        Buffer.from("participant"),
        addressEncoder.encode(wallet.address),
        seedBuffer,
      ],
    });

    const ATA = await getAssociatedTokenAccountAddress(
      mint,
      wallet.address,
      TOKEN_PROGRAM_ADDRESS
    );

    shared = {
      participant: pda,
      participantAta: ATA,
    };
  });

  it("Participate in contest", async () => {
    const { value: latestBlockhash } = await client.rpc
      .getLatestBlockhash()
      .send();
    const tx = createTransaction({
      feePayer: wallet,
      instructions: [
        codama.getParticipateInstruction({
          activeTime: BigInt(1758525708),
          mint: mint,
          participant: shared.participant,
          participantAta: shared.participantAta,
          seed,
          signer: wallet,
          systemProgram: systemProgram,
          tokenProgram: tokenProgram,
        }),
      ],
      latestBlockhash,
      version: "legacy",
    });

    const signedTransaction = await signTransactionMessageWithSigners(tx);

    console.log(
      "Explorer:",
      getExplorerLink({
        cluster: "devnet",
        transaction: getSignatureFromTransaction(signedTransaction),
      })
    );

    await client.sendAndConfirmTransaction(signedTransaction, {
      commitment: "confirmed",
    });
  });
});
