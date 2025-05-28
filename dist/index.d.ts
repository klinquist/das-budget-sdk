import { DasBudgetConfig, Account, Transaction, Bucket, RefreshesResponse, Budget, TransactionsOptions, AssignTransactionOptions, ApiOptions, RefreshOptions, AccountItem } from './types';
export default class DasBudget {
    private refreshToken;
    private apiKey;
    private debug;
    private accessToken;
    private tokenExpiry;
    private userId;
    private budgetId;
    private readonly baseUrl;
    constructor(config: DasBudgetConfig);
    private log;
    private refreshAccessToken;
    private ensureValidToken;
    /**
     * Sets the budget ID to use for all future API calls.
     * If not set, the oldest budget will be used by default.
     * @param budgetId The ID of the budget to use
     */
    setBudgetId(budgetId: string | null): void;
    private getHeaders;
    initialize(): Promise<void>;
    transactions(options?: TransactionsOptions): Promise<Transaction[]>;
    private getBucketsByKind;
    expenses(options?: ApiOptions): Promise<Bucket[]>;
    goals(options?: ApiOptions): Promise<Bucket[]>;
    vaults(options?: ApiOptions): Promise<Bucket[]>;
    accounts(options?: ApiOptions): Promise<Account[]>;
    assignTransactionToBucket(options: AssignTransactionOptions): Promise<Transaction>;
    refreshes(options?: ApiOptions): Promise<RefreshesResponse>;
    /**
     * Refreshes the data for a specific account.
     *
     * @param options - The refresh options
     * @param options.itemId - The ID of the item to refresh (required)
     * @param options.usePremium - Whether to use premium refresh credits (optional, defaults to false)
     * @param options.budgetId - The ID of the budget to use (optional, defaults to the currently set budget)
     *
     * @throws {Error} If accountId is not provided
     * @throws {Error} If the account refresh fails
     *
     * @example
     * ```typescript
     * // Basic usage
     * await dasBudget.refresh({ itemId: "account-123" });
     *
     * // Using premium refresh
     * await dasBudget.refresh({
     *   itemId: "item-123",
     *   usePremium: true,
     *   budgetId: "budget-456"
     * });
     * ```
     */
    refresh(options: RefreshOptions): Promise<void>;
    budgets(): Promise<Budget[]>;
    items(options?: ApiOptions): Promise<AccountItem[]>;
}
