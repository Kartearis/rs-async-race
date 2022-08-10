export enum EventTypes {
    pageChange = 'change',
    totalChange = 'totalChange',
}

export type Handler = (currentPage?: number, totalPages?: number) => void;

export default class PaginationController {
    #pageNumber: number;
    #totalPages: number;
    #handlers: {
        change: Handler[];
        totalChange: Handler[];
        [key: string]: Handler[];
    };

    // Pages are indexed from 1
    constructor(totalPages = 1) {
        this.#pageNumber = 1;
        this.#totalPages = totalPages;
        this.#handlers = {
            change: [],
            totalChange: [],
        };
    }

    set totalPages(total: number) {
        if (total === this.#totalPages) return;
        if (total <= 1)
            total = 1;
        this.#totalPages = total;
        this.#handlers.totalChange.forEach((handler: Handler) => handler(this.#pageNumber, this.#totalPages));
    }

    get totalPages(): number {
        return this.#totalPages;
    }

    set pageNumber(page: number) {
        if (page >= 1 && page <= this.#totalPages) {
            this.#pageNumber = page;
            this.#handlers.change.forEach((handler: Handler) => handler(this.#pageNumber, this.#totalPages));
        }
    }

    get pageNumber(): number {
        return this.#pageNumber;
    }

    addHandler(eventType: EventTypes, handler: Handler): void {
        if (!this.#handlers[eventType].includes(handler)) this.#handlers[eventType].push(handler);
    }

    clearHandlers(eventType: EventTypes): void {
        this.#handlers[eventType] = [];
    }

    next(): void {
        if (this.#pageNumber < this.#totalPages) {
            this.#pageNumber += 1;
            this.#handlers.change.forEach((handler: Handler) => handler(this.#pageNumber, this.#totalPages));
        }
    }

    previous(): void {
        if (this.#pageNumber > 1) {
            this.#pageNumber -= 1;
            this.#handlers.change.forEach((handler: Handler) => handler(this.#pageNumber, this.#totalPages));
        }
    }

    goto(page: number) {
        if (page === this.#pageNumber) return;
        if (page >= 1 && page <= this.#totalPages) {
            this.#pageNumber = page;
            this.#handlers.change.forEach((handler: Handler) => handler(this.#pageNumber, this.#totalPages));
        }
    }
}
