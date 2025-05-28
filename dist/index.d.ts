import { DasBudgetConfig, Account, Transaction, Bucket, RefreshesResponse, Budget, TransactionsOptions, AssignTransactionOptions, ApiOptions } from "./types";
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
    refresh(accountId: string, usePremium?: boolean, options?: ApiOptions): Promise<void>;
    budgets(): Promise<Budget[]>;
}
