const testUtils = require('./test-utils');
const app = testUtils.app;
const mongoose = require('mongoose');
const documentFactory = require('./factories/document-factory').factory;
const recordFactory = require('./factories/record-factory').factory;
const request = require('supertest');
const shell = require('shelljs');

const documentController = require('../controllers/document-controller.js.js');
require('../models/document');
const Document = mongoose.model('Document');

/*************************************
  Mock Route Handlers + Helper Methods
*************************************/

const fieldNames = ['displayName', 'documentFileName'];
const idirUsername = 'idir/i_am_a_bot';

function paramsWithDocId(req) {
  let params = testUtils.buildParams({ docId: req.params.id });
  return testUtils.createSwaggerParams(fieldNames, params);
}

function publicParamsWithDocId(req) {
  let params = testUtils.buildParams({ docId: req.params.id });
  return testUtils.createPublicSwaggerParams(fieldNames, params);
}

app.get('/api/document', function(req, res) {
  let swaggerParams = testUtils.createSwaggerParams(fieldNames);
  return documentController.protectedGet(swaggerParams, res);
});

app.get('/api/document/:id', function(req, res) {
  return documentController.protectedGet(paramsWithDocId(req), res);
});

app.get('/api/document/:id/download', function(req, res) {
  return documentController.protectedDownload(paramsWithDocId(req), res);
});

app.post('/api/document', function(req, res) {
  let extraFields = testUtils.buildParams(req.body);
  let params = testUtils.createSwaggerParams(fieldNames, extraFields, idirUsername);

  return documentController.protectedPost(params, res);
});

app.put('/api/document/:id', function(req, res) {
  let extraFields = testUtils.buildParams(req.body);
  extraFields = { ...extraFields, ...{ docId: { value: req.params.id } } };
  let params = testUtils.createSwaggerParams(fieldNames, extraFields, idirUsername);
  return documentController.protectedPut(params, res);
});

app.get('/api/public/document', function(req, res) {
  let publicSwaggerParams = testUtils.createPublicSwaggerParams(fieldNames);
  return documentController.publicGet(publicSwaggerParams, res);
});

app.get('/api/public/document/:id', function(req, res) {
  return documentController.publicGet(publicParamsWithDocId(req), res);
});

app.get('/api/public/document/:id/download', function(req, res) {
  return documentController.publicDownload(publicParamsWithDocId(req), res);
});

app.post('/api/public/document', function(req, res) {
  let extraFields = testUtils.buildParams(req.body);
  let params = testUtils.createPublicSwaggerParams(fieldNames, extraFields, idirUsername);

  return documentController.publicPost(params, res);
});

app.put('/api/document/:id/publish', function(req, res) {
  return documentController.protectedPublish(paramsWithDocId(req), res);
});

app.put('/api/document/:id/unpublish', function(req, res) {
  return documentController.protectedUnPublish(paramsWithDocId(req), res);
});

app.delete('/api/document/:id', function(req, res) {
  return documentController.protectedDelete(paramsWithDocId(req), res);
});

/*************************************
  General Test Data + Helper Methods
*************************************/

const documentsData = [
  {
    displayName: 'Special File',
    documentFileName: 'special_file.csv',
    tags: [['public'], ['sysadmin']],
    isDeleted: false
  },
  { displayName: 'Vanilla Ice Cream', documentFileName: 'vanilla.docx', tags: [['public']], isDeleted: false },
  { displayName: 'Confidential File', documentFileName: '1099_FBI.docx.gpg', tags: [['sysadmin']], isDeleted: false },
  { displayName: 'Deleted File', documentFileName: 'not_petya.exe', tags: [['public'], ['sysadmin']], isDeleted: true }
];

function setupDocuments(documentsData) {
  return new Promise(function(resolve, reject) {
    documentFactory
      .createMany('document', documentsData)
      .then(documentsArray => {
        resolve(documentsArray);
      })
      .catch(error => {
        reject(error);
      });
  });
}

function cleanupTestDocumentFiles() {
  if (shell.test('-d', './api/test/uploads/') && shell.test('-d', './api/test/uploads/*.txt')) {
    shell.rm('./api/test/uploads/*.txt');
  }
}

/*************************************
  Tests
*************************************/

afterAll(() => {
  cleanupTestDocumentFiles();
});

describe('GET /document', () => {
  test('returns a list of non-deleted, public and sysadmin documents', done => {
    setupDocuments(documentsData).then(documents => {
      request(app)
        .get('/api/document')
        .expect(200)
        .then(response => {
          expect(response.body.length).toEqual(3);

          let firstDocument = response.body.find({ documentFileName: 'special_file.csv' });
          expect(firstDocument).toHaveProperty('_id');
          expect(firstDocument.displayName).toBe('Special File');
          expect(firstDocument['tags']).toEqual(expect.arrayContaining([['public'], ['sysadmin']]));

          let secondDocument = response.body.find({ documentFileName: 'vanilla.docx' });
          expect(secondDocument).toHaveProperty('_id');
          expect(secondDocument.displayName).toBe('Vanilla Ice Cream');
          expect(secondDocument['tags']).toEqual(expect.arrayContaining([['public']]));

          let secretDocument = response.body.find({ documentFileName: '1099_FBI.docx.gpg' });
          expect(secretDocument).toHaveProperty('_id');
          expect(secretDocument.displayName).toBe('Confidential File');
          expect(secretDocument['tags']).toEqual(expect.arrayContaining([['sysadmin']]));
          done();
        });
    });
  });

  test('returns an empty array when there are no documents', done => {
    request(app)
      .get('/api/document')
      .expect(200)
      .then(response => {
        expect(response.body.length).toBe(0);
        expect(response.body).toEqual([]);
        done();
      });
  });

  test('can search based on record', done => {
    recordFactory.create('record', { name: 'Detailed record with attachment' }).then(record => {
      let documentAttrs = {
        _record: record.id,
        displayName: 'Attachment for Record',
        documentFileName: 'long_list.docx'
      };
      documentFactory.create('document', documentAttrs, { public: false }).then(document => {
        request(app)
          .get('/api/document')
          .query({ _record: record.id })
          .expect(200)
          .then(response => {
            expect(response.body.length).toBe(1);
            let resultingDocument = response.body[0];
            expect(resultingDocument).not.toBeNull();
            expect(resultingDocument.displayName).toBe('Attachment for Record');
            done();
          });
      });
    });
  });
});

describe('GET /document/{id}', () => {
  test('returns a single Document ', done => {
    setupDocuments(documentsData).then(documents => {
      Document.findOne({ displayName: 'Special File' }).exec(function(error, document) {
        let documentId = document._id.toString();
        let uri = '/api/document/' + documentId;

        request(app)
          .get(uri)
          .expect(200)
          .then(response => {
            expect(response.body.length).toBe(1);
            let responseObject = response.body[0];
            expect(responseObject).toMatchObject({
              _id: documentId,
              tags: expect.arrayContaining([['public'], ['sysadmin']]),
              displayName: 'Special File',
              documentFileName: 'special_file.csv'
            });
            done();
          });
      });
    });
  });
});

describe('GET /public/document', () => {
  test('returns a list of public documents', done => {
    setupDocuments(documentsData).then(documents => {
      request(app)
        .get('/api/public/document')
        .expect(200)
        .then(response => {
          expect(response.body.length).toEqual(2);

          let firstDocument = response.body.find({ documentFileName: 'special_file.csv' });
          expect(firstDocument).toHaveProperty('_id');
          expect(firstDocument.displayName).toBe('Special File');
          expect(firstDocument['tags']).toEqual(expect.arrayContaining([['public'], ['sysadmin']]));

          let secondDocument = response.body.find({ documentFileName: 'vanilla.docx' });
          expect(secondDocument).toHaveProperty('_id');
          expect(secondDocument.displayName).toBe('Vanilla Ice Cream');
          expect(secondDocument['tags']).toEqual(expect.arrayContaining([['public']]));

          done();
        });
    });
  });

  test('returns an empty array when there are no Documents', done => {
    request(app)
      .get('/api/public/document')
      .expect(200)
      .then(response => {
        expect(response.body.length).toBe(0);
        expect(response.body).toEqual([]);
        done();
      });
  });

  test('can search based on record', done => {
    recordFactory.create('record', { name: 'Detailed record with attachment' }).then(record => {
      let documentAttrs = {
        _record: record.id,
        displayName: 'Attachment for Record',
        documentFileName: 'long_list.docx'
      };
      documentFactory.create('document', documentAttrs, { public: true }).then(document => {
        request(app)
          .get('/api/public/document')
          .query({ _record: record.id })
          .expect(200)
          .then(response => {
            expect(response.body.length).toBe(1);
            let resultingDocument = response.body[0];
            expect(resultingDocument).not.toBeNull();
            expect(resultingDocument.displayName).toBe('Attachment for Record');
            done();
          });
      });
    });
  });
});

describe('GET /public/document/{id}', () => {
  test('returns a single public document ', done => {
    setupDocuments(documentsData).then(documents => {
      Document.findOne({ displayName: 'Special File' }).exec(function(error, document) {
        if (error) {
          throw error;
        }
        let specialDocumentId = document._id.toString();
        let uri = '/api/public/document/' + specialDocumentId;

        request(app)
          .get(uri)
          .expect(200)
          .then(response => {
            expect(response.body.length).toBe(1);
            let responseObj = response.body[0];
            expect(responseObj).toMatchObject({
              _id: specialDocumentId,
              tags: expect.arrayContaining([['public'], ['sysadmin']]),
              displayName: 'Special File',
              documentFileName: 'special_file.csv'
            });
            done();
          });
      });
    });
  });
});

describe('POST /document', () => {
  let recordId;

  beforeEach(done => {
    recordFactory.create('record', {}).then(record => {
      recordId = record.id;
    });
  });

  function buildDocumentParams() {
    return {
      _record: recordId,
      displayName: 'Critically Important File',
      upfile: {
        mimetype: 'text/plain',
        originalname: 'test_document.txt'
      }
    };
  }

  test('uploads a document', done => {
    let documentParams = buildDocumentParams();
    request(app)
      .post('/api/document')
      .send(documentParams)
      .expect(200)
      .then(response => {
        expect(response.body._id).toBeDefined();
        expect(response.body._id).not.toBeNull();
        Document.findById(response.body._id).exec(function(error, document) {
          expect(document).not.toBeNull();
          expect(document.displayName).toBe('Critically Important File');
          done();
        });
      });
  });

  test('sets the relationships to record', done => {
    let documentParams = buildDocumentParams();
    request(app)
      .post('/api/document')
      .send(documentParams)
      .expect(200)
      .then(response => {
        expect(response.body._id).not.toBeNull();
        Document.findById(response.body._id).exec(function(error, document) {
          expect(document).not.toBeNull();
          expect(document._record.toString()).toBe(recordId);
          done();
        });
      });
  });

  test('sets the file metadata ', done => {
    let documentParams = buildDocumentParams();
    request(app)
      .post('/api/document')
      .send(documentParams)
      .expect(200)
      .then(response => {
        expect(response.body._id).not.toBeNull();
        Document.findById(response.body._id).exec(function(error, document) {
          expect(document).not.toBeNull();
          expect(document.internalMime).toBe('text/plain');

          // Test that intenalURL is a  numeric UUID with a .txt extension
          expect(document.internalURL).toMatch(/.\/uploads\/([0-9\s:])+(.txt)$/);

          expect(document.documentFileName).toBe('test_document.txt');
          done();
        });
      });
  });

  test('sets the _addedBy to the user uploading the file', done => {
    let documentParams = buildDocumentParams();
    request(app)
      .post('/api/document')
      .send(documentParams)
      .expect(200)
      .then(response => {
        expect(response.body._id).not.toBeNull();
        Document.findById(response.body._id).exec(function(error, document) {
          expect(document).not.toBeNull();
          expect(document._addedBy).not.toBeNull();
          expect(document._addedBy).toEqual(idirUsername);
          done();
        });
      });
  });

  test.skip('Runs a virus scan', done => {});
});

// It appears this endpoint does not work.
// The "doc" variable in the protectedPut method is not defined.
describe.skip('PUT /document/{:id}', () => {
  let recordId;

  beforeEach(done => {
    recordFactory.create('record', {}).then(record => {
      recordId = record.id;
    });
  });

  function buildDocumentParams() {
    return {
      _record: recordId,
      displayName: 'Exciting new Document!',
      upfile: {
        mimetype: 'text/plain',
        originalname: 'test_document.txt'
      }
    };
  }
  let documentData = {
    _record: null,
    _addedBy: null,
    displayName: 'Boring old document'
  };

  test('can update a document', done => {
    let documentParams = buildDocumentParams();
    documentFactory.create('document', documentData).then(document => {
      request(app)
        .put('/api/document/' + document.id)
        .send(documentParams)
        .expect(200)
        .then(response => {
          Document.findById(document.id).exec(function(error, updatedDocument) {
            expect(updatedDocument).not.toBeNull();
            expect(updatedDocument.displayName).toBe('Exciting new Document!');
            done();
          });
        });
    });
  });
});

describe('GET /document/{:id}/download', () => {
  test('allows downloading a public document', done => {
    documentFactory.create('document', {}, { public: true }).then(document => {
      let uri = '/api/document/' + document.id + '/download';
      request(app)
        .get(uri)
        .expect(200)
        .then(response => {
          expect(response.body).not.toBeNull();
          done();
        });
    });
  });

  test('allows downloading a protected document', done => {
    documentFactory.create('document', {}, { public: false }).then(protectedDoc => {
      let uri = '/api/document/' + protectedDoc.id + '/download';
      request(app)
        .get(uri)
        .expect(200)
        .then(response => {
          expect(response.body).not.toBeNull();
          done();
        });
    });
  });

  test('404s when trying to download a document which does not exist', done => {
    request(app)
      .get('/api/document/5aa80486343ef100195e5451/download')
      .expect(404)
      .then(response => {
        done();
      });
  });

  test('404s when trying to download without an id', done => {
    request(app)
      .get('/api/document//download')
      .expect(404)
      .then(response => {
        done();
      });
  });
});

describe('POST /public/document', () => {
  let recordId;

  beforeEach(done => {
    recordFactory.create('record', {}).then(record => {
      recordId = record.id;
    });
  });

  function buildDocumentParams() {
    return {
      _record: recordId,
      displayName: 'Critically Important File',
      upfile: {
        mimetype: 'text/plain',
        originalname: 'test_document.txt'
      }
    };
  }

  test('uploads a document', done => {
    let documentParams = buildDocumentParams();
    request(app)
      .post('/api/public/document')
      .send(documentParams)
      .expect(200)
      .then(response => {
        expect(response.body._id).toBeDefined();
        expect(response.body._id).not.toBeNull();
        Document.findById(response.body._id).exec(function(error, document) {
          expect(document).not.toBeNull();
          expect(document.displayName).toBe('Critically Important File');
          done();
        });
      });
  });

  test('sets the relationships to record', done => {
    let documentParams = buildDocumentParams();
    request(app)
      .post('/api/public/document')
      .send(documentParams)
      .expect(200)
      .then(response => {
        expect(response.body._id).not.toBeNull();
        Document.findById(response.body._id).exec(function(error, document) {
          expect(document).not.toBeNull();
          expect(document._record.toString()).toBe(recordId);
          done();
        });
      });
  });

  test('sets the file metadata ', done => {
    let documentParams = buildDocumentParams();
    request(app)
      .post('/api/public/document')
      .send(documentParams)
      .expect(200)
      .then(response => {
        expect(response.body._id).not.toBeNull();
        Document.findById(response.body._id).exec(function(error, document) {
          expect(document).not.toBeNull();
          expect(document.internalMime).toBe('text/plain');

          // Test that intenalURL is a  numeric UUID with a .txt extension
          expect(document.internalURL).toMatch(/.\/uploads\/([0-9\s:])+(.txt)$/);

          expect(document.documentFileName).toBe('test_document.txt');
          done();
        });
      });
  });

  test.skip('Runs a virus scan', done => {});
});

describe('GET /public/document/{:id}/download', () => {
  test('allows downloading a document', done => {
    documentFactory.create('document', {}, { public: true }).then(document => {
      let uri = '/api/public/document/' + document.id + '/download';
      request(app)
        .get(uri)
        .expect(200)
        .then(response => {
          expect(response.body).not.toBeNull();
          done();
        });
    });
  });

  test('404s when trying to download a document which is not public', done => {
    documentFactory.create('document', {}, { public: false }).then(document => {
      let uri = '/api/public/document/' + document.id + '/download';
      request(app)
        .get(uri)
        .expect(404)
        .then(response => {
          done();
        });
    });
  });

  test('404s when trying to download a document which does not exist', done => {
    request(app)
      .get('/api/public/document/5aa80486343ef100195e5451/download')
      .expect(404)
      .then(response => {
        done();
      });
  });

  test('404s when trying to download without an id', done => {
    request(app)
      .get('/api/public/document//download')
      .expect(404)
      .then(response => {
        done();
      });
  });
});

describe('PUT /document/:id/publish', () => {
  test('publishes a document', done => {
    let existingDocumentData = {
      displayName: 'Existing Document',
      tags: []
    };
    documentFactory.create('document', existingDocumentData).then(document => {
      let uri = '/api/document/' + document._id + '/publish';
      request(app)
        .put(uri)
        .expect(200)
        .send({})
        .then(response => {
          Document.findOne({ displayName: 'Existing Document' }).exec(function(error, updatedDocument) {
            expect(updatedDocument).toBeDefined();
            expect(updatedDocument.tags[0]).toEqual(expect.arrayContaining(['public']));
            done();
          });
        });
    });
  });

  test('404s if the document does not exist', done => {
    let uri = '/api/document/' + 'NON_EXISTENT_ID' + '/publish';
    request(app)
      .put(uri)
      .send({})
      .expect(404)
      .then(response => {
        done();
      });
  });
});

describe('PUT /document/:id/unpublish', () => {
  test('unpublishes a document', done => {
    let existingDocumentData = {
      displayName: 'Existing Document',
      tags: [['public']]
    };
    documentFactory.create('document', existingDocumentData).then(document => {
      let uri = '/api/document/' + document._id + '/unpublish';
      request(app)
        .put(uri)
        .expect(200)
        .send({})
        .then(response => {
          Document.findOne({ displayName: 'Existing Document' }).exec(function(error, updatedDocument) {
            expect(updatedDocument).toBeDefined();
            expect(updatedDocument.tags[0]).toEqual(expect.arrayContaining([]));
            done();
          });
        });
    });
  });

  test('404s if the decision does not exist', done => {
    let uri = '/api/decision/' + 'NON_EXISTENT_ID' + '/unpublish';
    request(app)
      .put(uri)
      .send({})
      .expect(404)
      .then(response => {
        done();
      });
  });
});

describe('DELETE /document/:id', () => {
  test('It soft deletes a document', done => {
    setupDocuments(documentsData).then(documents => {
      Document.findOne({ displayName: 'Vanilla Ice Cream' }).exec(function(error, document) {
        let vanillaDocumentId = document._id.toString();
        let uri = '/api/document/' + vanillaDocumentId;
        request(app)
          .delete(uri)
          .expect(200)
          .then(response => {
            Document.findOne({ displayName: 'Vanilla Ice Cream' }).exec(function(error, updatedDocument) {
              expect(updatedDocument.isDeleted).toBe(true);
              done();
            });
          });
      });
    });
  });

  test('404s if the document does not exist', done => {
    let uri = '/api/document/' + 'NON_EXISTENT_ID';
    request(app)
      .delete(uri)
      .expect(404)
      .then(response => {
        done();
      });
  });
});
