#!/usr/bin/env node
import yargs = require('yargs/yargs');

const argv = yargs(process.argv.slice(2)).options({
    "postman-collection": { 
        type: 'string', 
        alias: ['pc'], 
        description: "A Postman collection JSON filepath",
        conflicts: ['openapi-spec']
    },
    "openapi-spec": { 
        type: 'string', 
        alias: ['oa'], 
        description: "An OpenAPI Specification filepath",
        conflicts:['postman-collection']
    }
}).argv;

console.log(argv)