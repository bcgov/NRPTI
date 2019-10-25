const SpacialUtils = require('./spatialUtils');

describe('SpacialUtils', () => {
  describe('getGeometryArray', () => {
    describe('error', () => {
      it('returns an empty array when geo parameter is undefined', () => {
        const result = SpacialUtils.getGeometryArray();
        expect(result).toEqual([]);
      });

      it('returns an empty array when geo parameter is null', () => {
        const result = SpacialUtils.getGeometryArray(null);
        expect(result).toEqual([]);
      });
    });

    describe('success', () => {
      let convertWKTToGeoJsonSpy;
      let convertGeoJSONToEPSG3005Spy;

      beforeAll(() => {
        convertWKTToGeoJsonSpy = jest.spyOn(SpacialUtils, 'convertWKTToGeoJson').mockImplementation(() => {
          return 321;
        });
        convertGeoJSONToEPSG3005Spy = jest.spyOn(SpacialUtils, 'convertGeoJSONToEPSG3005').mockImplementation();

        SpacialUtils.getGeometryArray({ wktGeometry: 123 });
      });

      afterAll(() => {
        convertWKTToGeoJsonSpy.mockRestore();
        convertGeoJSONToEPSG3005Spy.mockRestore();
      });

      it('calls convertWKTToGeoJsonSpy', () => {
        expect(convertWKTToGeoJsonSpy).toHaveBeenCalledWith(123);
      });

      it('calls convertGeoJSONToEPSG3005', () => {
        expect(convertGeoJSONToEPSG3005Spy).toHaveBeenCalledWith(321);
      });
    });
  });

  describe('convertWKTToGeoJson', () => {
    describe('error', () => {
      it('returns an empty array when wktGeometry parameter is undefined', () => {
        const result = SpacialUtils.convertWKTToGeoJson();
        expect(result).toEqual([]);
      });

      it('returns an empty array when wktGeometry parameter is null', () => {
        const result = SpacialUtils.convertWKTToGeoJson(null);
        expect(result).toEqual([]);
      });

      it('throws an error if wktGeometry is not valid wkt (well-knwon text) format', () => {
        expect(() => SpacialUtils.convertWKTToGeoJson('INVALID((0 0, a b c d, 0))')).toThrow('Expected geometry type');
      });
    });

    describe('success', () => {
      beforeEach(() => {
        SpacialUtils.getGeometryArray('POLYGON((0 0, 1 0, 1 1, 1 0, 0 0))');
      });

      it('returns wkt format data in geoJSON format', () => {
        const polygonWkt = 'POLYGON((0 0, 1 0, 1 1, 1 0, 0 0))';

        const result = SpacialUtils.convertWKTToGeoJson(polygonWkt);
        expect(result).toEqual([{ type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [1, 0], [0, 0]]] }]);
      });

      it('parses nested wkt GeometryCollection shapes into a flat array of geoJSON shapes', () => {
        const geometryCollectionWkt =
          'GEOMETRYCOLLECTION(POINT(5 5), LINESTRING( 6 6, 7 7, 8 8), POLYGON((0 0, 1 0, 1 1, 1 0, 0 0)))';

        const result = SpacialUtils.convertWKTToGeoJson(geometryCollectionWkt);
        expect(result).toEqual([
          { type: 'Point', coordinates: [5, 5] },
          { type: 'LineString', coordinates: [[6, 6], [7, 7], [8, 8]] },
          { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [1, 0], [0, 0]]] }
        ]);
      });
    });
  });

  describe('convertGeoJSONToEPSG3005', () => {
    describe('error', () => {
      it('returns an empty array when wktGeometry parameter is undefined', () => {
        const result = SpacialUtils.convertGeoJSONToEPSG3005();
        expect(result).toEqual([]);
      });

      it('returns an empty array when wktGeometry parameter is null', () => {
        const result = SpacialUtils.convertGeoJSONToEPSG3005(null);
        expect(result).toEqual([]);
      });

      it('throws an error if geoJsonArray is not valid geoJSON format', () => {
        expect(() =>
          SpacialUtils.convertGeoJSONToEPSG3005([
            { type: 'Polygon', invalid: [[[0, 0], [1, 0], [1, 1], [1, 0], [0, 0]]] }
          ])
        ).toThrow("Cannot read property 'length' of undefined");
      });
    });

    describe('success', () => {
      it('returns wkt format data in geoJSON format', () => {
        const polygonGeoJSON = [{ type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [1, 0], [0, 0]]] }];

        const result = SpacialUtils.convertGeoJSONToEPSG3005(polygonGeoJSON);

        const expectedResult = [
          {
            type: 'Polygon',
            coordinates: [
              [
                [-138.44586069487917, 44.19943650435653],
                [-138.44584850389606, 44.19943809470215],
                [-138.44585066954122, 44.19944704717088],
                [-138.44584850389606, 44.19943809470215],
                [-138.44586069487917, 44.19943650435653]
              ]
            ]
          }
        ];

        expect(result).toEqual(expectedResult);
      });

      it('parses nested wkt GeometryCollection shapes into a flat array of geoJSON shapes', () => {
        const geometryCollectionGeoJSON = [
          { type: 'Point', coordinates: [5, 5] },
          { type: 'LineString', coordinates: [[6, 6], [7, 7], [8, 8]] },
          { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [1, 0], [0, 0]]] }
        ];

        const result = SpacialUtils.convertGeoJSONToEPSG3005(geometryCollectionGeoJSON);

        const expectedResult = [
          { type: 'Point', coordinates: [-138.44581056814883, 44.199489218415074] },
          {
            type: 'LineString',
            coordinates: [
              [-138.44580054279055, 44.19949976122287],
              [-138.4457905174282, 44.1995103040293],
              [-138.44578049206183, 44.19952084683441]
            ]
          },
          {
            type: 'Polygon',
            coordinates: [
              [
                [-138.44586069487917, 44.19943650435653],
                [-138.44584850389606, 44.19943809470215],
                [-138.44585066954122, 44.19944704717088],
                [-138.44584850389606, 44.19943809470215],
                [-138.44586069487917, 44.19943650435653]
              ]
            ]
          }
        ];

        expect(result).toEqual(expectedResult);
      });
    });
  });
});
