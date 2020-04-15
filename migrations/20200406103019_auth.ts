import * as Knex from 'knex';


export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('users', (table: Knex.TableBuilder) => {
        table.increments('id').primary();
        table.string('userName', 255).notNullable();
        table.string('firstName', 20);
        table.string('lastName', 30);
        table.string('email', 255).notNullable().unique();
        table.string('password').notNullable();
        table.boolean('active').notNullable();
        table.timestamps();
    }).createTable('accounts', (table: Knex.TableBuilder) => {
        table.increments('id').primary();
        table.string('name', 50).notNullable();
        table.integer('planLevel').notNullable();
    }).createTable('memberships', (table: Knex.TableBuilder) => {
        table.increments('id').primary();
        table.integer('user_id').references('users.id');
        table.integer('account_id').references('accounts.id');
    })
}


export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTable('memberships').dropTable('users').dropTable('accounts');
}

