exports.CONFIG_TYPES = {
  enforcementActionText: 'enforcementActionText',
  communicationPackage: 'communicationPackage'
};

exports.CONFIG_APPS = {
  BCMI: 'BCMI',
  NRPTI: 'NRPTI',
  NRCED: 'NRCED',
  LNG: 'LNG'
};

exports.OBJECTS_STORE_URL = () => {
  // Use env endpoint url, or default to this URL if empty.
  // S3 client requires a protocol, so if the env variable doesn't have one, add https://
  const tempUrl = process.env.OBJECT_STORE_endpoint_url || 'https://nrs.objectstore.gov.bc.ca';
  const url = tempUrl.startsWith('https://') ? new URL(tempUrl) : new URL(`https://${tempUrl}`);
  return url.href;
};
