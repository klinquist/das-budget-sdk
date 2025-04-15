import axios from "axios";

interface DasBudgetConfig {
  refreshToken: string;
  apiKey: string;
  debug?: boolean;
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  user_id: string;
}

interface AccountContext {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  photo_url: string | null;
  name: string;
  name_clean: string;
  subscription_id: string;
}

interface Category {
  id: number;
  folder_id: number;
  folder_name: string;
  name: string;
  emoji: string;
  folder: {
    id: number;
    name: string;
  };
}

interface InstitutionStatus {
  [key: string]: unknown;
}

interface ItemStatus {
  [key: string]: unknown;
}

interface AccountItem {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  institution_id: string;
  institution_name: string;
  institution_logo: string;
  syncing: boolean;
  access_token: string | null;
  institution_color: string;
  needs_action: boolean;
  last_sync: string;
  provider: string;
  provider_uid: string | null;
  client_id: string | null;
  client_secret: string | null;
  expires_at: string | null;
  refresh_token: string | null;
  context_id: string;
  queued_at: string;
  last_successful_sync: string;
  last_failed_sync: string;
  archived_at: string | null;
  accounts: Account[] | null;
  institution_status: InstitutionStatus;
  item_status: ItemStatus;
  can_refresh: boolean;
  can_reconfigure: boolean;
  is_owner: boolean;
}

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

// Internal interfaces for API responses (private)
interface PaginatedResponse<T> {
  page: number;
  limit: number;
  total: number;
  items: T[];
}

interface TransactionsResponse {
  page: number;
  limit: number;
  total: number;
  transactions: Transaction[];
  items: Record<string, Bucket>;
  accounts: Record<string, Account>;
  categories: Record<string, Category>;
  buckets: Record<string, Bucket>;
}

interface FundingSchedule {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  user_id: string;
  schedule: string;
  schedule_desc: string;
  schedule_date: string;
  schedule_next_date: string;
  last_executed: string;
  schedule_timezone: string;
  context_id: string;
  paused_at: string | null;
  removed_at: string | null;
  name_clean: string;
  bucket_id: string | null;
}

interface Recurrence {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  last_fund_date: string;
  next_fund_date: string;
  missed_contributions: number;
  total_contributions: number;
  total_contribution_amount: string;
  context_id: string;
}

interface BucketGroup {
  id: string;
  created_at: string;
  updated_at: string;
  removed_at: string | null;
  user_id: string;
  context_id: string;
  emoji: string;
  name: string;
  name_clean: string;
  kind: string;
  sync_color: boolean;
  color: string;
  position: number;
  notes: string | null;
}

interface Expense {
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

interface ExpensesResponse {
  page: number;
  limit: number;
  total: number;
  items: Expense[];
}

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
  funding_schedule: {
    id: string;
    created_at: string;
    updated_at: string;
    name: string;
    user_id: string;
    schedule: string;
    schedule_desc: string;
    schedule_date: string;
    schedule_next_date: string;
    last_executed: string;
    schedule_timezone: string;
    context_id: string;
    paused_at: string | null;
    removed_at: string | null;
    name_clean: string;
    bucket_id: string | null;
  };
  transactions: Transaction[] | null;
  recurrence: {
    id: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    last_fund_date: string;
    next_fund_date: string;
    missed_contributions: number;
    total_contributions: number;
    total_contribution_amount: string;
    context_id: string;
  };
  bucket_group: {
    id: string;
    created_at: string;
    updated_at: string;
    removed_at: string | null;
    user_id: string;
    context_id: string;
    emoji: string;
    name: string;
    name_clean: string;
    kind: string;
    sync_color: boolean;
    color: string;
    position: number;
    notes: string | null;
  };
  next_contribution: string;
  off_track: boolean;
}

interface AccountsResponse {
  page: number;
  limit: number;
  total: number;
  items: Account[];
  has_subscription: boolean;
}

export const FREE_TO_SPEND = "FREE_TO_SPEND";

interface TransactionsOptions {
  since?: number;
}

export default class DasBudget {
  private refreshToken: string;
  private apiKey: string;
  private debug: boolean;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;
  private userId: string | null = null;
  private readonly baseUrl = "https://api.dasbudget.com";

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
      this.log("Refreshing access token...");
      const response = await axios.post<TokenResponse>(
        `https://securetoken.googleapis.com/v1/token?key=${this.apiKey}`,
        {
          grant_type: "refresh_token",
          refresh_token: this.refreshToken,
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + response.data.expires_in * 1000;
      this.userId = response.data.user_id;
      this.log("Access token refreshed successfully");
    } catch (error) {
      this.log("Error refreshing access token");
      throw error;
    }
  }

  private async ensureValidToken(): Promise<void> {
    if (
      !this.accessToken ||
      !this.tokenExpiry ||
      Date.now() >= this.tokenExpiry
    ) {
      await this.refreshAccessToken();
    }
  }

  private getHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      Accept: "*/*",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      Origin: "https://app.dasbudget.com",
      Referer: "https://app.dasbudget.com/",
      "X-Das-Context-Id": "null",
      "X-Das-Platform": "web",
      "X-Das-Build": "179",
      "X-Das-Version": "0.9.5",
    };
  }

  public async initialize(): Promise<void> {
    this.log("Initializing SDK...");
    await this.refreshAccessToken();
    this.log("SDK initialized successfully");
  }

  public async transactions(
    options?: TransactionsOptions
  ): Promise<Transaction[]> {
    await this.ensureValidToken();
    this.log("Fetching transactions...");

    const since = options?.since;
    if (since !== undefined) {
      // Validate the since parameter
      if (typeof since !== "number" || isNaN(since)) {
        throw new Error(
          "since parameter must be a valid number (seconds since epoch)"
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
              types: "checking,credit card",
            },
            headers: this.getHeaders(),
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
            const createdAt = new Date(tx.created_at).getTime() / 1000;
            this.log(
              `Transaction ${tx.id} created at: ${new Date(
                tx.created_at
              ).toISOString()} (${createdAt})`
            );
            this.log(
              `Comparing: ${createdAt} >= ${since} = ${createdAt >= since}`
            );
            return createdAt >= since;
          });

          this.log(
            `Found ${filteredTransactions.length} transactions after ${new Date(
              since * 1000
            ).toISOString()}`
          );
          allTransactions.push(...filteredTransactions);
          totalFetched += filteredTransactions.length;

          // Only stop pagination if we got no transactions in this page
          // or if we got fewer transactions than the limit and none of them match our filter
          if (
            transactions.length === 0 ||
            (transactions.length < limit && filteredTransactions.length === 0)
          ) {
            this.log(
              "Reached end of transactions - no more matching transactions found"
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
          this.log("No since parameter provided, returning first page only");
          return transactions;
        }
      } catch (error) {
        this.log("Error fetching transactions");
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
    kind: "expense" | "goal" | "vault"
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
            sort: "schedule_date,name_clean",
          },
          headers: this.getHeaders(),
        }
      );

      return response.data.items;
    } catch (error) {
      this.log(`Error fetching ${kind}s`);
      throw error;
    }
  }

  public async expenses(): Promise<Bucket[]> {
    return this.getBucketsByKind("expense");
  }

  public async goals(): Promise<Bucket[]> {
    return this.getBucketsByKind("goal");
  }

  public async vaults(): Promise<Bucket[]> {
    return this.getBucketsByKind("vault");
  }

  public async assignTransactionToBucket(
    transactionId: string,
    bucketId: string | typeof FREE_TO_SPEND
  ): Promise<Transaction> {
    await this.ensureValidToken();
    this.log(`Assigning transaction ${transactionId} to bucket ${bucketId}...`);

    try {
      const actualBucketId = bucketId === FREE_TO_SPEND ? "fts" : bucketId;
      const response = await axios.post<Transaction>(
        `${this.baseUrl}/api/item/swap/${transactionId}/${actualBucketId}`,
        {},
        {
          headers: this.getHeaders(),
        }
      );

      return response.data;
    } catch (error) {
      this.log("Error assigning transaction to bucket");
      throw error;
    }
  }

  public async getAccounts(): Promise<Account[]> {
    await this.ensureValidToken();
    this.log("Fetching accounts...");

    try {
      const response = await axios.get<AccountsResponse>(
        `${this.baseUrl}/api/item/account`,
        {
          params: {
            types: "checking,credit card",
          },
          headers: this.getHeaders(),
        }
      );

      return response.data.items;
    } catch (error) {
      this.log("Error fetching accounts");
      throw error;
    }
  }
}
