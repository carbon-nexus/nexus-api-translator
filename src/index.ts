#!/usr/bin/env node
import yargs = require('yargs/yargs');
import { Processor } from './processor';

async function main() {
    const argv = yargs(process.argv.slice(2)).options({
        "openapi-spec": { 
            type: 'string', 
            alias: ['oa'], 
            description: "An OpenAPI Specification filepath",
            conflicts:['postman-collection']
        },
        "openapi-spec-version": {
            type: 'string', 
            alias: ['oav'], 
            default: '3.0.3',
            description: "The OpenAPI Specification version",
        },
        "postman-collection": { 
            type: 'string', 
            alias: ['pc'], 
            description: "A Postman collection JSON filepath",
            conflicts: ['openapi-spec']
        },
        "postman-collection-version": {
            type: 'string', 
            alias: ['pcv'], 
            default: '2.1.0',
            description: "The Postman collection version",
        }
    }).argv;
    
    let processor = new Processor(argv);
    await processor.translate();
}

main();