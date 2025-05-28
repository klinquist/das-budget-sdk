export interface DasBudgetConfig {
    refreshToken: string;
    apiKey: string;
    debug?: boolean;
}
export interface TokenResponse {
    access_token: string;
    expires_in: number;
    user_id: string;
}
export interface AccountContext {
    id: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    photo_url: string | null;
    name: string;
    name_clean: string;
    subscription_id: string;
}
export interface Category {
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
export interface InstitutionStatus {
    [key: string]: unknown;
}
export interface ItemStatus {
    [key: string]: unknown;
}
export interface AccountItem {
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
export interface Account {
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
export interface Transaction {
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
export interface PaginatedResponse<T> {
    page: number;
    limit: number;
    total: number;
    items: T[];
}
export interface TransactionsResponse {
    page: number;
    limit: number;
    total: number;
    transactions: Transaction[];
    items: Record<string, Bucket>;
    accounts: Record<string, Account>;
    categories: Record<string, Category>;
    buckets: Record<string, Bucket>;
}
export interface FundingSchedule {
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
export interface Recurrence {
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
export interface BucketGroup {
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
export interface Bucket {
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
    kind: 'expense' | 'goal' | 'vault';
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
export interface AccountsResponse {
    page: number;
    limit: number;
    total: number;
    items: Account[];
    has_subscription: boolean;
}
export interface ItemRefresh {
    id: string;
    institution_name: string;
    institution_logo: string;
    refresh_cost: number;
    can_refresh: boolean;
    last_provider_sync: string;
    last_das_sync: string;
}
export interface RefreshesResponse {
    premium_rolling_days: number;
    premium_rolling_credits: number;
    has_premium_refreshes: boolean;
    premium_upsell: string;
    next_credits: string[];
    credit_balance: number;
    refresh_balance: number;
    can_manage_refreshes: boolean;
    item_refreshes: ItemRefresh[];
}
export interface ContextMember {
    id: string;
    is_owner: boolean;
    email: string;
    first: string;
    last: string;
    photo_url: string | null;
    phone_number: string | null;
    timezone: string;
    mx_guid: string | null;
    added_at: string;
    user_id: string;
    context_id: string;
}
export interface ContextSummary {
    id: string;
    available_checking: string;
    current_checking: string;
    free_to_spend: string;
    available_savings: string;
    current_savings: string;
    free_to_save: string;
    limit_credit: string;
    current_credit: string;
    free_to_credit: string;
    expenses: string;
    goals: string;
    vaults: string;
}
export interface Subscription {
    id: string;
    created_at: string;
    updated_at: string;
    removed_at: string | null;
    started_at: string;
    ends_at: string;
    renews_at: string;
    user_id: string;
    external_id: string;
    frequency: string;
    account_limit: number;
    tier: string;
    sku: string;
    platform: string;
    cancellable: boolean;
    switchable: boolean;
    paused: boolean;
    can_resubscribe: boolean;
    has_subscribed: boolean;
    can_manage_refreshes: boolean;
}
export interface Budget {
    id: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    photo_url: string | null;
    name: string;
    name_clean: string;
    subscription_id: string;
    members: ContextMember[];
    invite_pending: boolean;
    is_owner: boolean;
    context_summary: ContextSummary;
    subscription: Subscription;
}
export interface BudgetsResponse {
    items: Budget[];
}
export declare const FREE_TO_SPEND = "FREE_TO_SPEND";
export interface TransactionsOptions {
    since?: number;
    budgetId?: string;
}
export interface AssignTransactionOptions {
    transactionId: string;
    bucketId: string | typeof FREE_TO_SPEND;
    budgetId?: string;
}
export interface ApiOptions {
    budgetId?: string;
}
export interface RefreshOptions extends ApiOptions {
    itemId: string;
    usePremium?: boolean;
}
export interface ItemsResponse {
    page: number;
    limit: number;
    total: number;
    items: AccountItem[];
    has_subscription: boolean;
}
