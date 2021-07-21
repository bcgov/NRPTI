const factory = require('factory-girl').factory;
let faker = require('faker/locale/en');
const moment = require('moment');
const Order = require('../../src/models/master/order.js');
const factory_helper = require('./factory_helper.js');
const CONSTANTS = require('../../src/utils/constants/misc.js');


// TODO move to utils constants or something
const agencyPicklist = [
  'Agricultural Land Commission',
  'BC Oil and Gas Commission',
  'BC Parks',
  'BC Wildfire Service',
  'Climate Action Secretariat',
  'Conservation Officer Service',
  'Environmental Assessment Office',
  'Environmental Protection Division',
  'LNG Secretariat',
  'Ministry of Agriculture Food and Fisheries',
  'Ministry of Energy Mines and Low Carbon Innovation',
  'Ministry of Forests Lands Natural Resource Operations and Rural Development',
  'Natural Resource Officers'
];

const authorPicklist = ['BC Government', 'Proponent', 'Other'];

const factoryName = 'Order'

// todo create factory for flavours
factory.define(factoryName, Order, (buildOptions) => {
  if (buildOptions.faker) faker = buildOptions.faker;
  factory_helper.faker = faker;

  let genUnderAge = (buildOptions.genUnderAge) ? buildOptions.genUnderAge : false;
  let genAdult = (buildOptions.genAdult) ? buildOptions.genAdult : false;
  let genCompany = (buildOptions.genCompany) ? buildOptions.genCompany: false;

  const issuedTo = factory_helper.generateIssuedTo(genUnderAge, genAdult, genCompany);

  let randomDate = moment(faker.date.past(10, new Date()));
  let attrs = {
    recordName: 'General Order ' + faker.random.number(1000),
    recordType: 'Order',
    dateIssued: randomDate,
    issuingAgency: faker.random.arrayElement(agencyPicklist),
    author: faker.random.arrayElement(authorPicklist),
    issuedTo: issuedTo,
    sourceDateAdded: randomDate.clone().subtract(faker.random.number(45), 'days'),
    sourceDateUpdated: randomDate.clone().subtract(faker.random.number(45), 'days'),
    isNrcedPublished: faker.random.boolean(),
    isLngPublished: faker.random.boolean(),
    isBcmiPublished: faker.random.boolean(),
    read: CONSTANTS.ApplicationAdminRoles.concat(['public']),
    write: CONSTANTS.ApplicationAdminRoles

  };
  return attrs;
});

exports.factory = factory;
exports.name = factoryName;
