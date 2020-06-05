'use strict'

var dbm
var type
var seed

var ObjectId = require('mongodb').ObjectID

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate
  type = dbm.dataType
  seed = seedLink
}

exports.up = async function(db) {
  const mClient = await db.connection.connect(db.connectionString, { native_parser: true })
  try {
    const nrptiCollection = await mClient.collection('nrpti')

    const currentCGLRecords = await nrptiCollection.find({sourceSystemRef: { $in: ['lng-csv']}, _epicProjectId: new ObjectId("588511c4aaecd9001b825604")}).toArray()
    const currentLNGRecords = await nrptiCollection.find({sourceSystemRef: { $in: ['lng-csv']}, _epicProjectId: new ObjectId("588510cdaaecd9001b815f84")}).toArray()
    const currentActivityRecords = await nrptiCollection.find({_schemaName: 'ActivityLNG'}).toArray()

    for (let i = 0; i < currentCGLRecords.length; i++) {
      // Swap the _epicProjectID and projectName
      const _id = new ObjectId(currentCGLRecords[i]._id)
      await nrptiCollection.update({ _id: _id },
                                   { $set: { _epicProjectId: new ObjectId("588510cdaaecd9001b815f84"), projectName: "LNG Canada" }
      })
    }

    for (let x = 0; x < currentLNGRecords.length; x++) {
      // Swap the _epicProjectID and projectName
      const _id = new ObjectId(currentLNGRecords[x]._id)
      await nrptiCollection.update({ _id: _id },
                                   { $set: { _epicProjectId: new ObjectId("588511c4aaecd9001b825604"), projectName: "Coastal Gaslink" }
      })
    }

    for (let z = 0; z < currentActivityRecords.length; z++) {
      // Check the URL, grab set correct objectid
      const _id = new ObjectId(currentActivityRecords[z]._id)
      const swappedID = currentActivityRecords[z].url.includes('/project/1') ? new ObjectId("588510cdaaecd9001b815f84") : new ObjectId("588511c4aaecd9001b825604")
      await nrptiCollection.update({ _id: _id },
                                   { $set: { _epicProjectId: swappedID }
      })
    }
    mClient.close()
  } catch (e) {
    console.log('Error:', e)
    mClient.close()
  }
};

exports.down = function(db) {
  return null
}

exports._meta = {
  "version": 1
}
