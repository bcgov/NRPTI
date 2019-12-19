'use strict';

/**
 * This file contains query builder utility functions.
 */

let mongoose = require('mongoose');

let MAX_LIMIT = 1000;
let DEFAULT_PAGESIZE = 100;

/**
 * Removes properties from fields that are not present in allowedFields
 *
 * @param {*} allowedFields array of fields that are allowed.
 * @param {*} fields array of fields that will have all non-allowed fields removed.
 * @returns array of fields that is a subset of allowedFields.
 */
exports.getSanitizedFields = function(allowedFields, fields) {
  return fields.filter(function(field) {
    return allowedFields.indexOf(allowedFields, field) !== -1;
  });
};

/**
 * TODO: populate this documentation
 *
 * @param {*} property
 * @param {*} values
 * @param {*} query
 * @returns
 */
exports.buildQuery = function(property, values, query) {
  let objectIDs = [];
  if (Array.isArray(values)) {
    for (let id in values) {
      objectIDs.push(mongoose.Types.ObjectId(id));
    }
  } else {
    objectIDs.push(mongoose.Types.ObjectId(values));
  }
  return {
    ...query,
    ...{
      [property]: {
        $in: objectIDs
      }
    }
  };
};

/**
 * TODO: populate this documentation
 *
 * @param {*} pageSize
 * @param {*} pageNum
 * @returns
 */
exports.getSkipLimitParameters = function(pageSize, pageNum) {
  const params = {};

  let ps = DEFAULT_PAGESIZE; // Default
  if (pageSize && pageSize.value !== undefined) {
    if (pageSize.value > 0) {
      ps = pageSize.value;
    }
  }
  if (pageNum && pageNum.value !== undefined) {
    if (pageNum.value >= 0) {
      params.skip = pageNum.value * ps;
      params.limit = ps;
    }
  }
  return params;
};

/**
 * TODO: populate this documentation
 *
 * @param {*} modelType
 * @param {*} role
 * @param {*} query
 * @param {*} fields
 * @param {*} sortWarmUp
 * @param {*} sort
 * @param {*} skip
 * @param {*} limit
 * @param {*} count
 * @param {*} preQueryPipelineSteps
 * @returns
 */
exports.runDataQuery = function(
  modelType,
  role,
  query,
  fields,
  sortWarmUp,
  sort,
  skip,
  limit,
  count,
  preQueryPipelineSteps
) {
  return new Promise(function(resolve, reject) {
    let theModel = mongoose.model(modelType);
    let projection = {};

    // Don't project unecessary fields if we are only counting objects.
    if (count) {
      projection._id = 1;
      projection.tags = 1;
    } else {
      // Fields we always return
      let defaultFields = ['_id', 'code', 'tags'];
      for (let field in defaultFields) {
        projection[field] = 1;
      }

      // Add requested fields - sanitize first by including only those that we can/want to return
      for (let field in fields) {
        projection[field] = 1;
      }
    }

    let aggregations = [
      {
        $match: query
      },
      {
        $project: projection
      },
      {
        $redact: {
          $cond: {
            if: {
              $anyElementTrue: {
                $map: {
                  input: '$tags',
                  as: 'fieldTag',
                  in: { $setIsSubset: ['$$fieldTag', role] }
                }
              }
            },
            then: '$$DESCEND',
            else: '$$PRUNE'
          }
        }
      },

      sortWarmUp, // Used to setup the sort if a temporary projection is needed.

      !sort.length == 0 ? { $sort: sort } : null,

      sort ? { $project: projection } : null, // Reset the projection just in case the sortWarmUp changed it.

      // Do this only if they ask for it.
      count && {
        $group: {
          _id: null,
          total_items: { $sum: 1 }
        }
      },
      { $skip: skip || 0 },
      { $limit: limit || MAX_LIMIT }
    ].filter(function(el) {
      return !!el;
    });

    // Pre-pend the aggregation with other pipeline steps if we are joining on another dataSource
    if (preQueryPipelineSteps && preQueryPipelineSteps.length > 0) {
      for (let step of preQueryPipelineSteps) {
        aggregations.unshift(step);
      }
    }

    theModel
      .aggregate(aggregations)
      .exec()
      .then(resolve, reject);
  });
};
