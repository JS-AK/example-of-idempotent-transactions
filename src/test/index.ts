import checkLowBalance from "./check-low-balance/index.js";
import twoPhasedCommitTransaction from "./two-phased-commit-transaction/index.js";

await checkLowBalance();
await twoPhasedCommitTransaction();
