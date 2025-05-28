"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const types_1 = require("./types");
class DasBudget {
    constructor(config) {
        this.accessToken = null;
        this.tokenExpiry = null;
        this.userId = null;
        this.budgetId = null;
        this.baseUrl = "https://api.dasbudget.com";
        this.refreshToken = config.refreshToken;
        this.apiKey = config.apiKey;
        this.debug = config.debug || false;
    }
    log(message) {
        if (this.debug) {
            console.log(`[DasBudget SDK] ${message}`);
        }
    }
    async refreshAccessToken() {
        try {
            this.log("Refreshing access token...");
            const response = await axios_1.default.post(`https://securetoken.googleapis.com/v1/token?key=${this.apiKey}`, {
                grant_type: "refresh_token",
                refresh_token: this.refreshToken,
            });
            this.accessToken = response.data.access_token;
            this.tokenExpiry = Date.now() + response.data.expires_in * 1000;
            this.userId = response.data.user_id;
            this.log("Access token refreshed successfully");
        }
        catch (error) {
            this.log("Error refreshing access token");
            throw error;
        }
    }
    async ensureValidToken() {
        const FIVE_MINUTES = 300000; // Get new token if within 5 minutes of expiry
        if (!this.accessToken ||
            !this.tokenExpiry ||
            Date.now() >= this.tokenExpiry - FIVE_MINUTES) {
            await this.refreshAccessToken();
        }
    }
    /**
     * Sets the budget ID to use for all future API calls.
     * If not set, the oldest budget will be used by default.
     * @param budgetId The ID of the budget to use
     */
    setBudgetId(budgetId) {
        this.budgetId = budgetId;
        this.log(`Set budget ID to: ${budgetId ?? "null"}`);
    }
    getHeaders(options) {
        return {
            Authorization: `Bearer ${this.accessToken}`,
            Accept: "*/*",
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Origin: "https://app.dasbudget.com",
            Referer: "https://app.dasbudget.com/",
            "X-Das-Context-Id": options?.budgetId ?? this.budgetId ?? "null",
            "X-Das-Platform": "web",
            "X-Das-Build": "179",
            "X-Das-Version": "0.9.5",
        };
    }
    async initialize() {
        this.log("Initializing SDK...");
        await this.refreshAccessToken();
        this.log("SDK initialized successfully");
    }
    async transactions(options) {
        await this.ensureValidToken();
        this.log("Fetching transactions...");
        const since = options?.since;
        if (since !== undefined) {
            // Validate the since parameter
            if (typeof since !== "number" || isNaN(since)) {
                throw new Error("since parameter must be a valid number (seconds since epoch)");
            }
            // Log the since value in different formats for debugging
            this.log(`since parameter value: ${since}`);
            this.log(`since as milliseconds: ${since * 1000}`);
            this.log(`since as date: ${new Date(since * 1000).toISOString()}`);
        }
        const allTransactions = [];
        let currentPage = 1;
        const limit = 40; // Using the API's default limit
        let hasMorePages = true;
        let totalFetched = 0;
        while (hasMorePages) {
            try {
                this.log(`Fetching page ${currentPage} with limit ${limit}...`);
                const response = await axios_1.default.get(`${this.baseUrl}/api/transaction`, {
                    params: {
                        page: currentPage,
                        limit,
                        types: "checking,credit card",
                    },
                    headers: this.getHeaders({ budgetId: options?.budgetId }),
                });
                const { transactions, total } = response.data;
                this.log(`API Response - Page: ${currentPage}, Total: ${total}, Fetched: ${transactions.length}`);
                this.log(`Fetched ${transactions.length} transactions from page ${currentPage}`);
                // If we have a since parameter, filter transactions
                if (since !== undefined) {
                    const filteredTransactions = transactions.filter((tx) => {
                        const createdAt = new Date(tx.created_at).getTime() / 1000;
                        this.log(`Transaction ${tx.id} created at: ${new Date(tx.created_at).toISOString()} (${createdAt})`);
                        this.log(`Comparing: ${createdAt} >= ${since} = ${createdAt >= since}`);
                        return createdAt >= since;
                    });
                    this.log(`Found ${filteredTransactions.length} transactions after ${new Date(since * 1000).toISOString()}`);
                    allTransactions.push(...filteredTransactions);
                    totalFetched += filteredTransactions.length;
                    // Only stop pagination if we got no transactions in this page
                    // or if we got fewer transactions than the limit and none of them match our filter
                    if (transactions.length === 0 ||
                        (transactions.length < limit && filteredTransactions.length === 0)) {
                        this.log("Reached end of transactions - no more matching transactions found");
                        hasMorePages = false;
                    }
                    else {
                        currentPage++;
                        this.log(`Moving to page ${currentPage} - found ${filteredTransactions.length} matching transactions`);
                    }
                }
                else {
                    // If no since parameter, just return the first page
                    this.log("No since parameter provided, returning first page only");
                    return transactions;
                }
            }
            catch (error) {
                this.log("Error fetching transactions");
                throw error;
            }
        }
        this.log(`Returning ${allTransactions.length} total transactions (${totalFetched} fetched across ${currentPage - 1} pages)`);
        return allTransactions;
    }
    async getBucketsByKind(kind, options) {
        await this.ensureValidToken();
        this.log(`Fetching ${kind}s...`);
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/api/bucket`, {
                params: {
                    page: 1,
                    limit: 1000,
                    kind,
                    sort: "schedule_date,name_clean",
                },
                headers: this.getHeaders(options),
            });
            return response.data.items;
        }
        catch (error) {
            this.log(`Error fetching ${kind}s`);
            throw error;
        }
    }
    async expenses(options) {
        return this.getBucketsByKind("expense", options);
    }
    async goals(options) {
        return this.getBucketsByKind("goal", options);
    }
    async vaults(options) {
        return this.getBucketsByKind("vault", options);
    }
    async accounts(options) {
        await this.ensureValidToken();
        this.log("Fetching accounts...");
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/api/item/account`, {
                params: {
                    types: "checking,credit card",
                },
                headers: this.getHeaders(options),
            });
            return response.data.items;
        }
        catch (error) {
            this.log("Error fetching accounts");
            throw error;
        }
    }
    async assignTransactionToBucket(options) {
        await this.ensureValidToken();
        this.log(`Assigning transaction ${options.transactionId} to bucket ${options.bucketId}...`);
        try {
            const actualBucketId = options.bucketId === types_1.FREE_TO_SPEND ? "fts" : options.bucketId;
            const response = await axios_1.default.post(`${this.baseUrl}/api/item/swap/${options.transactionId}/${actualBucketId}`, {}, {
                headers: this.getHeaders({ budgetId: options.budgetId }),
            });
            return response.data;
        }
        catch (error) {
            this.log("Error assigning transaction to bucket");
            throw error;
        }
    }
    async refreshes(options) {
        await this.ensureValidToken();
        this.log("Fetching refresh information...");
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/api/item/refreshes`, {
                headers: this.getHeaders(options),
            });
            return response.data;
        }
        catch (error) {
            this.log("Error fetching refresh information");
            throw error;
        }
    }
    async refresh(accountId, usePremium = false, options) {
        await this.ensureValidToken();
        this.log(`Refreshing account ${accountId}...`);
        try {
            await axios_1.default.post(`${this.baseUrl}/api/item/${accountId}/refresh`, {
                use_premium: usePremium,
                idempotency_key: crypto.randomUUID(),
                user_initiated: true,
            }, {
                headers: {
                    ...this.getHeaders(options),
                    "Content-Type": "application/json",
                },
            });
        }
        catch (error) {
            this.log("Error refreshing account");
            throw error;
        }
    }
    async budgets() {
        await this.ensureValidToken();
        this.log("Fetching budgets...");
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/api/context`, {
                headers: this.getHeaders(),
            });
            return response.data.items;
        }
        catch (error) {
            this.log("Error fetching budgets");
            throw error;
        }
    }
}
exports.default = DasBudget;
