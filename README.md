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
  apiKey: "AIzaSyAidm6Qvd5nsjdSSLmMdc-5RAWjIGv5a7I", //This is the API key the app uses
  debug: true, // Optional: enables debug logging
});

// Initialize the client
await client.initialize();

// Get all budgets
const budgets = await client.budgets();

// Set a default budget ID for all future API calls
client.setBudgetId(budgets[0].id);

// Get all transactions (will use the set budget ID)
const transactions = await client.transactions();

// Get transactions since a specific timestamp (in seconds since epoch)
const recentTransactions = await client.transactions({ since: 1744334993 });

// Get all expenses (will use the set budget ID)
const expenses = await client.expenses();

// Get all goals (will use the set budget ID)
const goals = await client.goals();

// Get all vaults (will use the set budget ID)
const vaults = await client.vaults();

// Get all accounts (will use the set budget ID)
const accounts = await client.accounts();

// Get all items (financial institutions) (will use the set budget ID). Note that an item is a concept thatcan contain one or more accounts.
const items = await client.items();

// Get refresh information (will use the set budget ID)
const refreshes = await client.refreshes();

// Refresh an account's data (will use the set budget ID)
await client.refresh({ itemId: "itemId" });

// Or use a premium refresh (will use the set budget ID)
await client.refresh({
  itemId: "item_id",
  usePremium: true,
});

// Or specify a different budget ID for this refresh
await client.refresh({
  accountId: "account_id",
  usePremium: true,
  budgetId: "other_budget_id",
});

// Assign a transaction to a bucket (will use the set budget ID)
const updatedTransaction = await client.assignTransactionToBucket({
  transactionId: "transaction_id",
  bucketId: "bucket_id",
});

// Assign a transaction to Free to Spend (will use the set budget ID)
const freeToSpendTransaction = await client.assignTransactionToBucket({
  transactionId: "transaction_id",
  bucketId: FREE_TO_SPEND,
});

// You can still override the budget ID for individual calls if needed
const otherBudgetTransactions = await client.transactions({
  budgetId: "other_budget_id",
});

// Clear the default budget ID to go back to using the oldest budget
client.setBudgetId(null);
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
  apiKey: process.env.API_KEY,
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
        await client.assignTransactionToBucket({
          transactionId: transaction.id,
          bucketId: expenseMapping.bucket_id,
        });
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
    const ONE_HOUR_AGO = Math.floor(Date.now() / 1000) - 3600;
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

#### `setBudgetId(budgetId: string | null): void`

Sets the budget ID to use for all future API calls. If not set, the oldest budget will be used by default. Most accounts only have one budget, so this is usually what you want.

Parameters:

- `budgetId`: The ID of the budget to use, or `null` to clear the setting and use the oldest budget

Example:

```typescript
// Get all budgets
const budgets = await client.budgets();

// Set a default budget ID for all future API calls
client.setBudgetId(budgets[0].id);

// All subsequent API calls will use this budget ID
const transactions = await client.transactions();

// You can still override the budget ID for individual calls
const otherBudgetTransactions = await client.transactions({
  budgetId: "other_budget_id",
});

// Clear the default budget ID
client.setBudgetId(null);
```

#### `transactions(options?: TransactionsOptions): Promise<Transaction[]>`

Fetches transactions from your accounts.

Options:

```typescript
interface TransactionsOptions {
  since?: number; // Optional: Unix timestamp in seconds to filter transactions
  budgetId?: string; // Optional: ID of the budget context to use
}
```

#### `expenses(options?: ApiOptions): Promise<Bucket[]>`

Fetches all expense buckets.

Options:

```typescript
interface ApiOptions {
  budgetId?: string; // Optional: ID of the budget context to use
}
```

#### `goals(options?: ApiOptions): Promise<Bucket[]>`

Fetches all goal buckets.

Options:

```typescript
interface ApiOptions {
  budgetId?: string; // Optional: ID of the budget context to use
}
```

#### `vaults(options?: ApiOptions): Promise<Bucket[]>`

Fetches all vault buckets.

Options:

```typescript
interface ApiOptions {
  budgetId?: string; // Optional: ID of the budget context to use
}
```

#### `accounts(options?: ApiOptions): Promise<Account[]>`

Fetches all linked accounts.

Options:

```typescript
interface ApiOptions {
  budgetId?: string; // Optional: ID of the budget context to use
}
```

#### `items(options?: ApiOptions): Promise<AccountItem[]>`

Fetches all linked items (financial institutions). Each item contains information about the institution and its connection status.

Options:

```typescript
interface ApiOptions {
  budgetId?: string; // Optional: ID of the budget context to use
}
```

Returns an array of `AccountItem` objects, which include:

- Institution information (name, logo, status)
- Connection details (last sync, sync status)
- Associated accounts
- Refresh capabilities

Example:

```typescript
const items = await client.items();
items.forEach((item) => {
  console.log(`Institution: ${item.institution_name}`);
  console.log(`Last sync: ${item.last_sync}`);
  console.log(`Can refresh: ${item.can_refresh}`);
});
```

#### `refreshes(options?: ApiOptions): Promise<RefreshesResponse>`

Fetches refresh information including credit balance, next available credits, and item refresh status.

Options:

```typescript
interface ApiOptions {
  budgetId?: string; // Optional: ID of the budget context to use
}
```

#### `budgets(): Promise<Budget[]>`

Fetches all budgets in your account. This method does not accept a `budgetId` parameter since it's used to get all available budgets.

Returns an array of `Budget` objects, where the first budget (index 0) is typically your oldest/primary budget.

Note: For all other API methods, if you don't specify a `budgetId`, it will use your oldest budget by default. Most accounts only have one budget, so this is usually what you want.

#### `refresh(accountId: string, usePremium: boolean = false, options?: ApiOptions): Promise<void>`

Refreshes the data for a specific account. This will trigger a sync with the account's institution.

Parameters:

- `accountId`: The ID of the account to refresh
- `usePremium`: Optional. If true, will use a premium refresh credit. Defaults to false.
- `options`: Optional. Additional options including budgetId.

Options:

```typescript
interface ApiOptions {
  budgetId?: string; // Optional: ID of the budget context to use
}
```

#### `assignTransactionToBucket(options: AssignTransactionOptions): Promise<Transaction>`

Assigns a transaction to a specific bucket or to Free to Spend.

Options:

```typescript
interface AssignTransactionOptions {
  transactionId: string; // The ID of the transaction to assign
  bucketId: string | typeof FREE_TO_SPEND; // The ID of the bucket to assign to, or FREE_TO_SPEND
  budgetId?: string; // Optional: ID of the budget context to use
}
```

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
