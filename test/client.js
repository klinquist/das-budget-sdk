const DasBudget = require("../dist/index.js").default;

async function main() {
  try {
    const db = new DasBudget({
      refreshToken: "your_refresh_token",
      apiKey: "***REMOVED***",
      debug: true,
    });

    console.log("Initializing SDK...");
    await db.initialize();
    console.log("SDK initialized successfully!");

    // Test getting transactions
    console.log("\nFetching transactions...");
    const transactions = await db.transactions();
    console.log("Transactions:", transactions);

    // Test getting expenses
    console.log("\nFetching expenses...");
    const expenses = await db.expenses();
    console.log("Expenses:", expenses);

    // Test getting accounts
    console.log("\nFetching accounts...");
    const accounts = await db.getAccounts();
    console.log("Accounts:", accounts);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
