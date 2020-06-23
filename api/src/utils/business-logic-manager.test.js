const BusinessLogicManager = require('./business-logic-manager');

describe('applyBusinessLogicToAct', () => {
  it('returns null if null act paramter provided ', async () => {
    const result = await BusinessLogicManager.applyBusinessLogicToAct(null);

    expect(result).toBe(null);
  });

  it('returns null if empty act parameter provided', async () => {
    const result = await BusinessLogicManager.applyBusinessLogicToAct('');

    expect(result).toBe(null);
  });

  it('returns original act if act does not match any business logic rules', async () => {
    const result = await BusinessLogicManager.applyBusinessLogicToAct('does not match business rules');

    expect(result).toEqual('does not match business rules');
  });

  it('returns altered act if act matches business logic rules', async () => {
    const result = await BusinessLogicManager.applyBusinessLogicToAct('Fisheries Act');

    expect(result).toEqual('Fisheries Act (Canada)');
  });
});

describe('updateDocumentRoles', () => {
  it('returns null if null masterRecord paramter provided ', async () => {
    const result = await BusinessLogicManager.updateDocumentRoles(null);

    expect(result).toBe(null);
  });

  it('returns null if masterRecord.documents is null', async () => {
    const result = await BusinessLogicManager.updateDocumentRoles({ documents: null });

    expect(result).toBe(null);
  });

  it('returns null if masterRecord.documents is empty', async () => {
    const result = await BusinessLogicManager.updateDocumentRoles({ documents: [] });

    expect(result).toBe(null);
  });
});

describe('isDocumentConsideredAnonymous', () => {
  it('returns true if null masterRecord paramter provided ', async () => {
    const result = await BusinessLogicManager.isDocumentConsideredAnonymous(null);

    expect(result).toBe(true);
  });

  it('returns true if masterRecord.documents is null', async () => {
    const result = await BusinessLogicManager.isDocumentConsideredAnonymous({ documents: null });

    expect(result).toBe(true);
  });

  it('returns true if masterRecord.documents is empty', async () => {
    const result = await BusinessLogicManager.isDocumentConsideredAnonymous({ documents: [] });

    expect(result).toBe(true);
  });
});
