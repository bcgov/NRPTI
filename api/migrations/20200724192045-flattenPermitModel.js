'use strict';

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

let dbm;
let type;
let seed;

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
  let mClient;

  console.log('*************************************');
  console.log('** Starting Core amendment flatten **');
  console.log('*************************************');

  try {
    mClient = await db.connection.connect(db.connectionString, { native_parser: true });
    const nrpti = mClient.collection('nrpti');

    // pull every BCMI permit object (permit+flavour)
    console.log('Fetching Permits, Amendments and associated flavours...');
    let corePermits = await nrpti.find({ _schemaName: 'Permit', sourceSystemRef: 'core' }).toArray();
    // Fetch the permits flavour and amendment objects. locate the "parent" permit, if it exists
    for(const permit of corePermits) {
      // fetch the permit BCMI flavour
      // We're making a "safe" assumption here that permits loaded by core only have the
      // BCMI flavour. They should never have any others... if they do that's a problem!
      let flavour = await nrpti.findOne({ _id: new ObjectId(permit._flavourRecords[0]) });
      if (flavour) {
        const amendments = [];
        let originalPermit = null;

        for(const amendmentGuid of permit.permitAmendments) {
          // load all the permits, identify the OG
          // Note the amendmentGuid will be the flavour, so we need to find the source
          // Permit Amendment record by going in reverse...
          const permitAmendmentFlavour = await nrpti.findOne({ _id: new ObjectId(amendmentGuid) });
          const permitAmendment = await nrpti.findOne({ _flavourRecords: { $in: [new ObjectId(amendmentGuid)] }});
          if (permitAmendment && permitAmendmentFlavour) {
            originalPermit = permitAmendment.typeCode.toUpperCase() === 'OGP' ? { record: permitAmendment, flavour: permitAmendmentFlavour } : null;
            if (!originalPermit) {
              amendments.push({ record: permitAmendment, flavour: permitAmendmentFlavour });
            }
          } else {
            console.log('Could not find record or flavour doc for amendment!');
          }
        }

        // We now have a Permit, flavour, amendment list with flavours, and identified the original permit (if it's available)
        // We can now flatten and create the Parent Permit object, if it exists
        if (originalPermit) {
          originalPermit = await createPermits(nrpti, permit, flavour, null, originalPermit);
          // originalPermit should now be the ObjectID guid to associate for all
          // amendment documents
        }

        // with the OGP defined (if there is one), we'll now iterate over the amendments and flatten them
        // if we have an OGP, that ID will be passed in and applied to the newly created records.
        for(const amendment of amendments) {
          await createPermits(nrpti, permit, flavour, originalPermit, amendment);
        }

        // Model is flattended and new objects are created. Old objects are all deleted
        // delete the root permit object (+flavour)
        await nrpti.remove({ _id: new ObjectId(flavour._id) });
        await nrpti.remove({ _id: new ObjectId(permit._id) });
        // and repeat!
      } else {
        console.log('No flavour record found for the permit. Ignoring...');
      }
    }
  } catch(err) {
    console.error(' ##########################################');
    console.error(' ## Error during Permit model restructuring: ' + err);
    console.error(' ##########################################');
  }

  console.log('*************************************');
  console.log('** Finished Core amendment flatten **');
  console.log('*************************************');

  mClient.close();
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};

async function createPermits(nrpti, permit, permitFlavour, originalPermitRef, amendment) {
  let ogGuid;
  if (amendment.flavour.amendmentDocuments && amendment.flavour.amendmentDocuments.length > 0) {
    // iterate the amendment documents. We'll need to create one Permit/PermitBCMI per document
    for(const doc of amendment.flavour.amendmentDocuments) {
      // we've got a document!
      // Create a flavour PermitBCMI
      let newFlavour = await createPermitFlavour(nrpti, permitFlavour, originalPermitRef, amendment, doc);
      // Create a master Permit
      let newMaster = await createPermitMaster(nrpti, permit, newFlavour, amendment);
      // The permit that has the OGP type might have multiple documents... meaning that any one of them
      // could the OG of the OG permits. We have no way to know which one it is, so we'll just keep the
      // ID of the last one to return (only relevent if this is a call to build the OG)
      ogGuid = newMaster;
      // master and flavour have been created from a combination of
      // the permit, permit flavour, amendment, and amendment flavour.
      // Original doc has been re-assigned to the new flavour
    }
  } else {
    console.log('Uh oh, found an amendment with no documents? Lets create a new permit/flavour with the new model anyway...');
    // this amendment doesn't have any documents associated with it?!?
    // Just create a single record
    let newFlavour = await createPermitFlavour(nrpti, permitFlavour, originalPermitRef, amendment, null);
    // Create a master Permit
    let newMaster = await createPermitMaster(nrpti, permit, newFlavour, amendment);
    ogGuid = newMaster;
  }
  // We've created a master and flavour Permit for each document.
  // We can now delete the original amendment record and flavour
  await nrpti.remove({ _id: new ObjectId(amendment.flavour._id) });
  await nrpti.remove({ _id: new ObjectId(amendment.record._id) });

  // we need to return something to declare as the "OG" if this is creating
  // an OGP. May as well return the last thing created.
  return ogGuid;
}

async function createPermitFlavour(nrpti, permitFlavour, originalPermitRef, amendment, doc) {
  let PermitBCMI = require('../src/models/bcmi/index.js').permitBCMI;
  let permitBCMI = new PermitBCMI();

  permitBCMI._schemaName = 'PermitBCMI';

  // set integration references
  amendment.flavour._sourceRefId && (permitBCMI._sourceRefId = amendment.flavour._sourceRefId);

  // set permissions and meta
  permitBCMI.read = amendment.flavour.read;
  permitBCMI.write = amendment.flavour.write;
  permitBCMI.datePublished = amendment.flavour.datePublished;
  permitBCMI.publishedBy = amendment.flavour.publishedBy;

  permitBCMI.addedBy = amendment.flavour.addedBy;
  permitBCMI.dateAdded = amendment.flavour.dateAdded;

  // set master data
  permitBCMI.recordType = 'Permit';
  permitFlavour.recordName && (permitBCMI.recordName = permitFlavour.recordName);
  permitFlavour.recordSubtype && (permitBCMI.recordSubtype = permitFlavour.recordSubtype);
  permitFlavour.dateIssued && (permitBCMI.dateIssued = permitFlavour.dateIssued);
  permitFlavour.issuingAgency && (permitBCMI.issuingAgency = permitFlavour.issuingAgency);
  permitFlavour.legislation && permitFlavour.legislation.act && (permitBCMI.legislation.act = permitFlavour.legislation.act);
  permitFlavour.legislation && permitFlavour.legislation.regulation && (permitBCMI.legislation.regulation = permitFlavour.legislation.regulation);
  permitFlavour.legislation && permitFlavour.legislation.section && (permitBCMI.legislation.section = permitFlavour.legislation.section);
  permitFlavour.legislation && permitFlavour.legislation.subSection && (permitBCMI.legislation.subSection = permitFlavour.legislation.subSection);
  permitFlavour.legislation && permitFlavour.legislation.paragraph && (permitBCMI.legislation.paragraph = permitFlavour.legislation.paragraph);
  permitFlavour.legislationDescription && (permitBCMI.legislationDescription = permitFlavour.legislationDescription);
  permitFlavour.projectName && (permitBCMI.projectName = permitFlavour.projectName);
  permitFlavour.location && (permitBCMI.location = permitFlavour.location);
  permitFlavour.centroid && (permitBCMI.centroid = permitFlavour.centroid);
  permitFlavour.documents && (permitBCMI.documents = permitFlavour.documents);

  // set flavour data
  permitFlavour.mineGuid && (permitBCMI.mineGuid = permitFlavour.mineGuid);
  permitFlavour.permitNumber && (permitBCMI.permitNumber = permitFlavour.permitNumber);
  permitFlavour.statusCode && (permitBCMI.permitStatusCode = permitFlavour.statusCode);
  amendment.flavour.statusCode && (permitBCMI.amendmentStatusCode =  amendment.flavour.statusCode);
  amendment.flavour.typeCode && (permitBCMI.typeCode = amendment.flavour.typeCode);
  // originalPermit should be null unless the type is amendment
  originalPermitRef && amendment.flavour.typeCode.toUpperCase() === 'AMD' && (permitBCMI.originalPermit = new ObjectId(originalPermitRef));
  amendment.flavour.receivedDate && (permitBCMI.receivedDate = amendment.flavour.receivedDate);
  amendment.flavour.issueDate && (permitBCMI.issueDate = amendment.flavour.issueDate);
  amendment.flavour.authorizedEndDate && (permitBCMI.authorizedEndDate = amendment.flavour.authorizedEndDate);
  amendment.flavour.description && (permitBCMI.description = amendment.flavour.description);
  doc && (permitBCMI.amendmentDocument = doc);

  // set data source references
  amendment.flavour.sourceDateAdded && (permitBCMI.sourceDateAdded = amendment.flavour.sourceDateAdded);
  amendment.flavour.sourceDateUpdated && (permitBCMI.sourceDateUpdated = amendment.flavour.sourceDateUpdated);
  amendment.flavour.sourceSystemRef && (permitBCMI.sourceSystemRef = amendment.flavour.sourceSystemRef);

  await nrpti.insertOne(permitBCMI);

  return permitBCMI._id;
}

async function createPermitMaster(nrpti, permit, newFlavour, amendment) {
  let Permit = require('../src/models/master/index.js').permit;
  let master = new Permit();

  master._schemaName = 'Permit';

  // set integration references
  permit._epicProjectId &&
    ObjectId.isValid(permit._epicProjectId) &&
    (master._epicProjectId = new ObjectId(permit._epicProjectId));

  permit._epicMilestoneId &&
    ObjectId.isValid(permit._epicMilestoneId) &&
    (master._epicMilestoneId = new ObjectId(permit._epicMilestoneId));

  permit._sourceRefId && (master._sourceRefId = permit._sourceRefId);

  // set permissions
  master.read = permit.read;
  master.write = permit.write;

  master._flavourRecords.push(new ObjectId(newFlavour._id));

  // set data
  master.recordType = 'Permit';
  permit.recordName && (master.recordName = permit.recordName);
  permit.recordSubtype && (master.recordSubtype = permit.recordSubtype);
  permit.dateIssued && (master.dateIssued = permit.dateIssued);
  permit.issuingAgency && (master.issuingAgency = permit.issuingAgency);
  permit.legislation && permit.legislation.act && (master.legislation.act = permit.legislation.act);
  permit.legislation && permit.legislation.regulation && (master.legislation.regulation = permit.legislation.regulation);
  permit.legislation && permit.legislation.section && (master.legislation.section = permit.legislation.section);
  permit.legislation && permit.legislation.subSection && (master.legislation.subSection = permit.legislation.subSection);
  permit.legislation && permit.legislation.paragraph && (master.legislation.paragraph = permit.legislation.paragraph);
  permit.legislationDescription && (master.legislationDescription = permit.legislationDescription);
  permit.projectName && (master.projectName = permit.projectName);
  permit.location && (master.location = permit.location);
  permit.centroid && (master.centroid = permit.centroid);
  permit.documents && (master.documents = permit.documents);
  permit.mineGuid && (master.mineGuid = permit.mineGuid);
  permit.permitNumber && (master.permitNumber = permit.permitNumber);
  permit.status && (master.status = permit.status);

  // set meta
  master.addedBy = amendment.record.addedBy;
  master.dateAdded = amendment.record.dateAdded;

  // set data source references
  amendment.record.sourceDateAdded && (master.sourceDateAdded = amendment.record.sourceDateAdded);
  amendment.record.sourceDateUpdated && (master.sourceDateUpdated = amendment.record.sourceDateUpdated);
  amendment.record.sourceSystemRef && (master.sourceSystemRef = amendment.record.sourceSystemRef);
  amendment.record.isLngPublished && (master.isLngPublished = amendment.record.isLngPublished);

  await nrpti.insertOne(master);

  return master._id;
}
