import DasBudget from './index';
import axios from 'axios';
import { FREE_TO_SPEND } from './index';

export class Transaction {
    private client: DasBudget;

    constructor(private data: any, client: DasBudget) {
        this.client = client;
    }

    // Getters
    get id(): string {
        return this.data.id;
    }
    get name(): string {
        return this.data.name;
    }
    get notes(): string | null {
        return this.data.notes;
    }
    get amount(): string {
        return this.data.amount;
    }
    get bucketId(): string | null {
        return this.data.bucket_id;
    }
    get accountId(): string {
        return this.data.account_id;
    }
    get pending(): boolean {
        return this.data.pending;
    }
    get postedDate(): string {
        return this.data.posted_date;
    }
    get authorizedDate(): string {
        return this.data.authorized_date;
    }
    get rawName(): string {
        return this.data.data.raw_name;
    }
    get merchantName(): string {
        return this.data.metadata.merchant_name;
    }

    // Methods
    async updateNote(note: string): Promise<void> {
        await this.client.ensureValidToken();

        try {
            // Create a copy of the transaction data with the updated note
            const updatedData = { ...this.data, notes: note };

            // Send PUT request to update the transaction
            await axios.put(
                `${this.client.baseUrl}/api/transaction/${this.id}?remember_category=false&remember_name=false`,
                updatedData,
                {
                    headers: this.client.getHeaders(),
                }
            );

            // Update the local data
            this.data.notes = note;
        } catch (error) {
            this.client.log('Error updating transaction note');
            throw error;
        }
    }

    async assignToBucket(
        bucket: string | typeof FREE_TO_SPEND | Bucket
    ): Promise<Transaction> {
        const bucketId = bucket instanceof Bucket ? bucket.id : bucket;
        return this.client.assignTransactionToBucket(this.id, bucketId);
    }
}

export class Account {
    private client: DasBudget;

    constructor(private data: any, client: DasBudget) {
        this.client = client;
    }

    // Getters
    get id(): string {
        return this.data.id;
    }
    get name(): string {
        return this.data.name;
    }
    get officialName(): string {
        return this.data.official_name;
    }
    get availableBalance(): string {
        return this.data.available_balance;
    }
    get currentBalance(): string {
        return this.data.current_balance;
    }
    get type(): string {
        return this.data.type;
    }
    get mask(): string {
        return this.data.mask;
    }
    get active(): boolean {
        return this.data.active;
    }
    get spendable(): boolean {
        return this.data.spendable;
    }
    get isOwner(): boolean {
        return this.data.is_owner;
    }

    // Methods
    async getTransactions(options?: {
        since?: number;
    }): Promise<Transaction[]> {
        return this.client.transactions(options);
    }
}

export class Bucket {
    private client: DasBudget;

    constructor(private data: any, client: DasBudget) {
        this.client = client;
    }

    // Getters
    get id(): string {
        return this.data.id;
    }
    get name(): string {
        return this.data.name;
    }
    get notes(): string {
        return this.data.notes;
    }
    get targetAmount(): string {
        return this.data.target_amount;
    }
    get currentAmount(): string {
        return this.data.current_amount;
    }
    get kind(): 'expense' | 'goal' | 'vault' {
        return this.data.kind;
    }
    get contribution(): string {
        return this.data.contribution;
    }
    get paused(): boolean {
        return this.data.paused;
    }
    get offTrack(): boolean {
        return this.data.off_track;
    }

    // Methods
    async updateNote(note: string): Promise<void> {
        // TODO: Implement note update
        throw new Error('Not implemented');
    }

    async getTransactions(): Promise<Transaction[]> {
        // TODO: Implement getting transactions for this bucket
        throw new Error('Not implemented');
    }
}
