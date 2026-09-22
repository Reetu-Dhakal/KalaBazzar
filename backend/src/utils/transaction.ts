import mongoose from 'mongoose';

export interface StartTransactionResult {
  session: mongoose.ClientSession | null;
  inTransaction: boolean;
}

let supportsTransactions: boolean | null = null;
let warned = false;

async function transactionsSupported(): Promise<boolean> {
  if (supportsTransactions !== null) return supportsTransactions;
  try {
    const admin = mongoose.connection.db!.admin();
    const hello = await admin.command({ hello: 1 });
    supportsTransactions = Boolean(hello.setName) || hello.msg === 'isdbgrid';
  } catch {
    supportsTransactions = false;
  }
  if (!supportsTransactions && !warned) {
    warned = true;
    console.warn(
      'WARNING: MongoDB does not support transactions (standalone mongod). Running without transaction guarantees. ' +
        'For atomic operations, run mongod as a single-node replica set (`mongod --replSet rs0`, then `rs.initiate()`).'
    );
  }
  return supportsTransactions;
}

export async function startTransaction(): Promise<StartTransactionResult> {
  if (!(await transactionsSupported())) {
    return { session: null, inTransaction: false };
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  return { session, inTransaction: true };
}