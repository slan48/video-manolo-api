require('dotenv').config();
const path = require('path');
const { Seeder } = require('mongo-seeding');
const config = {
  database:
      process.env.NODE_ENV === 'testing' ? process.env.DB_STRING_TEST :
      process.env.NODE_ENV === 'production' ? process.env.DB_STRING_PROD :
      process.env.DB_STRING,
  dropCollections: true
};

const seeder = new Seeder(config);
const collections = seeder.readCollectionsFromPath(path.resolve("./utils/seed/seeders"));

const seederImport = seeder.import(collections)
  .then(() => {
    console.log('Successful seed in database');
  })
  .catch(err => {
    console.log(err);
  });

module.exports = seederImport;
