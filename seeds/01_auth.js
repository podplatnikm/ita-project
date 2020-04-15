const bcrypt = require('bcryptjs');

exports.seed = function(knex) {
  return knex('memberships').del()
    .then(function () {
        return knex('accounts').del()
    })
      .then(function () {
          return knex('users').del()
      })
      .then(function () {
          return knex('users').insert([
              {id: 1, userName:'rulo', firstName: 'Mitja', lastName: 'Viler', email: 'mitja.viler@gmail.com', password: bcrypt.hashSync('testpassword', 8), active: true}
          ])
      })
      .then(function () {
          return knex('accounts').insert([
              {id: 1, name: 'user', planLevel: 0},
              {id: 2, name: 'restaurant', planLevel: 1},
              {id: 3, name: 'admin', planLevel: 2},
          ])
      })
      .then(function () {
          return knex('memberships').insert([
              {id: 1, user_id: 1, account_id: 3}
          ])
      })
};
