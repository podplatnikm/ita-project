import Knex from 'knex'
import Bookshelf from 'bookshelf';
import {development} from '../../knexfile';

export default class Database {
    private static instance : Database;

    private readonly knex : any = null;

    private readonly bookshelf : any = null;

    private constructor(){
        this.knex = Knex(development);
        this.bookshelf = Bookshelf(this.knex);
    }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }

        return Database.instance;
    }


    public getBookshelf(): any {
        return this.bookshelf;
    }
}
