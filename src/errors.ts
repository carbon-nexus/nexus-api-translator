export class TranslationError extends Error {
    constructor(msg: string) {
        super(msg);
        this.name = 'TranslationError';
    }
}