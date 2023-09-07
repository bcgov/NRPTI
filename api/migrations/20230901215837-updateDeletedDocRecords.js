'use strict';

var dbm;
var type;
var seed;


/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};


exports.up = async function(db) {
  console.log('**** Updating Records with Deleted Attachments ****');
  const mClient = await db.connection.connect(db.connectionString, {
    native_parser: true
  });
  try {
  // Collection Names
  const redactedCollectionName = 'redacted_record_subset';
  const nrptiCollectionName = 'nrpti';

 
  

  const redactedCollection = await mClient.collection(redactedCollectionName);
  //const nrptiCollection = await mClient.collection(nrptiCollectionName);



  // Subquery to find _id values with schema 'Document' in both collections
  // const subquery = [
  //   { _schemaName: 'Document' },
  //   { _schemaName: 'Document' }
  // ];

  // const collectionResults = await redactedCollection.find({ $or: subquery }, { _id: 1 }).toArray();

  // const nrptiResults = await nrptiCollection.find({ $or: subquery }, { _id: 1 }).toArray();



    //console.log('inthen>>>>>')
    // Extract _id values from the subquery results
  //const validIds = [...new Set([...collectionResults, ...nrptiResults].map(item => item._id))];

  let redactedDocumentsIds =  await redactedCollection.find({_schemaName: 'Document'}).toArray();
  redactedDocumentsIds=redactedDocumentsIds.map(item => item._id);

   //console.log('validIdsCount= ' + validIds.length)

   console.log('redactedCount= ' + redactedDocumentsIds.length)

   console.log('redacted1=' + redactedDocumentsIds[0]);
   console.log('redacted2=' + redactedDocumentsIds[1]);
 
   const cursor =  redactedCollection.find({
      "documents": { "$exists": true, "$not": { "$size": 0 } }
   }); // You can specify a filter to narrow down the documents


console.log('before_cursor')
let ct = 0;
  await cursor.forEach(record => {   
      if(!redactedDocumentsIds.includes(record['documents'][0]))
      {
       console.log('in_if' + ct + 'documentid=' + record['documents'][0])
        // redactedCollection.updateOne(
        //       {_id: record._id},
        //       {$set: {documents: []}}
        //     )
      }
       else{
     console.log('in_else' + ct)
    }
//     const foundElement = redactedDocumentsIds.some(item => item === record['documents'][0]);
//     if (foundElement === undefined) {
//   // Element not found
//  // console.log('in_if' + ct + 'documentid=' + record['documents'][0])
// }
// else{
//   console.log('in_else' + ct + 'documentid=' + record['documents'][0])
// }
ct++;
    

  },
  () => {
    console.log('in_completion')
    // This is the completion callback, called when the iteration is complete
    mClient.close(); // Close the MongoDB client connection
    console.log('Done.');
  }
  );


  //mClient.close();
  } catch (err) {
    console.log('Error:', err);
  }
  
  // return null;

}

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
