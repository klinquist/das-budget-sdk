import { DasBudgetConfig, Transaction, Bucket, Account, Budget, TransactionsOptions, AssignTransactionOptions, ApiOptions, RefreshesResponse } from './types';
export { FREE_TO_SPEND } from './types';
export default class DasBudget {
    private accessToken;
    private tokenExpiry;
    private userId;
    private budgetId;
    private readonly baseUrl;
    private readonly refreshToken;
    private readonly apiKey;
    private readonly debug;
    constructor(config: DasBudgetConfig);
    private log;
    private refreshAccessToken;
    private ensureValidToken;
    /**
     * Sets the budget ID to use for all future API calls.
     * If not set, the oldest budget will be used by default.
     * @param budgetId The ID of the budget to use
     */
    setBudgetId(budgetId: string): void;
    private getHeaders;
    initialize(): Promise<void>;
    transactions(options?: TransactionsOptions): Promise<Transaction[]>;
    private getBucketsByKind;
    expenses(options?: ApiOptions): Promise<Bucket[]>;
    goals(options?: ApiOptions): Promise<Bucket[]>;
    vaults(options?: ApiOptions): Promise<Bucket[]>;
    accounts(options?: ApiOptions): Promise<Account[]>;
    assignTransactionToBucket(options: AssignTransactionOptions): Promise<unknown>;
    refreshes(options?: ApiOptions): Promise<RefreshesResponse>;
    refresh(accountId: string, usePremium?: boolean, options?: ApiOptions): Promise<void>;
    budgets(): Promise<Budget[]>;
}
