const factory = require('factory-girl').factory;
const Document = require('../../models/document');

factory.define('document', Document, buildOptions => {
  let attrs = {
    fileName: factory.seq('Document.fileName', element => `test-document-${element}.docx`),
    key: '89bd9fd384864fe58d5f711f117f1922/test_document.txt',
    url: './api/test/fixtures/test_document.txt',
    read: ['sysadmin']
  };

  if (buildOptions.public) {
    attrs.tags = [['public'], ['sysadmin']];
  } else if (buildOptions.public === false) {
    attrs.tags = [['sysadmin']];
  }
  return attrs;
});

exports.factory = factory;
