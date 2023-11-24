const { preTransformRecord } = require('./epic-utils');

describe('preTransformRecord function', () => {
  it('should throw an error if no record is provided', () => {
    expect(() => {
      preTransformRecord();
    }).toThrow('preTransformRecord - required record must be non-null.');
  });

  it('should transform Epic project names correctly', () => {
    const epicRecordWithProject = {
      project: {
        name: 'LNG Canada Export Terminal'
      }
    };

    const transformedRecord = preTransformRecord(epicRecordWithProject);
    expect(transformedRecord.project.name).toBe('LNG Canada');

    epicRecordWithProject.project.name = 'Coastal GasLink Pipeline';
    const transformedRecord2 = preTransformRecord(epicRecordWithProject);
    expect(transformedRecord2.project.name).toBe('Coastal Gaslink');
  });

  it('should transform Epic author names correctly', () => {
    const epicRecordWithAuthor = {
      documentAuthor: '5cf00c03a266b7e1877504db'
    };

    const transformedRecord = preTransformRecord(epicRecordWithAuthor);
    expect(transformedRecord.documentAuthor).toBe('BC Government');

    epicRecordWithAuthor.documentAuthor = '5cf00c03a266b7e1877504dc';
    const transformedRecord2 = preTransformRecord(epicRecordWithAuthor);
    expect(transformedRecord2.documentAuthor).toBe('Proponent');

    epicRecordWithAuthor.documentAuthor = 'SomeOtherValue';
    const transformedRecord3 = preTransformRecord(epicRecordWithAuthor);
    expect(transformedRecord3.documentAuthor).toBe('Other');
  });

  it('should return the unchanged record if no transformations apply', () => {
    const epicRecord = {
      someField: 'Some value',
      anotherField: 123
    };

    const transformedRecord = preTransformRecord(epicRecord);
    expect(transformedRecord).toEqual(epicRecord);
  });
});
