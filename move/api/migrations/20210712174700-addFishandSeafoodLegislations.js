'use strict';

// list all collections that require this migration
const collections = ['nrpti', 'redacted_record_subset']

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function (options, seedLink) { };

exports.up = async function (db) {
  console.log('**** Adding new Fish and Seafood Act Legislation ****');

  const mClient = await db.connection.connect(db.connectionString, {
    native_parser: true
  });

  // Records issued under the following sections of the Fish and Seafood Act may need updating in this migration:
  // 3, 14, 15(2), 16, 17(1), 17(2), 19, 54(2)(a)

  // Records issued under the following sections of the Fish and Seafood Licencing Registration may need updating in this migration:
  // 53(1)(b)

  for (let collection of collections) {

    try {
      let currentCollection = await mClient.collection(collection);

      console.log(`Collection: ${collection}`);

      // No records exist under Fish and Seafood Act Section 3 but we will check just in case

      await currentCollection.updateMany(
        {
          $and: [
            { 'legislation.act': 'Fish and Seafood Act' },
            { 'legislation.section': '3' },
          ]
        },
        { $set: { offence: 'Fail to ensure fish or aquatic plants safe for, or not to be distributed for, human consumption' } }
      );

      await currentCollection.updateMany(
        {
          $and: [
            { 'legislation.act': 'Fish and Seafood Act' },
            { 'legislation.section': '4' },
          ]
        },
        { $set: { offence: 'Fail to be licensed' } }
      );

      await currentCollection.updateMany(
        {
          $and: [
            { 'legislation.act': 'Fish and Seafood Act' },
            { 'legislation.section': '14' },
          ]
        },
        { $set: { offence: 'Fail to comply with Act, regulations or licence' } }
      );

      await currentCollection.updateMany(
        {
          $and: [
            { 'legislation.act': 'Fish and Seafood Act' },
            { 'legislation.section': '15' },
            { 'legislation.subSection': '2' },
          ]
        },
        { $set: { offence: 'Fail to conduct prescribed analyses or monitoring' } }
      );

      await currentCollection.updateMany(
        {
          $and: [
            { 'legislation.act': 'Fish and Seafood Act' },
            { 'legislation.section': '16' },
          ]
        },
        { $set: { offence: 'Fail to meet requirements respecting facilities, vehicles or equipment' } }
      );

      // Wording for Sections 17(1) 17(2), and 19 have not changed in this update but we will check just in case

      await currentCollection.updateMany(
        {
          $and: [
            { 'legislation.act': 'Fish and Seafood Act' },
            { 'legislation.section': '17' },
            { 'legislation.subSection': '1' },
          ]
        },
        { $set: { offence: 'Fail to keep or produce records' } }
      );

      await currentCollection.updateMany(
        {
          $and: [
            { 'legislation.act': 'Fish and Seafood Act' },
            { 'legislation.section': '17' },
            { 'legislation.subSection': '2' },
          ]
        },
        { $set: { offence: 'Fail to make reports' } }
      );

      await currentCollection.updateMany(
        {
          $and: [
            { 'legislation.act': 'Fish and Seafood Act' },
            { 'legislation.section': '19' },
          ]
        },
        { $set: { offence: 'Fail to meet traceability requirements' } }
      );

      // There are no entries in either table under Fish and Seafood Act section 21, though there are entries in the database

      // No records exist under Fish and Seafood Act Section 54(2)(a) but we will check just in case

      await currentCollection.updateMany(
        {
          $and: [
            { 'legislation.act': 'Fish and Seafood Act' },
            { 'legislation.section': '54' },
            { 'legislation.subSection': '2' },
            { 'legislation.paragraph': 'a' },
          ]
        },
        { $set: { offence: 'Fail to meet traceability requirements' } }
      );

      // No records exist under Fish and Seafood Act Section 54(2)(a) but we will check just in case

      await currentCollection.updateMany(
        {
          $and: [
            { 'legislation.regulation': 'Fish and Seafood Licensing Regulation' },
            { 'legislation.section': '53' },
            { 'legislation.subSection': '1' },
            { 'legislation.paragraph': 'b' },
          ]
        },
        { $set: { offence: 'Receive bivalves in improperly tagged containers' } }
      );

      await currentCollection.updateMany(
        {
          $and: [
            { 'legislation.regulation': 'Fish and Seafood Licensing Regulation' },
            { 'legislation.section': '16' },
          ]
        },
        {
          $set: {
            offence: 'Operate as fish vendor without licence',
            'legislation.subSection': '1',
            'legislation.paragraph': 'a'
          },
        }
      );

      await currentCollection.updateMany(
        {
          $and: [
            { 'legislation.regulation': 'Fish and Seafood Licensing Regulation' },
            { 'legislation.section': '21' },
          ]
        },
        {
          $set: {
            offence: 'Operate as fish receiver without licence',
            'legislation.subSection': '1',
            'legislation.paragraph': 'a'
          },
        }
      );

      await currentCollection.updateMany(
        {
          $and: [
            { 'legislation.regulation': 'Fish and Seafood Licensing Regulation' },
            { 'legislation.section': '25' },
          ]
        },
        {
          $set: {
            offence: 'Fail to keep records',
            'legislation.subSection': '1',
          },
        }
      );

      await currentCollection.updateMany(
        {
          $and: [
            { 'legislation.regulation': 'Fish and Seafood Licensing Regulation' },
            { 'legislation.section': '27' },
          ]
        },
        {
          $set: {
            offence: 'Operate as seafood processor without licence',
            'legislation.subSection': '',
            'legislation.paragraph': 'a',
          },
        }
      );

      await currentCollection.updateMany(
        {
          $and: [
            { 'legislation.regulation': 'Fish and Seafood Licensing Regulation' },
            { 'legislation.section': '54' },
            { 'legislation.subSection': '2' },
          ]
        },
        {
          $set: {
            offence: 'Fail to properly label sport caught fish container',
          },
        }
      );

      await currentCollection.updateMany(
        {
          $and: [
            { 'legislation.regulation': 'Fish and Seafood Licensing Regulation' },
            { 'legislation.section': '56' },
            { 'legislation.subSection': '2' },
          ]
        },
        {
          $set: {
            offence: 'Fail to keep complete records',
          },
        }
      );

      await currentCollection.updateMany(
        {
          $and: [
            { 'legislation.regulation': 'Fish and Seafood Licensing Regulation' },
            { 'legislation.section': '59' },
            { 'legislation.subSection': '1' },
          ]
        },
        {
          $set: {
            offence: 'Fail to meet temperature requirements',
          },
        }
      );

      await currentCollection.updateMany(
        {
          $and: [
            { 'legislation.regulation': 'Fish and Seafood Licensing Regulation' },
            { 'legislation.section': '66' },
          ]
        },
        {
          $set: {
            offence: 'Fail to submit report',
            'legislation.subSection': '1',
          },
        }
      );

    } catch (err) {
      console.log(`Error adding new legislation (${collection}): ${err}`);
    }
  }

  console.log(`**** Finished adding new Fish and Seafood Act Legislation ****`);
  mClient.close();

  return null;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  "version": 1
};