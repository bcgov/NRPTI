const EPIC_RECORD_TYPE = require('./epic-record-type-enum');

describe('EPIC_RECORD_TYPE', () => {
  describe('EPIC_RECORD_TYPE object', () => {
    it('should be defined', () => {
      expect(EPIC_RECORD_TYPE).toBeDefined();
    });

    it('should have properties for different record types', () => {
      expect(EPIC_RECORD_TYPE).toHaveProperty('Order');
      expect(EPIC_RECORD_TYPE).toHaveProperty('Inspection');
      expect(EPIC_RECORD_TYPE).toHaveProperty('Certificate');
      expect(EPIC_RECORD_TYPE).toHaveProperty('CertificateAmendment');
      expect(EPIC_RECORD_TYPE).toHaveProperty('ManagementPlan');
    });
  });

  describe('EPIC_RECORD_TYPE properties for Order', () => {
    it('should have an array of objects with specific properties for Orders', () => {
      expect(Array.isArray(EPIC_RECORD_TYPE.Order)).toBe(true);
      EPIC_RECORD_TYPE.Order.forEach(order => {
        expect(order).toHaveProperty('type');
        expect(order).toHaveProperty('milestone');
        expect(order).toHaveProperty('getUtil');
      });
    });

    it('Functions within the record objects should return instances of specific classes', () => {
      EPIC_RECORD_TYPE.Order.forEach(order => {
        const util = order.getUtil({});
        expect(util).toBeDefined();
      });
    });
  });

  describe('EPIC_RECORD_TYPE properties for Inspection', () => {
    it('should have an array of objects with specific properties for Inspection', () => {
      expect(Array.isArray(EPIC_RECORD_TYPE.Inspection)).toBe(true);
      EPIC_RECORD_TYPE.Inspection.forEach(inspection => {
        expect(inspection).toHaveProperty('type');
        expect(inspection).toHaveProperty('milestone');
        expect(inspection).toHaveProperty('getUtil');
      });
    });

    it('Functions within the record objects should return instances of specific classes', () => {
      EPIC_RECORD_TYPE.Inspection.forEach(inspection => {
        const util = inspection.getUtil({});
        expect(util).toBeDefined();
      });
    });
  });

  describe('EPIC_RECORD_TYPE properties for Certificate', () => {
    it('should have an array of objects with specific properties for Certificate', () => {
      expect(Array.isArray(EPIC_RECORD_TYPE.Certificate)).toBe(true);
      EPIC_RECORD_TYPE.Certificate.forEach(certificate => {
        expect(certificate).toHaveProperty('type');
        expect(certificate).toHaveProperty('milestone');
        expect(certificate).toHaveProperty('getUtil');
      });
    });

    it('Functions within the record objects should return instances of specific classes', () => {
      EPIC_RECORD_TYPE.Certificate.forEach(certificate => {
        const util = certificate.getUtil({});
        expect(util).toBeDefined();
      });
    });
  });

  describe('EPIC_RECORD_TYPE properties for CertificateAmendment', () => {
    it('should have an array of objects with specific properties for CertificateAmendment', () => {
      expect(Array.isArray(EPIC_RECORD_TYPE.CertificateAmendment)).toBe(true);
      EPIC_RECORD_TYPE.CertificateAmendment.forEach(certificateAmendment => {
        expect(certificateAmendment).toHaveProperty('type');
        expect(certificateAmendment).toHaveProperty('milestone');
        expect(certificateAmendment).toHaveProperty('getUtil');
      });
    });

    it('Functions within the record objects should return instances of specific classes', () => {
      EPIC_RECORD_TYPE.CertificateAmendment.forEach(certificateAmendment => {
        const util = certificateAmendment.getUtil({});
        expect(util).toBeDefined();
      });
    });
  });

  describe('EPIC_RECORD_TYPE properties for ManagementPlan', () => {
    it('should have an array of objects with specific properties for ManagementPlan', () => {
      expect(Array.isArray(EPIC_RECORD_TYPE.ManagementPlan)).toBe(true);
      EPIC_RECORD_TYPE.ManagementPlan.forEach(managementPlan => {
        expect(managementPlan).toHaveProperty('type');
        expect(managementPlan).toHaveProperty('milestone');
        expect(managementPlan).toHaveProperty('getUtil');
      });
    });

    it('Functions within the record objects should return instances of specific classes', () => {
      EPIC_RECORD_TYPE.ManagementPlan.forEach(managementPlan => {
        const util = managementPlan.getUtil({});
        expect(util).toBeDefined();
      });
    });
  });

  describe('getSome', () => {
    it('should return an empty array if no record types are provided', () => {
      const result = EPIC_RECORD_TYPE.getSome();
      expect(result).toEqual([]);
    });

    it('should return an empty array if record types array is empty', () => {
      const result = EPIC_RECORD_TYPE.getSome([]);
      expect(result).toEqual([]);
    });

    it('should return an empty array if provided record types do not exist', () => {
      const result = EPIC_RECORD_TYPE.getSome(['NonExistentType']);
      expect(result).toEqual([]);
    });

    it('should return a subset of EPIC record types based on provided record types', () => {
      const result = EPIC_RECORD_TYPE.getSome(['Order', 'Certificate', 'ManagementPlan']);

      expect(result.some(obj => obj.type.name === 'Order')).toBe(true);
      expect(result.some(obj => obj.type.name === 'Certificate Package')).toBe(true);
      expect(result.some(obj => obj.type.name === 'Plan')).toBe(true);
    });
  });

  describe('getAll', () => {
    it('should return an array with all supported EPIC record types', () => {
      const result = EPIC_RECORD_TYPE.getAll();

      // Count all enum record types, excludes getSome and getAll
      let itemCount = 0;
      Object.keys(EPIC_RECORD_TYPE).forEach(key => {
        if (key !== 'getSome' && key !== 'getAll') {
          itemCount = itemCount + EPIC_RECORD_TYPE[key].length;
        }
      });

      expect(result).toHaveLength(itemCount);

      expect(result.some(obj => obj.type.name === 'Order')).toBe(true);
      expect(result.some(obj => obj.type.name === 'Inspection Record')).toBe(true);
      expect(result.some(obj => obj.type.name === 'Certificate Package')).toBe(true);
      expect(result.some(obj => obj.type.name === 'Amendment Package')).toBe(true);
      expect(result.some(obj => obj.type.name === 'Plan')).toBe(true);
    });
  });
});
