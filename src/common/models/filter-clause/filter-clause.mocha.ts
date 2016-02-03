'use strict';

import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';

import { Timezone, Duration } from 'chronoshift';
import { $, Expression } from 'plywood';
import { FilterClause, FilterClauseJS } from './filter-clause';

describe('FilterClause', () => {
  it('is an immutable class', () => {
    testImmutableClass<FilterClauseJS>(FilterClause, [
      {
        expression: { op: 'ref', name: 'language' },
        check: {
          op: 'literal',
          value: {
            "setType": "STRING",
            "elements": ["en"]
          },
          "type": "SET"
        }
      },
      {
        expression: { op: 'ref', name: 'language' },
        check: {
          op: 'literal',
          value: {
            "setType": "STRING",
            "elements": ["en", null]
          },
          "type": "SET"
        }
      },
      {
        expression: { op: 'ref', name: 'language' },
        check: {
          op: 'literal',
          value: {
            "setType": "STRING",
            "elements": ["en"]
          },
          "type": "SET"
        },
        exclude: true
      },
      {
        expression: { op: 'ref', name: 'time' },
        check: {
          op: 'literal',
          value: {
            "setType": "TIME_RANGE",
            "elements": [{ start: new Date('2015-11-11'), end: new Date('2015-11-12') }]
          },
          "type": "SET"
        },
        exclude: true
      },

      // Dynamic!
      {
        expression: { op: 'ref', name: 'language' },
        check: {
          op: 'chain',
          expression: { op: 'ref', name: 'n' },
          action: { action: 'timeRange', duration: 'P1D', step: -1 }
        }
      },
      {
        expression: { op: 'ref', name: 'language' },
        check: {
          op: 'chain',
          expression: { op: 'ref', name: 'm' },
          actions: [
            { action: 'timeShift', duration: 'P5D', step: -1 },
            { action: 'timeRange', duration: 'P1D', step: -1 }
          ]
        }
      }
    ]);
  });

  describe("evaluate", () => {
    it("works with now", () => {
      var clause = FilterClause.fromJS({
        expression: { op: 'ref', name: 'language' },
        check: {
          op: 'chain',
          expression: { op: 'ref', name: 'n' },
          action: { action: 'timeRange', duration: 'P1D', step: -1 }
        }
      });

      var now = new Date('2016-01-15T11:22:33Z');
      var maxTime = new Date('2016-01-15T08:22:00Z');

      expect(clause.evaluate(now, maxTime, Timezone.UTC).toJS()).to.deep.equal({
        "check": {
          "op": "literal",
          "type": "TIME_RANGE",
          "value": {
            "end": new Date('2016-01-15T11:22:33.000Z'),
            "start": new Date('2016-01-14T11:22:33.000Z')
          }
        },
        "expression": {
          "name": "language",
          "op": "ref"
        }
      });
    });

    it("works with maxTime", () => {
      var clause = FilterClause.fromJS({
        expression: { op: 'ref', name: 'language' },
        check: {
          op: 'chain',
          expression: { op: 'ref', name: 'm' },
          action: { action: 'timeRange', duration: 'P1D', step: -1 }
        }
      });

      var now = new Date('2016-01-15T11:22:33Z');
      var maxTime = new Date('2016-01-15T08:22:00Z');

      expect(clause.evaluate(now, maxTime, Timezone.UTC).toJS()).to.deep.equal({
        "check": {
          "op": "literal",
          "type": "TIME_RANGE",
          "value": {
            "end": new Date('2016-01-15T08:23:00Z'),
            "start": new Date('2016-01-14T08:23:00Z')
          }
        },
        "expression": {
          "name": "language",
          "op": "ref"
        }
      });
    });
  });
});
