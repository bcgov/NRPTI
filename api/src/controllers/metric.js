const QueryActions = require('../utils/query-actions');
const { metric: Metric } = require('../models/index');

exports.protectedOptions = function(args, res, next) {
  res.status(200).send();
};

exports.protectedList = async function(args, res, next) {
  // protected by swagger route by the scope
  const agg = [
    {
      $match: {
        _schemaName: 'Metric'
      }
    },
    {
      $project: {
        code: 1
      }
    }
  ];

  const metrics = await Metric.aggregate(agg);

  QueryActions.sendResponse(res, 200, metrics);
};

exports.protectedGet = async function(args, res, next) {
  if (!args.swagger.params.code) {
    return QueryActions.sendResponse(res, 400, {});
  }

  const query = {
    _schemaName: 'Metric',
    code: args.swagger.params.code.value
  };

  const metric = await Metric.find(query);

  QueryActions.sendResponse(res, 200, metric);
};

exports.protectedGetData = async function(args, res, next) {
  const query = {
    _schemaName: 'Metric',
    code: args.swagger.params.code.value
  };

  // Future: Set read/write roles on metric, guard against execution at this point.
  const metric = await Metric.findOne(query);

  if (!metric || !metric.operation) {
    return QueryActions.sendResponse(res, 400, {});
  }

  try {
    const aggregateOperation = JSON.parse(metric.operation);

    const data = await Metric.aggregate(aggregateOperation);

    QueryActions.sendResponse(res, 200, data);
  } catch (e) {
    QueryActions.sendResponse(res, 400, e);
  }
};
