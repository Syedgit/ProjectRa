/**
 * @ngdoc Factory
 * @name RCSA
 * @module riskAssessmentApp
 * @description RCSA factory for interacting with the RCSA Cycle and Assessment API
 */
angular.module('riskAssessmentApp').factory('RcsaFactory', function ($http, $rootScope, OrcitLoader) {
    'use strict';

    var serializeRcsaCycle = function (rcsaCycle) {
        var objToReturn = {
            longName: rcsaCycle.longName,
            assessmentDueDate: rcsaCycle.assessmentDueDate,
            cycleStartDate: rcsaCycle.cycleStartDate,
            cycleEndDate:  rcsaCycle.cycleEndDate,
            populateFromRskAssesCycKey:   rcsaCycle.populateFromRskAssesCycKey,
            clasLkupCode: rcsaCycle.clasLkupCode,
            riskAssesCycRatingScopeId: rcsaCycle.riskAssesCycRatingScopeId,
            cycDesc: rcsaCycle.cycDesc,
            cycTypLkupCode: rcsaCycle.cycTypLkupCode,
            cycStatLkupCode: rcsaCycle.cycStatLkupCode,
            riskAssesCycRatingScopeKey:rcsaCycle.riskAssesCycRatingScopeKey,
//            erhDate: rcsaCycle.erhDate,
            erhDateKey: rcsaCycle.erhDateKey,
//            opLossValidationDate: rcsaCycle.opLossValidationDate,
            opLossValidationDateKey: rcsaCycle.opLossValidationDateKey,
            opLossToDate : rcsaCycle.opLossToDate,
            opLossFromDate : rcsaCycle.opLossFromDate,
            issueFromDate: rcsaCycle.issueFromDate,
            issueToDate: rcsaCycle.issueToDate,
            kriFromDate : rcsaCycle.kriFromDate,
            kriToDate : rcsaCycle.kriToDate
        };

        if (rcsaCycle.rskAsesCycleKey) {
            objToReturn.rskAsesCycleKey = rcsaCycle.rskAsesCycleKey;
        }
        return objToReturn;
    };

    var serializeRcsaCycleName = function (longName) {
        var objToReturn = {
            longName: longName
        };
        return objToReturn;
    };
    return {
        getPopulateFromOptions: function () {
            return $http.get('app/rcsa/rest/cycle/populate/')
                .then(function (response) {
                    return response.data;
                });
        },
        getClassificationOptions: function () {
            return $http.get('app/rest/cacheDropdown/RA_CYCL_FREQ')
                .then(function (response) {
                    return response.data;
                });
        },
        getSummaryRatingLevelOptions: function () {
            return $http.get('app/rest/cacheDropdown/RA_RATING_SCOPE')
                .then(function (response) {
                    return response.data;
                });
        },
        getCycleTypeOptions: function () {
            return $http.get('app/rest/cacheDropdown/RA_CYCL_TYP')
                .then(function (response) {
                    return response.data;
                });
        },
        getCycleStatusOptions: function () {
            return $http.get('app/rest/cacheDropdown/RA_CYCLE_STATUS')
                .then(function (response) {
                    return response.data;
                });
        },
        getOplossValidationDate: function (){
          return $http.get('app/rest/cacheDropdown/RA_RSK_ASES_OPLOSS_DT')
          .then(function(response){
            return response.data;
          });
        },
        getCycleNameList: function () {
            return OrcitLoader.load($http.get('app/rcsa/rest/cycle/cycleName'));
        },
        saveRcsaCycle: function (rcsaCycle, id) {
            var request = serializeRcsaCycle(rcsaCycle);
            console.log('request payload', JSON.stringify(request));
            console.log('ID :: ', id);
            var endpoint = 'app/rcsa/rest/cycle/create';
            return $http.post(endpoint, request);
        },
        closeCycle: function (rcsaCycle, id) {
            var request = serializeRcsaCycle(rcsaCycle);
            console.log('request payload', JSON.stringify(request));
            console.log('ID :: ', id);
            var endpoint = 'app/rcsa/rest/cycle/closeCycle';
            return $http.post(endpoint, request);
        },
        cancelCycle: function (rcsaCycle, id) {
            var request = serializeRcsaCycle(rcsaCycle);
            console.log('request payload', JSON.stringify(request));
            console.log('ID :: ', id);
            var endpoint = 'app/rcsa/rest/cycle/cancelCycle';
            return $http.post(endpoint, request);
        },
        getCycleName: function (longName) {
           // return $http.get('app/rcsa/rest/cycle/name/' + longName);
        	var request = serializeRcsaCycleName(longName);
            var endpoint = 'app/rcsa/rest/cycle/name';
            return $http.post(endpoint, request);
        },
        cycleData: function (id) {
            return $http.get('app/rcsa/rest/cycle/' + id);
        },
        assessmentsData: function (id) {
            return $http.get('app/rcsa/rest/getAssesmentsByCycleId/' + id);
        },
        assessmentDetails: function (riskAssessmentKey,statusLookUpCode) {
            return $http.post('app/rcsa/rest/cycle/updateassessments/' + riskAssessmentKey + '/' + statusLookUpCode);
        },
        startAssessments: function (rskAsesCycleKey) {
            return $http.get('app/rcsa/rest/cycle/startAssessment?rskAsesCycleKey=' + rskAsesCycleKey);
        },
        disableonOpenCycles: function () {
    		return $http.get('app/rcsa/rest/cycle/openCyclesLockDown')
    			.then(function (response) {
    				return response.data;
    			});
    	},
    	OplossDatesFactory: function(oplossValDate) {
    	  return $http.get('app/rcsa/rest/getOplossDateRange/' + oplossValDate);
    	},
    	//Get tree data
    	assessmentStatusOptions: function () {
    		return $http.get('app/assessment/rest/assessmentStatus')
    			.then(function (response) {
    				return response.data;
    			});
    	}
    };
});
