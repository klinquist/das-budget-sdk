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
indexedDB.open('firebaseLocalStorageDb').onsuccess = function (event) {
    const db = event.target.result;
    const transaction = db.transaction('firebaseLocalStorage', 'readonly');
    const store = transaction.objectStore('firebaseLocalStorage');
    const request = store.getAll();

    request.onsuccess = function () {
        const data = request.result[0];
        console.log('Refresh Token:', data.value.stsTokenManager.refreshToken);
    };
};
```

```typescript
import { DasBudget, FREE_TO_SPEND } from 'das-budget-sdk';

const client = new DasBudget({
    refreshToken: 'your_refresh_token',
    apiKey: 'AIzaSyAidm6Qvd5nsjdSSLmMdc-5RAWjIGv5a7I', //This is the API key the app uses
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

// Example: Update a transaction's note
const transaction = transactions[0];
await transaction.updateNote('My new note');

// Example: Assign a transaction to a bucket
await transaction.assignToBucket('bucket_id');

// Example: Assign a transaction to Free to Spend
await transaction.assignToBucket(FREE_TO_SPEND);

// Example: Get transactions for an account
const account = accounts[0];
const accountTransactions = await account.getTransactions();

// Example: Get transactions for a bucket
const bucket = expenses[0];
const bucketTransactions = await bucket.getTransactions();
```

## Advanced Example: Monitoring Transactions and Auto-Assigning

Here's an example of how to use the SDK to monitor transactions and automatically assign them to buckets:

```typescript
const DasBudget = require('das-budget-sdk').default;

// Initialize the client
const client = new DasBudget({
    refreshToken: 'your_refresh_token',
    apiKey: 'AIzaSyAidm6Qvd5nsjdSSLmMdc-5RAWjIGv5a7I',
    debug: true,
});

async function findRentExpense() {
    await client.initialize();

    // Get all expenses and find the Rent expense
    const expenses = await client.expenses();
    const rentExpense = expenses.find((expense) =>
        expense.name.toLowerCase().includes('rent')
    );

    if (!rentExpense) {
        console.error('Could not find Rent expense');
        return null;
    }

    console.log(`Found Rent expense with ID: ${rentExpense.id}`);
    return rentExpense;
}

async function monitorTransactions(rentExpense: Bucket) {
    // Get transactions from the last hour
    const oneHourAgo = Math.floor(Date.now() / 1000) - 3600;
    const transactions = await client.transactions({ since: oneHourAgo });

    // Look for rent payment transactions
    for (const transaction of transactions) {
        if (
            transaction.rawName
                .toUpperCase()
                .includes('TRANSFER TO ACCT #1973') &&
            transaction.amount === '900.00'
        ) {
            console.log(`Found rent payment transaction: ${transaction.id}`);

            // Assign the transaction to the Rent expense
            await transaction.assignToBucket(rentExpense.id);

            console.log(
                `Assigned transaction ${transaction.id} to Rent expense`
            );
        }
    }
}

// Main function to run the monitoring
async function main() {
    const rentExpense = await findRentExpense();
    if (!rentExpense) return;

    // Run the monitoring every hour
    setInterval(() => {
        monitorTransactions(rentExpense).catch(console.error);
    }, 3600000); // 3600000 ms = 1 hour

    // Run immediately on startup
    await monitorTransactions(rentExpense);
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

## Model Classes

### `Transaction`

Represents a transaction in DAS Budget.

#### Properties

-   `id`: string
-   `name`: string
-   `notes`: string | null
-   `amount`: string
-   `bucketId`: string | null
-   `accountId`: string
-   `pending`: boolean
-   `postedDate`: string
-   `authorizedDate`: string
-   `rawName`: string
-   `merchantName`: string

#### Methods

-   `updateNote(note: string): Promise<void>`
-   `assignToBucket(bucketId: string | typeof FREE_TO_SPEND): Promise<Transaction>`

### `Account`

Represents a linked account in DAS Budget.

#### Properties

-   `id`: string
-   `name`: string
-   `officialName`: string
-   `availableBalance`: string
-   `currentBalance`: string
-   `type`: string
-   `mask`: string
-   `active`: boolean
-   `spendable`: boolean
-   `isOwner`: boolean

#### Methods

-   `getTransactions(options?: { since?: number }): Promise<Transaction[]>`

### `Bucket`

Represents a bucket (expense, goal, or vault) in DAS Budget.

#### Properties

-   `id`: string
-   `name`: string
-   `notes`: string
-   `targetAmount`: string
-   `currentAmount`: string
-   `kind`: "expense" | "goal" | "vault"
-   `contribution`: string
-   `paused`: boolean
-   `offTrack`: boolean

#### Methods

-   `updateNote(note: string): Promise<void>`
-   `getTransactions(): Promise<Transaction[]>`

## Constants

### `FREE_TO_SPEND`

A constant representing the Free to Spend bucket. Use this when assigning transactions to Free to Spend:

```typescript
import { FREE_TO_SPEND } from 'das-budget-sdk';

// Assign a transaction to Free to Spend
await transaction.assignToBucket(FREE_TO_SPEND);
```

## Error Handling

All methods may throw errors in case of API failures or invalid parameters. Make sure to handle these appropriately in your code.

## Debugging

Enable debug logging by setting `debug: true` in the configuration. This will log detailed information about API calls and responses to help with debugging.

## License

MIT
