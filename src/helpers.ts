import { readFile, access } from 'fs/promises';
import { constants } from 'fs';
import Ajv from 'ajv';
import { ValidatorOptions } from './interfaces';

export class FileHelper {
    constructor() { }

    async checkFileExistence(filepath: string) {
        return access(filepath, constants.F_OK).catch(() => {
            throw new Error(`${filepath} does not exist`)
        })
    }

    readFile(filepath: string | undefined): Promise<string> {
        if (!filepath) throw new Error('Received undefined for filepath');
        return readFile(filepath).then((buf: Buffer) => { return buf.toString() });
    }

    async parseJsonFile(filepath: string | undefined): Promise<string> {
        return JSON.parse(await this.readFile(filepath));
    }
}

export class Validator {
    subject: string;
    version: string;
    fileHelper: FileHelper;
    ajv: Ajv.Ajv;
    schema: any;
    data: any;

    constructor(options: ValidatorOptions) { 
        this.subject = options.subject;
        this.version = options.version;
        this.data = options.data
        this.fileHelper = new FileHelper();
        this.ajv = new Ajv();
    }

    async validate() {
        const filepath = `${__dirname}/schemas/${this.subject}/${this.version.replace(/\./g,'')}.json`;
        this.fileHelper.checkFileExistence(filepath).catch((err:Error) => {
            if (err.message.includes('does not exist')) throw new Error(`Schema missing: ${this.subject} with ${this.version} version does not exist`)
        })
        this.schema = await this.fileHelper.parseJsonFile(filepath);
        if(!this.ajv.validate(this.schema, this.data)) throw new Error(`The data provided is not compatible with '${this.subject}' schema with '${this.version}' version`);
    }
    
}