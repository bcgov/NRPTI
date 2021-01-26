const factory = require('factory-girl').factory;

// must import factories that may be called to generate
// eslint-disable-next-line no-unused-vars
const orderFactory = require('../factories/order-factory');


function generateSingleFactory(modelName, numberToGenerate, attrs, buildOptions) {
  return factory.createMany(modelName, numberToGenerate, attrs, buildOptions);
};

function generateSingleModelInstance(modelName, attr, buildOptions) {
  return factory.create(modelName, attr, buildOptions);

};

exports.generateSingleFactory = generateSingleFactory;
exports.generateSingleModelInstance = generateSingleModelInstance;
