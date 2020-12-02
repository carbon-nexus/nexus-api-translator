import { ResponseDefinition } from "postman-collection";

export interface Args {
    'openapi-spec'?: string;
    'openapi-spec-version'?: string;
    'postman-collection'?: string;
    'postman-collection-version'?: string;
}

export interface ValidatorOptions {
    subject: string;
    version: string;
    data: any;
}

export interface NormalizedContent {
    routes: Route[];
}

export interface Route {
    endpoint: string;
    headers?: header[];
    parameters?: parameter[];
}

export interface header {
    [headerKey: string]: string;
    authorization: string;
    'content-type': string;
}

export interface parameter {
    in: "path" | "querystring" | "header"
}

export interface Variables {
    [variableName: string]: string
}

export interface ResponseDefinitionExtended extends ResponseDefinition {
    '_postman_previewlanguage': string;
}