/**
 * Supported NRPTI datasources.
 */
const INTEGRATION_DATASOURCE = Object.freeze({
  epic: {
    dataSourceLabel: 'epic',
    getDataSource: (...args) => {
      return new (require('./epic/epic-datasource'))(...args);
    }
  }
});

module.exports = INTEGRATION_DATASOURCE;
