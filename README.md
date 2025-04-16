# DAS Budget SDK

An UNOFFICIAL TypeScript SDK for interacting with the DAS Budget API. I created this for one purpose: to assign transactions to buckets based on some advanced logic that is not supported by the DAS Budget App. If you'd like to see any additional features, please open an issue!

## Installation

```bash
npm install das-budget-sdk
```

## Usage

### Getting Your Refresh Token

1. Log in to [DAS Budget](https://app.dasbudget.com)
2. Open your browser's developer tools (F12 or right-click -> Inspect)
3. Go to the Console tab
4. Paste this code to reveal the refresh token:

```javascript
indexedDB.open("firebaseLocalStorageDb").onsuccess = function (event) {
  const db = event.target.result;
  const transaction = db.transaction("firebaseLocalStorage", "readonly");
  const store = transaction.objectStore("firebaseLocalStorage");
  const request = store.getAll();

  request.onsuccess = function () {
    const data = request.result[0];
    console.log("Refresh Token:", data.value.stsTokenManager.refreshToken);
  };
};
```

### Writing Code

```typescript
import { DasBudget, FREE_TO_SPEND } from "das-budget-sdk";

const client = new DasBudget({
  refreshToken: "your_refresh_token",
  apiKey: "***REMOVED***", //This is the API key the app uses
  debug: true, // Optional: enables debug logging
});

// Initialize the client
await client.initialize();

// Get all transactions
const transactions = await client.transactions();

// Get transactions since a specific timestamp (in seconds since epoch)
const recentTransactions = await client.transactions({ since: 1744334993 });

// Get all expenses
const expenses = await client.expenses();

// Get all goals
const goals = await client.goals();

// Get all vaults
const vaults = await client.vaults();

// Get all accounts
const accounts = await client.getAccounts();

// Get refresh information
const refreshes = await client.refreshes();

// Refresh an account's data
await client.refresh("account_id");

// Or use a premium refresh
await client.refresh("account_id", true);

// Assign a transaction to a bucket (note that goals, expenses, and vaults are all buckets)
const updatedTransaction = await client.assignTransactionToBucket(
  "transaction_id",
  "bucket_id"
);

// Assign a transaction to Free to Spend
const freeToSpendTransaction = await client.assignTransactionToBucket(
  "transaction_id",
  FREE_TO_SPEND
);
```

## Advanced Example: Monitoring Transactions and Auto-Assigning

Here's an example of how to use the SDK to monitor transactions and automatically assign them to buckets:

```javascript
require("dotenv").config();
const DasBudget = require("das-budget-sdk").default;

const log = (message) => {
  const date = new Date();
  const pacificTime = date.toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
  });
  console.log(`${pacificTime} ${message}`);
};

const expenseMappings = [
  {
    name_contains: "VENMO",
    friendly_name: "Housekeeping",
    amount_between_min: 50,
    amount_between_max: 50,
    bucket_id: "XXXXXXXXXX",
  },
];

// Initialize the client
const client = new DasBudget({
  refreshToken: process.env.REFRESH_TOKEN,
  apiKey: "***REMOVED***",
  debug: false,
});

const ONE_DAY_AGO = Math.floor(Date.now() / 1000) - 86400;

async function monitorTransactions(timeSince) {
  // Get transactions from the last hour
  const transactions = await client.transactions({ since: timeSince });

  //Look for rent payment transactions
  for (const transaction of transactions) {
    log(`Evaluating transaction "${transaction.data.raw_name}"`);
    expenseMappings.forEach(async (expenseMapping) => {
      if (
        transaction.data.raw_name
          .toUpperCase()
          .includes(expenseMapping.name_contains.toUpperCase()) &&
        Number(transaction.amount) >= expenseMapping.amount_between_min &&
        Number(transaction.amount) <= expenseMapping.amount_between_max &&
        transaction.bucket_id === null
      ) {
        await client.assignTransactionToBucket(
          transaction.id,
          expenseMapping.bucket_id
        );
        log(
          `Assigned transaction ${transaction.id} to ${expenseMapping.friendly_name}`
        );
      }
    });
  }
}

// Main function to run the monitoring
async function main() {
  //Run the monitoring every hour
  setInterval(() => {
    const ONE_HOUR_AGO = Math.floor(Date.now() / 1000) - 3801;
    monitorTransactions(ONE_HOUR_AGO).catch(console.error);
  }, 3600000); // 1 hour

  //Run immediately on startup
  await monitorTransactions(ONE_DAY_AGO);
}

// Start the monitoring
main().catch(console.error);
```

## API Reference

### `DasBudget(config: DasBudgetConfig)`

Creates a new DAS Budget client instance.

#### Configuration

```typescript
interface DasBudgetConfig {
  refreshToken: string; // Your DAS Budget refresh token
  apiKey: string; // Your DAS Budget API key
  debug?: boolean; // Optional: enables debug logging
}
```

### Methods

#### `initialize(): Promise<void>`

Initializes the client by fetching an access token. This is called automatically when needed, but you can call it explicitly to ensure the client is ready.

#### `transactions(options?: TransactionsOptions): Promise<Transaction[]>`

Fetches transactions from your accounts.

Options:

```typescript
interface TransactionsOptions {
  since?: number; // Optional: Unix timestamp in seconds to filter transactions
}
```

#### `expenses(): Promise<Bucket[]>`

Fetches all expense buckets.

#### `goals(): Promise<Bucket[]>`

Fetches all goal buckets.

#### `vaults(): Promise<Bucket[]>`

Fetches all vault buckets.

#### `getAccounts(): Promise<Account[]>`

Fetches all linked accounts.

#### `refreshes(): Promise<RefreshesResponse>`

Fetches refresh information including credit balance, next available credits, and item refresh status.

Returns:

```typescript
interface RefreshesResponse {
  premium_rolling_days: number;
  premium_rolling_credits: number;
  has_premium_refreshes: boolean;
  premium_upsell: string;
  next_credits: string[];
  credit_balance: number;
  refresh_balance: number;
  can_manage_refreshes: boolean;
  item_refreshes: Array<{
    id: string;
    institution_name: string;
    institution_logo: string;
    refresh_cost: number;
    can_refresh: boolean;
    last_provider_sync: string;
    last_das_sync: string;
  }>;
}
```

#### `refresh(accountId: string, usePremium: boolean = false): Promise<void>`

Refreshes the data for a specific account. This will trigger a sync with the account's institution.

Parameters:

- `accountId`: The ID of the account to refresh
- `usePremium`: Optional. If true, will use a premium refresh credit. Defaults to false.

#### `assignTransactionToBucket(transactionId: string, bucketId: string | typeof FREE_TO_SPEND): Promise<Transaction>`

Assigns a transaction to a specific bucket or to Free to Spend.

## Data Models

### Transaction

```typescript
interface Transaction {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  notes: string | null;
  user_id: string;
  bucket_id: string | null;
  account_id: string;
  category_id: number;
  amount: string;
  pending: boolean;
  posted_date: string;
  authorized_date: string;
  data: {
    name: string;
    raw_name: string;
  };
  pending_transaction_id: string | null;
  removed_at: string | null;
  insufficient_funds: string | null;
  rounded: string;
  context_id: string;
  hidden_at: string | null;
  logo_url: string | null;
  amount_adjustment: string;
  bucket: Bucket | null;
  category: Category | null;
  account: Account | null;
  original_name: string;
  bucket_spending?: {
    free_to_spend: string;
    bucket_activity: string;
    bucket_name: string;
  };
  metadata: {
    raw_name: string;
    nice_name: string;
    merchant_name: string;
  };
}
```

### Bucket (Expense/Goal/Vault)

```typescript
interface Bucket {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  name: string;
  notes: string;
  target_amount: string;
  current_amount: string;
  schedule: string;
  schedule_desc: string;
  schedule_date: string;
  schedule_next_date: string;
  recurrence_id: string;
  funding_schedule_id: string;
  kind: "expense" | "goal" | "vault";
  contribution: string;
  name_clean: string;
  merchants?: string[];
  paused: boolean;
  schedule_timezone: string;
  context_id: string;
  removed_at: string | null;
  color: string;
  bucket_group_id: string;
  migrated_at: string;
  partial_spend: boolean;
  categories: Category[];
  funding_schedule: FundingSchedule;
  transactions: Transaction[] | null;
  recurrence: Recurrence;
  bucket_group: BucketGroup;
  next_contribution: string;
  off_track: boolean;
}
```

### Account

```typescript
interface Account {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  item_id: string;
  name: string;
  official_name: string;
  available_balance: string;
  current_balance: string;
  type: string;
  mask: string;
  active: boolean;
  original_name: string;
  original_type: string;
  limit_balance: string;
  removed_at: string | null;
  context_id: string;
  deleted_at: string | null;
  item: AccountItem;
  context: AccountContext | null;
  last_sync: string;
  spendable: boolean;
  is_owner: boolean;
  enabled_for_sub: boolean;
}
```

## Constants

### `FREE_TO_SPEND`

A constant representing the Free to Spend bucket. Use this when assigning transactions to Free to Spend:

```typescript
import { FREE_TO_SPEND } from "das-budget-sdk";

// Assign a transaction to Free to Spend
await client.assignTransactionToBucket("transaction_id", FREE_TO_SPEND);
```

## Error Handling

All methods may throw errors in case of API failures or invalid parameters. Make sure to handle these appropriately in your code.

## Debugging

Enable debug logging by setting `debug: true` in the configuration. This will log detailed information about API calls and responses to help with debugging.

## License

MIT
