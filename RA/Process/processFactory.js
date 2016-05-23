angular.module('riskAssessmentApp').factory('processFactory', function($http) {
	'use strict';
	var processName;
	var serializeProcess = function(process) {
		var objToReturn = {
		    processLongName: process.processLongName,
		    processStatementText: process.processStatementText,
		    epcfKey: process.epcfKey,
		    epcfDescription: process.epcfDescription,
		    businessSegmentOrControlFunction: process.businessSegmentOrControlFunction,
		    erhKey: process.erhUtilKeyList[0].id,
		    geographicLocationKeyList: [],
		    legalEntityKeyList: [],
		    processOwnerWorkerKey: process.processOwnerWorkerKey,
		    prcsOwner: process.prcsOwner,
		    requestedEpcfKey: process.requestedEpcfKey,
		    requestedEpcfComment: process.requestedEpcfComment
		};
		// set primary key based on Save or Update
		if (process.processKey) {
			objToReturn.processKey = process.processKey;
		}
		// This field is optional
		if (process.userReferenceId) {
			objToReturn.userReferenceId = process.userReferenceId;
		}
		// This field is optional
		if (process.erhAllLevelsUtilKeyList && process.erhAllLevelsUtilKeyList.length) {
			objToReturn.erhAllLevelsKey = process.erhAllLevelsUtilKeyList[0].id;
		}
		process.legalEntitiesKeyList.forEach(function(obj) {
			objToReturn.legalEntityKeyList.push(obj.id);
		});
		process.geoLocationsKeyList.forEach(function(obj) {
			objToReturn.geographicLocationKeyList.push(obj.id);
		});

		return objToReturn;
	};
	var serializeProcessChallenge = function(challengeDTO, id) {
		var objToReturn = {
		    originatingGrpLkupCode: challengeDTO.originatingGrpLkupCode,
		    challengeObjectName: challengeDTO.challengeObjectName,
		    challengeDescription: challengeDTO.challengeDescription,
		    initByWorkerKey: challengeDTO.initByWorkerKey,
		    themesKyList: [],
		    challengeResponseWrkKey: challengeDTO.challengeResponseWrkKey,
		    processKey: id,
		    challengeResponseComment: challengeDTO.challengeResponseComment,
		    challengeDesLkupCode: challengeDTO.challengeDesLkupCode,
		    esclRqrFlag: challengeDTO.esclRqrFlag,
		    addChlngToChklst: challengeDTO.addChlngToChklst,
		    riskAssessmentChecklistSessionKey: challengeDTO.riskAssessmentChecklistSessionKey
		};

		// set primary key based on Save or Update
		if (challengeDTO.processChallengeKey) {
			objToReturn.processChallengeKey = challengeDTO.processChallengeKey;
		}
		challengeDTO.themesUtilKeyList.forEach(function(obj) {
			objToReturn.themesKyList.push(obj.id);
		});
		return objToReturn;
	};
	return {
	    getTreeviewOptions: function() {
		    return {
		        placeholder: 'Select',
		        output: 'text',
		        treeview: {
		            uniqueIdentifier: 'id',
		            displayField: 'text'
		        }

		    };
	    },
	    setprocessname: function(name) {
		    processName = name;
	    },
	    getprocessname: function() {
		    return processName;
	    },
	    getIdList: function(dataList, idList) {
		    if (dataList && dataList.length > 0) {
			    $.each(dataList, function(index, data) {
				    if (data && data.id) {
					    idList.push(data.id);
				    }
			    });
		    }
	    },
	    getIdFromList: function(dataList) {
		    var returnValue;
		    if (dataList && dataList.length > 0) {
			    $.each(dataList, function(index, data) {
				    if (data && data.id) {
					    returnValue = data.id;
					    return;
				    }
			    });
		    }
		    return returnValue;
	    },
	    saveProcess: function(process, id) {
		    var request = serializeProcess(process);
		    console.log('request payload', JSON.stringify(request));
		    console.log('ID :: ', id);
		    // do this if you have differnet end point for save and update
		    // var endpoint = (id) ? 'app/prcs/rest/process/' + id : 'app/prcs/rest/process';
		    var endpoint = 'app/prcs/rest/process';
		    return $http.post(endpoint, request);
	    },
	    checkTwoArrysMatched: function(existedArray, currentArray) {
		    var returnFlag = false;
		    var matchedIndex;
		    $.each(existedArray, function(key, value) {
			    matchedIndex = $.inArray(value, currentArray);
			    if (matchedIndex === -1) {
				    returnFlag = true;
			    }
		    });
		    return returnFlag;
	    },
	    checkExistedArrayMatched: function(existedArray, currentValue) {
		    var returnFlag = false;
		    $.each(existedArray, function(key, value) {
			    if (value.id === currentValue) {
				    returnFlag = true;
			    }
		    });
		    return returnFlag;
	    },
	    getProcessOwnerInfo: function(processKey) {
		    return $http.get('app/prcchallenge/rest/processOwnerInfo?processKey=' + processKey);
	    },
	    saveProcessChallenge: function(challengeDTO, id) {
		    var request = serializeProcessChallenge(challengeDTO, id);
		    console.log('request payload', JSON.stringify(request));
		    console.log('ID :: ', id);
		    var endpoint = 'app/prcchallenge/rest/addPrcChallenge';
		    return $http.post(endpoint, request);
	    },
	    getProcessChallengeInfo: function(challengeId) {
		    return $http.get('app/prcchallenge/rest/editChallengeDetails?challengeKey=' + challengeId);
	    },
	    deleteProcessChallenge: function(processChallengeKey) {
		    return $http.post('app/prcchallenge/rest/deletechallenge/' + processChallengeKey);
	    }
	};
});
