import axios from 'axios';
import crypto from 'crypto';
import {
    DasBudgetConfig,
    TokenResponse,
    Account,
    Transaction,
    Bucket,
    RefreshesResponse,
    Budget,
    BudgetsResponse,
    FREE_TO_SPEND,
    TransactionsOptions,
    AssignTransactionOptions,
    ApiOptions,
    PaginatedResponse,
    TransactionsResponse,
    AccountsResponse,
    RefreshOptions,
    AccountItem,
    ItemsResponse,
} from './types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require('../package.json');

export default class DasBudget {
    private refreshToken: string;
    private apiKey: string;
    private debug: boolean;
    private accessToken: string | null = null;
    private tokenExpiry: number | null = null;
    private userId: string | null = null;
    private budgetId: string | null = null;
    private readonly baseUrl = 'https://api.dasbudget.com';

    constructor(config: DasBudgetConfig) {
        this.refreshToken = config.refreshToken;
        this.apiKey = config.apiKey;
        this.debug = config.debug || false;
    }

    private log(message: string) {
        if (this.debug) {
            console.log(`[DasBudget SDK] ${message}`);
        }
    }

    private async refreshAccessToken(): Promise<void> {
        try {
            this.log('Refreshing access token...');
            const response = await axios.post<TokenResponse>(
                `https://securetoken.googleapis.com/v1/token?key=${this.apiKey}`,
                {
                    grant_type: 'refresh_token',
                    refresh_token: this.refreshToken,
                }
            );

            this.accessToken = response.data.access_token;
            this.tokenExpiry = Date.now() + response.data.expires_in * 1000;
            this.userId = response.data.user_id;
            this.log('Access token refreshed successfully');
        } catch (error) {
            this.log('Error refreshing access token');
            throw error;
        }
    }

    private async ensureValidToken(): Promise<void> {
        const FIVE_MINUTES = 300000; // Get new token if within 5 minutes of expiry
        if (
            !this.accessToken ||
            !this.tokenExpiry ||
            Date.now() >= this.tokenExpiry - FIVE_MINUTES
        ) {
            await this.refreshAccessToken();
        }
    }

    /**
     * Sets the budget ID to use for all future API calls.
     * If not set, the oldest budget will be used by default.
     * @param budgetId The ID of the budget to use
     */
    public setBudgetId(budgetId: string | null): void {
        this.budgetId = budgetId;
        this.log(`Set budget ID to: ${budgetId ?? 'null'}`);
    }

    private getHeaders(options?: ApiOptions): Record<string, string> {
        return {
            Authorization: `Bearer ${this.accessToken}`,
            Accept: '*/*',
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
            Origin: 'https://app.dasbudget.com',
            Referer: 'https://app.dasbudget.com/',
            'X-Das-Context-Id': options?.budgetId ?? this.budgetId ?? 'null',
            'X-Das-Platform': 'web',
            'X-Das-Build': '179',
            'X-Das-Version': '0.9.5',
            'User-Agent': `klinquist/das-budget-sdk/${version}`,
        };
    }

    public async initialize(): Promise<void> {
        this.log('Initializing SDK...');
        await this.refreshAccessToken();
        this.log('SDK initialized successfully');
    }

    public async transactions(
        options?: TransactionsOptions
    ): Promise<Transaction[]> {
        await this.ensureValidToken();
        this.log('Fetching transactions...');

        const since = options?.since;
        if (since !== undefined) {
            // Validate the since parameter
            if (typeof since !== 'number' || isNaN(since)) {
                throw new Error(
                    'since parameter must be a valid number (seconds since epoch)'
                );
            }

            // Log the since value in different formats for debugging
            this.log(`since parameter value: ${since}`);
            this.log(`since as milliseconds: ${since * 1000}`);
            this.log(`since as date: ${new Date(since * 1000).toISOString()}`);
        }

        const allTransactions: Transaction[] = [];
        let currentPage = 1;
        const limit = 40; // Using the API's default limit
        let hasMorePages = true;
        let totalFetched = 0;

        while (hasMorePages) {
            try {
                this.log(`Fetching page ${currentPage} with limit ${limit}...`);
                const response = await axios.get<TransactionsResponse>(
                    `${this.baseUrl}/api/transaction`,
                    {
                        params: {
                            page: currentPage,
                            limit,
                            types: 'checking,credit card',
                        },
                        headers: this.getHeaders({
                            budgetId: options?.budgetId,
                        }),
                    }
                );

                const { transactions, total } = response.data;
                this.log(
                    `API Response - Page: ${currentPage}, Total: ${total}, Fetched: ${transactions.length}`
                );
                this.log(
                    `Fetched ${transactions.length} transactions from page ${currentPage}`
                );

                // If we have a since parameter, filter transactions
                if (since !== undefined) {
                    const filteredTransactions = transactions.filter((tx) => {
                        const createdAt =
                            new Date(tx.created_at).getTime() / 1000;
                        this.log(
                            `Transaction ${tx.id} created at: ${new Date(
                                tx.created_at
                            ).toISOString()} (${createdAt})`
                        );
                        this.log(
                            `Comparing: ${createdAt} >= ${since} = ${
                                createdAt >= since
                            }`
                        );
                        return createdAt >= since;
                    });

                    this.log(
                        `Found ${
                            filteredTransactions.length
                        } transactions after ${new Date(
                            since * 1000
                        ).toISOString()}`
                    );
                    allTransactions.push(...filteredTransactions);
                    totalFetched += filteredTransactions.length;

                    // Only stop pagination if we got no transactions in this page
                    // or if we got fewer transactions than the limit and none of them match our filter
                    if (
                        transactions.length === 0 ||
                        (transactions.length < limit &&
                            filteredTransactions.length === 0)
                    ) {
                        this.log(
                            'Reached end of transactions - no more matching transactions found'
                        );
                        hasMorePages = false;
                    } else {
                        currentPage++;
                        this.log(
                            `Moving to page ${currentPage} - found ${filteredTransactions.length} matching transactions`
                        );
                    }
                } else {
                    // If no since parameter, just return the first page
                    this.log(
                        'No since parameter provided, returning first page only'
                    );
                    return transactions;
                }
            } catch (error) {
                this.log('Error fetching transactions');
                throw error;
            }
        }

        this.log(
            `Returning ${
                allTransactions.length
            } total transactions (${totalFetched} fetched across ${
                currentPage - 1
            } pages)`
        );
        return allTransactions;
    }

    private async getBucketsByKind(
        kind: 'expense' | 'goal' | 'vault',
        options?: ApiOptions
    ): Promise<Bucket[]> {
        await this.ensureValidToken();
        this.log(`Fetching ${kind}s...`);

        try {
            const response = await axios.get<PaginatedResponse<Bucket>>(
                `${this.baseUrl}/api/bucket`,
                {
                    params: {
                        page: 1,
                        limit: 1000,
                        kind,
                        sort: 'schedule_date,name_clean',
                    },
                    headers: this.getHeaders(options),
                }
            );

            return response.data.items;
        } catch (error) {
            this.log(`Error fetching ${kind}s`);
            throw error;
        }
    }

    public async expenses(options?: ApiOptions): Promise<Bucket[]> {
        return this.getBucketsByKind('expense', options);
    }

    public async goals(options?: ApiOptions): Promise<Bucket[]> {
        return this.getBucketsByKind('goal', options);
    }

    public async vaults(options?: ApiOptions): Promise<Bucket[]> {
        return this.getBucketsByKind('vault', options);
    }

    public async accounts(options?: ApiOptions): Promise<Account[]> {
        await this.ensureValidToken();
        this.log('Fetching accounts...');

        try {
            const response = await axios.get<AccountsResponse>(
                `${this.baseUrl}/api/item/account`,
                {
                    params: {
                        types: 'checking,credit card',
                    },
                    headers: this.getHeaders(options),
                }
            );

            return response.data.items;
        } catch (error) {
            this.log('Error fetching accounts');
            throw error;
        }
    }

    public async assignTransactionToBucket(
        options: AssignTransactionOptions
    ): Promise<Transaction> {
        await this.ensureValidToken();
        this.log(
            `Assigning transaction ${options.transactionId} to bucket ${options.bucketId}...`
        );

        try {
            const actualBucketId =
                options.bucketId === FREE_TO_SPEND ? 'fts' : options.bucketId;
            const response = await axios.post<Transaction>(
                `${this.baseUrl}/api/item/swap/${options.transactionId}/${actualBucketId}`,
                {},
                {
                    headers: this.getHeaders({ budgetId: options.budgetId }),
                }
            );

            return response.data;
        } catch (error) {
            this.log('Error assigning transaction to bucket');
            throw error;
        }
    }

    public async refreshes(options?: ApiOptions): Promise<RefreshesResponse> {
        await this.ensureValidToken();
        this.log('Fetching refresh information...');

        try {
            const response = await axios.get<RefreshesResponse>(
                `${this.baseUrl}/api/item/refreshes`,
                {
                    headers: this.getHeaders(options),
                }
            );

            return response.data;
        } catch (error) {
            this.log('Error fetching refresh information');
            throw error;
        }
    }

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
    public async refresh(options: RefreshOptions): Promise<void> {
        if (!options?.itemId) {
            throw new Error('itemId is required for refresh');
        }

        if (
            typeof options.itemId !== 'string' ||
            options.itemId.trim() === ''
        ) {
            throw new Error('itemId must be a non-empty string');
        }

        if (
            options.usePremium !== undefined &&
            typeof options.usePremium !== 'boolean'
        ) {
            throw new Error('usePremium must be a boolean if provided');
        }

        if (
            options.budgetId !== undefined &&
            (typeof options.budgetId !== 'string' ||
                options.budgetId.trim() === '')
        ) {
            throw new Error('budgetId must be a non-empty string if provided');
        }

        await this.ensureValidToken();
        this.log(`Refreshing item ${options.itemId}...`);

        try {
            await axios.post(
                `${this.baseUrl}/api/item/${options.itemId}/refresh`,
                {
                    use_premium: options.usePremium ?? false,
                    idempotency_key: crypto.randomUUID(),
                    user_initiated: true,
                },
                {
                    headers: this.getHeaders(),
                }
            );
        } catch (error) {
            this.log('Error refreshing account');
            throw error;
        }
    }

    public async budgets(): Promise<Budget[]> {
        await this.ensureValidToken();
        this.log('Fetching budgets...');

        try {
            const response = await axios.get<BudgetsResponse>(
                `${this.baseUrl}/api/context`,
                {
                    headers: this.getHeaders(),
                }
            );

            return response.data.items;
        } catch (error) {
            this.log('Error fetching budgets');
            throw error;
        }
    }

    public async items(options?: ApiOptions): Promise<AccountItem[]> {
        await this.ensureValidToken();
        this.log('Fetching items...');

        try {
            const response = await axios.get<ItemsResponse>(
                `${this.baseUrl}/api/item`,
                {
                    headers: this.getHeaders(options),
                }
            );

            return response.data.items;
        } catch (error) {
            this.log('Error fetching items');
            throw error;
        }
    }
}
