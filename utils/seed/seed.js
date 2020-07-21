require('dotenv').config();
const path = require('path');
const { Seeder } = require('mongo-seeding');
const config = {
  database: process.env.DB_STRING,
  dropCollections: true
};

const seeder = new Seeder(config);
const collections = seeder.readCollectionsFromPath(path.resolve("./utils/seed/seeders"));

seeder
  .import(collections)
  .then(() => {
    console.log('Successful seed in database');
  })
  .catch(err => {
    console.log(err);
  });
