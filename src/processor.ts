import { Args } from './interfaces'
import { TranslationError } from './errors';
import { FileHelper, Validator } from './helpers';
import { PostmanNormalizer } from './libs/postman-normalizer';
import { render, filters } from 'squirrelly';
import { URL } from 'whatwg-url';
import { safeDump } from 'js-yaml';

export class Processor {
    postmanCollection: string | undefined;
    openapiSpec: string | undefined;
    fileHelper: FileHelper;
    _args: Args;

    constructor(args: Args) {
        this._args = args;
        this.postmanCollection = args['postman-collection'];
        this.openapiSpec = args['openapi-spec'];
        this.fileHelper = new FileHelper();
        this.constructTemplateFilters()
    }

    constructTemplateFilters() {
        filters.define("path", (content: string) => decodeURI(new URL(content).pathname))
        filters.define("yaml", (content: string) => safeDump(JSON.parse(content),{flowLevel: 6}));
        filters.define("json", (content: any) => JSON.stringify(content,null,2))
    }

    translate() {
        if(this.postmanCollection) this.translatePostmanCollection();
        else if(this.openapiSpec) this.translateOpenapiSpec();
        else throw new TranslationError(`Only support for translations for Postman or OpenApi`);
    }

    async translatePostmanCollection() {
        const version = this._args["postman-collection-version"] || "na";
        const collection = JSON.parse(await this.fileHelper.readFile(this.postmanCollection))
        const validator = new Validator({
            subject: 'postman', 
            version,
            data: collection
        })
        await validator.validate()
        const normalizer = new PostmanNormalizer(collection);
        normalizer.normalize()
        // console.log(JSON.stringify(normalizer.normalized,null,2))
        let results = await this.renderOpenApiSpec(normalizer.normalized)
        console.log(results)
        // console.log(collection)
    }

    async translateOpenapiSpec() {
        let contents = await this.fileHelper.readFile(this.openapiSpec)
    }

    async renderOpenApiSpec(data: any) {
        const filepath = `${__dirname}/templates/openapi/303.template`;
        let template = await this.fileHelper.readFile(filepath)
        return this.render(template, data)
    }

    render(template:any, data: any) {
        return render(template, data);
    }
}