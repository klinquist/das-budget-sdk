### 1.2.0

-   Rebranded the SDK package from `das-budget-sdk` to `beacon-budget-sdk`
-   Added `BeaconBudget` as the primary client export
-   Kept `DasBudget` and `DasBudgetConfig` aliases for backward compatibility
-   Updated SDK logging and user-agent strings to Beacon Budget

### 1.1.19

-   Fixed Firebase token refresh compatibility by using `application/x-www-form-urlencoded` for `/v1/token`
-   Updated token parsing to accept both `id_token` and `access_token` from refresh responses

### 1.1.9

-   Included 'crypto' module to fix refresh error

### 1.1.8

-   Fixed `refresh` log

### 1.1.7

-   Fixed eslint errors

### 1.1.6

-   Include custom user-agent in requests

### 1.1.5

-   Added `items` method to get all linked items (financial institutions)

### 1.1.1

-   Fixed bug (ts not compiled)

### 1.1.0

-   Added `budgetId` parameter to all API calls
-   Added `setBudgetId` method to set the budget ID for all future API calls
-   BREAKING CHANGE: Renamed `getAccounts` to `accounts`
