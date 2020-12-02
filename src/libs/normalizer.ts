import { NormalizedContent } from "../interfaces";

export class Normalizer {
    raw: any;
    
    constructor(data: any) {
        this.raw = data;
    }

    normalize() {
        throw new Error(`Normalizor base class should be extended`)
    }
}