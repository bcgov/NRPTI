const factory = require('factory-girl').factory;
const Document = require('../../models/document');

factory.define('document', Document, buildOptions => {
  let attrs = {
    displayName: factory.chance('name'),
    documentFileName: factory.seq('Document.documentFileName', element => `test-document-${element}.docx`),
    internalURL: './api/test/fixtures/test_document.txt',
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
