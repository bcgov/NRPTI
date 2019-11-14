'use strict';

let mongoose = require('mongoose');

const defaultLog = require('./logger')('modelSchemaGenerator');

/**
 * Generates the mongoose model schema for the given definition.
 *
 * @param {string} name model name
 * @param {*} definition model definition
 * @returns mongoose schema
 */
let genSchema = function(name, definition) {
  // model properties
  let indexes = [];

  // parse out model properties
  for (let [key, value] of Object.entries(definition)) {
    if (key.substr(0, 2) === '__') {
      delete definition[key];

      switch (key.substr(2)) {
        case 'index':
          indexes.push(value);
          break;
      }
    }
  }

  // schema options
  const options = {
    usePushEach: true //https://github.com/Automattic/mongoose/issues/5870
  };

  // create schema
  let schema = new mongoose.Schema(definition, options);

  // add model properties - post schema creation
  if (indexes && indexes.length) {
    for (let index in indexes) {
      schema.index(index);
    }
  }

  return schema;
};

/**
 * Generates the mongoose based on the given definition.
 *
 * @param {string} name name of the model
 * @param {Object} definition model definition
 * @returns mongoose model
 */
module.exports = function(name, definition) {
  if (!name || !definition) {
    defaultLog.error('No name or definition supplied when building schema');
    return;
  }
  return mongoose.model(name, genSchema(name, definition));
};
