const actsRegulationsController = require('../../controllers/acts-regulations-controller');

describe('parseTitleFromXML', () => {
  const testTitle = 'Act Name';
  const testXMLWithActName = '<act:act><act:title>' + testTitle + '</act:title></act:act>';
  const testXMLWithoutActName = '<act:act></act:act>';

  it('returns null if act:title field is not found', () => {
    const result = actsRegulationsController.parseTitleFromXML(testXMLWithoutActName);
    expect(result).toEqual(null);
  });

  it('returns Act title if act:title field is present', () => {
    const result = actsRegulationsController.parseTitleFromXML(testXMLWithActName);
    expect(result).toEqual(testTitle);
  });
});
