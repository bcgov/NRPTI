let defaultLog = require('winston').loggers.get('default');
let mongoose = require('mongoose');
let QueryActions = require('../utils/query-actions');
let QueryUtils = require('../utils/query-utils');
let qs = require('qs');
let mongodb = require('../utils/mongodb');
let moment = require('moment');

function isEmpty(obj) {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false;
    }
  }
  return true;
}

let generateExpArray = async function (field, prefix = '') {
  if (field && field != undefined) {
    let queryString = qs.parse(field);
    defaultLog.info("queryString:", queryString);
    // Note that we need map and not forEach here because Promise.all uses
    // the returned array!
    return await Promise.all(Object.keys(queryString).map(async item => {
      let entry = queryString[item];
      defaultLog.info("item:", item, entry);
      if (Array.isArray(entry)) {
        // Arrays are a list of options so will always be ors
        let orArray = entry.map(element => {
          return getConvertedValue(item, element);
        });
        return { $or: orArray };
      } else if (moment(entry, moment.ISO_8601).isValid()) {
        // Pluck the variable off the string because this is a date object.  It should
        // always start with either dateRangeFromFilter or _master.dateRangeFromFilter

        const dateRangeFromSearchString = prefix + 'dateRangeFromFilter';
        const dateRangeToSearchString = prefix + 'dateRangeToFilter';

        if (item.startsWith(dateRangeFromSearchString)) {
          const propertyName = item.substr(item.indexOf(dateRangeFromSearchString) + dateRangeFromSearchString.length);

          return handleDateStartItem(prefix + propertyName, entry);
        } else if (item.startsWith(dateRangeToSearchString)) {
          const propertyName = item.substr(item.indexOf('dateRangeToFilter') + 'dateRangeToFilter'.length);

          return handleDateEndItem(prefix + propertyName, entry);
        } else {
          // Invalid. return empty {}
          return {};
        }
      } else {
        return getConvertedValue(item, entry);
      }
    }));
  }
}

const getConvertedValue = function (item, entry) {
  if (isNaN(entry)) {
    if (mongoose.Types.ObjectId.isValid(entry)) {
      defaultLog.info("objectid", entry);
      // ObjectID
      return { [item]: mongoose.Types.ObjectId(entry) };
    } else if (entry === 'true') {
      defaultLog.info("bool");
      // Bool
      let tempObj = {}
      tempObj[item] = true;
      tempObj.active = true;
      return tempObj;
    } else if (entry === 'false') {
      defaultLog.info("bool");
      // Bool
      return { [item]: false };
    } else {
      defaultLog.info("string");
      return { [item]: entry };
    }
  } else {
    defaultLog.info("number");
    return { [item]: parseInt(entry) };
  }
}

const handleDateStartItem = function (field, entry) {
  let date = new Date(entry);

  // Validate: valid date?
  if (!isNaN(date)) {
    let start = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    return { [field]: { $gte: start } };
  }
}

const handleDateEndItem = function (field, entry) {
  let date = new Date(entry);

  // Validate: valid date?
  if (!isNaN(date)) {
    let end = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1);
    return { [field]: { $lt: end } };
  }
}

let searchCollection = async function (roles, keywords, schemaName, pageNum, pageSize, project, sortField = undefined, sortDirection = undefined, caseSensitive, populate = false, and, or) {
  let properties = undefined;
  if (project) {
    properties = { project: mongoose.Types.ObjectId(project) };
  }

  // optional search keys
  let searchProperties = undefined;
  if (keywords) {
    searchProperties = { $text: { $search: keywords, $caseSensitive: caseSensitive } };
  }

  // Pluck the _epicProjectId from the array if a flavour record query is coming in.
  const flavourRecords = [
    'InspectionLNG',
    'OrderLNG',
    'Certificate',
    'PermitLNG',
    'SelfReportLNG',
    'TicketLNG',
    'CourtConvictionLNG',
    'AdministrativePenaltyLNG',
    'AdministrativeSanctionLNG',
    'RestorativeJusticeLNG',
    'ConstructionPlanLNG',
    'ManagementPlanLNG',
    'AgreementLNG',
    'OrderNRCED',
    'InspectionNRCED',
    'RestorativeJusticeNRCED',
    'TicketNRCED',
    'AdministrativePenaltyNRCED',
    'AdministrativeSanctionNRCED',
    'WarningNRCED'
  ];

  let matches = await generateMatchesForAggregation(and, or, searchProperties, properties, schemaName, roles);

  defaultLog.info("mainMatch:", matches.mainMatch);
  defaultLog.info("masterMatch:", matches.masterMatch);

  let sortingValue = {};
  sortingValue[sortField] = sortDirection;

  let searchResultAggregation = [];
  // We don't want to have sort in the aggregation if the front end doesn't need sort.
  if (sortField && sortDirection) {
    searchResultAggregation.push(
      {
        $sort: sortingValue
      }
    );
  }
  searchResultAggregation.push(
    {
      $skip: pageNum * pageSize
    },
    {
      $limit: pageSize
    }
  );


  let aggregation = [
    {
      $match: matches.mainMatch
    }
  ];

  let collation = {
    locale: 'en',
    strength: 2
  };

  defaultLog.info('collation:', collation);

  // This only happens when we are getting queried from the LNG flavour perspective.
  if (schemaName.some(item => flavourRecords.includes(item))) {
    // Grab the master record that's backreferenced to these ones.
    aggregation.push({
      "$lookup": {
        "from": "nrpti",
        "localField": "_master",
        "foreignField": "_id",
        "as": "_master"
      }
    });

    // Master matching - optional
    if (!isEmpty(matches.masterMatch)) {
      aggregation.push({
        $match: matches.masterMatch
      });
    }

    aggregation.push({
      "$unwind": {
        "path": "$_master",
        "preserveNullAndEmptyArrays": true
      }
    });
  };

  aggregation.push({
    $redact: {
      $cond: {
        if: {
          // This way, if read isn't present, we assume public no roles array.
          $and: [
            { $cond: { if: "$read", then: true, else: false } },
            {
              $anyElementTrue: {
                $map: {
                  input: "$read",
                  as: "fieldTag",
                  in: { $setIsSubset: [["$$fieldTag"], roles] }
                }
              }
            }
          ]
        },
        then: "$$KEEP",
        else: {
          $cond: { if: "$read", then: "$$PRUNE", else: "$$DESCEND" }
        }
      }
    }
  });

  aggregation.push({
    $addFields: {
      score: { $meta: "textScore" }
    }
  });

  aggregation.push({
    $facet: {
      searchResults: searchResultAggregation,
      meta: [
        {
          $count: "searchResultsTotal"
        }
      ]
    }
  })

  defaultLog.info("Executing searching on schema(s):", schemaName);

  const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
  const collection = db.collection('nrpti');
  return collection.aggregate(aggregation).toArray();
}

exports.publicGet = async function (args, res, next) {
  executeQuery(args, res, next);
};

exports.protectedGet = function (args, res, next) {
  executeQuery(args, res, next);
};

// Generates the main match query, and optionally generates the master field match to be used
// later in the pipeline.
const generateMatchesForAggregation = async function (and, or, searchProperties, properties, schemaName, roles) {
  // query modifiers
  // Pluck the __master elements, and the flavour elements.  process them in different parts of the
  // pipeline because of the linking of flavour to master records.
  let __flavour = {};
  let __master = {};
  for (const item in and) {
    if (item.startsWith('_master.')) {
      __master[item] = and[item];
    } else {
      __flavour[item] = and[item];
    }
  }

  defaultLog.info("__master:", __master);
  defaultLog.info("__flavour:", __flavour);

  const andExpArray = await generateExpArray(__flavour) || [];
  const andMasterExpArray = await generateExpArray(__master, '_master.') || [];

  defaultLog.info("andExpArray:", andExpArray);
  defaultLog.info("andMasterExpArray:", andMasterExpArray);

  // filters
  // query modifiers
  // Pluck the __master elements, and the flavour elements.  process them in different parts of the
  // pipeline because of the linking of flavour to master records.
  let __flavourOr = {};
  let __masterOr = {};
  for (const item in or) {
    if (item.startsWith('_master.')) {
      __masterOr[item] = or[item];
    } else {
      __flavourOr[item] = or[item];
    }
  }

  defaultLog.info("__masterOr:", __masterOr);
  defaultLog.info("__flavourOr:", __flavourOr);

  const orExpArray = await generateExpArray(__flavourOr) || [];
  const orMasterExpArray = await generateExpArray(__masterOr, '_master.') || [];

  defaultLog.info("orExpArray:", orExpArray);
  defaultLog.info("orMasterExpArray:", orMasterExpArray);

  let modifier = {};
  if (andExpArray.length > 0 && orExpArray.length > 0) {
    modifier = { $and: [{ $and: andExpArray }, { $and: orExpArray }] };
  } else if (andExpArray.length === 0 && orExpArray.length > 0) {
    modifier = { $and: orExpArray };
  } else if (andExpArray.length > 0 && orExpArray.length === 0) {
    modifier = { $and: andExpArray };
  }

  let masterModifier = {};
  if (andMasterExpArray.length > 0 && orMasterExpArray.length > 0) {
    masterModifier = { $and: [{ $and: andMasterExpArray }, { $and: orMasterExpArray }] };
  } else if (andMasterExpArray.length === 0 && orMasterExpArray.length > 0) {
    masterModifier = { $and: orMasterExpArray };
  } else if (andMasterExpArray.length > 0 && orMasterExpArray.length === 0) {
    masterModifier = { $and: andMasterExpArray };
  }

  let match = {
    _schemaName: Array.isArray(schemaName) ? { $in: schemaName } : schemaName,
    ...(isEmpty(modifier) ? undefined : modifier),
    ...(searchProperties ? searchProperties : undefined),
    ...(properties ? properties : undefined)
  };

  let masterMatch = {
    ...(isEmpty(masterModifier) ? undefined : masterModifier)
  };

  return {
    mainMatch: match,
    masterMatch: masterMatch
  }
}

const executeQuery = async function (args, res, next) {
  let _id = args.swagger.params._id ? args.swagger.params._id.value : null;
  let keywords = args.swagger.params.keywords.value;
  let dataset = args.swagger.params.dataset.value;
  let project = args.swagger.params.project.value;
  let populate = args.swagger.params.populate ? args.swagger.params.populate.value : false;
  let pageNum = args.swagger.params.pageNum.value || 0;
  let pageSize = args.swagger.params.pageSize.value || 25;
  let sortBy = args.swagger.params.sortBy.value ? args.swagger.params.sortBy.value : keywords ? ['-score'] : [];
  let caseSensitive = args.swagger.params.caseSensitive ? args.swagger.params.caseSensitive.value : false;
  let and = args.swagger.params.and ? args.swagger.params.and.value : '';
  let or = args.swagger.params.or ? args.swagger.params.or.value : '';
  defaultLog.info("Searching keywords:", keywords);
  defaultLog.info("Searching datasets:", dataset);
  defaultLog.info("Searching project:", project);
  defaultLog.info("pageNum:", pageNum);
  defaultLog.info("pageSize:", pageSize);
  defaultLog.info("sortBy:", sortBy);
  defaultLog.info("caseSensitive:", caseSensitive);
  defaultLog.info("and:", and);
  defaultLog.info("or:", or);
  defaultLog.info("_id:", _id);
  defaultLog.info("populate:", populate);

  let roles = args.swagger.params.auth_payload ? args.swagger.params.auth_payload.realm_access.roles : ['public'];

  defaultLog.info("Searching Collection:", dataset);

  defaultLog.info("******************************************************************");
  defaultLog.info(roles);
  defaultLog.info("******************************************************************");

  QueryUtils.recordAction('Search', keywords, args.swagger.params.auth_payload ? args.swagger.params.auth_payload.preferred_username : 'public')

  let sortDirection = undefined;
  let sortField = undefined;

  let sortingValue = {};
  sortBy.map((value) => {
    sortDirection = value.charAt(0) == '-' ? -1 : 1;
    sortField = value.slice(1);
    sortingValue[sortField] = sortDirection;
  });

  defaultLog.info("sortingValue:", sortingValue);
  defaultLog.info("sortField:", sortField);
  defaultLog.info("sortDirection:", sortDirection);

  if (dataset[0] !== 'Item') {

    defaultLog.info("Searching Dataset:", dataset);
    defaultLog.info("sortField:", sortField);

    let itemData = await searchCollection(roles, keywords, dataset, pageNum, pageSize, project, sortField, sortDirection, caseSensitive, populate, and, or)

    return QueryActions.sendResponse(res, 200, itemData);

  } else if (dataset[0] === 'Item') {
    let collectionObj = mongoose.model(args.swagger.params._schemaName.value);
    defaultLog.info("ITEM GET", { _id: args.swagger.params._id.value })

    let aggregation = [
      {
        "$match": { _id: mongoose.Types.ObjectId(args.swagger.params._id.value) }
      },
      {
        $redact: {
          $cond: {
            if: {
              // This way, if read isn't present, we assume public no roles array.
              $and: [
                { $cond: { if: "$read", then: true, else: false } },
                {
                  $anyElementTrue: {
                    $map: {
                      input: "$read",
                      as: "fieldTag",
                      in: { $setIsSubset: [["$$fieldTag"], roles] }
                    }
                  }
                }
              ]
            },
            then: "$$KEEP",
            else: {
              $cond: { if: "$read", then: "$$PRUNE", else: "$$DESCEND" }
            }
          }
        }
      }
    ];

    populate && QueryUtils.recordTypes.includes(args.swagger.params._schemaName.value) && aggregation.push(
      {
        '$lookup': {
          "from": "nrpti",
          "localField": "_id",
          "foreignField": "_master",
          "as": "flavours"
        }
      }
    );

    // Populate documents in a record
    populate && QueryUtils.recordTypes.includes(args.swagger.params._schemaName.value) && aggregation.push(
      {
        '$lookup': {
          "from": "nrpti",
          "localField": "documents",
          "foreignField": "_id",
          "as": "documents"
        }
      }
    );

    let data = await collectionObj.aggregate(aggregation);

    return QueryActions.sendResponse(res, 200, data);
  } else {
    defaultLog.info('Bad Request');
    return QueryActions.sendResponse(res, 400, {});
  }
};

exports.protectedOptions = function (args, res, next) {
  res.status(200).send();
};
