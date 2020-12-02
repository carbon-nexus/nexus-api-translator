import { Normalizer } from "./normalizer";
import { NormalizedContent, Variables, ResponseDefinitionExtended } from "../interfaces";
import { RequestDefinition, ItemGroupDefinition, ItemDefinition, CollectionDefinition, HeaderDefinition } from "postman-collection";
// import { URL } from 'whatwg-url';
import { URL, URLSearchParams } from "url";

export class PostmanNormalizer extends Normalizer {
    normalized: NormalizedContent;
    variables: Variables = {};

    constructor(data: CollectionDefinition) {
        super(data)
        this.setVariables();
    }

    normalize() {
        let routes = [].concat(...this._formatItemGroup(this.raw.item));
        this.normalized = { 
            routes
        }
    }

    setVariables() {
        this.raw.variable.forEach((varMeta: any) => this.variables[varMeta.key] = varMeta.value)
    }

    _constructHeaders(headers: HeaderDefinition[]) {
        let r: any = {};
        headers.forEach(h => {
            r[<string>h.key?.toLowerCase()] = h.value
        });
        return r;
    }

    _constructParams(url: string) {
        let params:any = { path: [], query: []};
        let matches = url.matchAll(/\{([a-zA-Z][a-zA-Z0-9\-_]+)\}/g);
        for (const match of matches) {
            params.path.push(match[1]);
        }
        let search = new URL(url).search
        let keys =  new URLSearchParams(search).keys()
        for( let key of keys) {
            params.query.push(key)
        }
        return params;
    }

    _formatRequest(request: RequestDefinition) {
        const url = this._replaceVar(<any>request.url);
        const params = this._constructParams(url);
        const headers = (request.header && request.header.length > 0) 
            ? this._constructHeaders(<HeaderDefinition[]>request.header)
            : {}
        const body = (headers['content-type'] === 'application/json') 
            ? JSON.parse(<string>request.body?.raw) 
            : request.body?.raw;
        const auth = { type: request.auth?.type }
        return { 
            url, 
            headers, 
            method: request.method,
            body,
            auth,
            params

        }
    }
    
    _formatResponse(response: ResponseDefinitionExtended ) {
        let body:any;
        const headers = (response.header && response.header.length > 0) 
            ? this._constructHeaders(<HeaderDefinition[]>response.header)
            : {}
        body = (response.body && (headers['content-type'] === 'application/json' || response["_postman_previewlanguage"] === "json"))
            ? JSON.parse(<string>response.body) 
            : response.body;
        return {
            name: response.name,
            code: response.code,
            cookies: response.cookie,
            headers,
            body
        }
    }

    _formatItemGroup(meta: ItemGroupDefinition): any {
        if (Array.isArray(meta)) return meta.map(this._formatItemGroup.bind(this))
        if (meta.item && Array.isArray(meta.item)) return this._formatItemGroup(<ItemGroupDefinition>meta.item)
        else return this._formatItem(meta)
    }

    _formatItem(item: ItemDefinition) {
        let ret: {request: any, response: any[], name: string } = { request: {}, response: [], name: item.name || "na"}
        if (item.request) ret.request = this._formatRequest(item.request);
        if (item.response) ret.response = item.response.map(r => this._formatResponse(<ResponseDefinitionExtended>r));
        return ret;
    }

    _replaceVar(url: any) {
        let update = url.raw.replace(/\{\{(.*?)\}\}/g, (match: string, p1: any) => {
            if(this.variables[p1]) return this.variables[p1];
            else return match
        }) 
        return update.replace(/:([a-zA-Z][a-zA-Z0-9\-_]+)/g, (match: string, p1: any) => `{${p1}}`)
    }
}