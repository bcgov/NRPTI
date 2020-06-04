'use strict'

var dbm
var type
var seed

const badString = "Penalty for failure to compluy with the Act or associated regulations"
const goodString = "Penalty for failure to comply with the Act or associated regulations"

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate
  type = dbm.dataType
  seed = seedLink
};

exports.up = async function(db) {
  const mClient = await db.connection.connect(db.connectionString, { native_parser: true })
  try {
    const nrptiCollection = await mClient.collection('nrpti')
    await nrptiCollection.updateMany({offence: badString}, { $set: { offence: goodString } })
    mClient.close()
  } catch (e) {
    console.log('Error', e)
    mClient.close()
  }
}

exports.down = function(db) {
  return null
}

exports._meta = {
  "version": 1
}
