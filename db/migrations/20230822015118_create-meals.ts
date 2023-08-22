import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table.text('name').notNullable()
    table.text('description').notNullable()
    table.date('date_and_time').defaultTo(knex.fn.now()).notNullable()
    table.boolean('is_on_diet').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    table.uuid('user_id').index().references('id').inTable('users')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}
