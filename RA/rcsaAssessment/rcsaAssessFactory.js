angular.module('riskAssessmentApp').factory('rcsaAssessmentFactory', function ($http) {
    'use strict';
    var riskAssessmentInfo = {};
    
    var serializeRiskAssessment = function (assessment) {
        var objToReturn = {
            assessmentName: assessment.assessmentName,
            scopeType: assessment.scopeType,
            dueDate: assessment.dueDate,
            rcsaOwnerWorkerKey: assessment.rcsaOwnerWorkerKey,
            rcsaPreparerWorkerKey: assessment.rcsaPreparerWorkerKey,
            availableRolesKey: assessment.availableRolesKey,
            selectedRolesKey: assessment.selectedRolesKey,
            geoLocationLst: assessment.geoLocationLst,
            erhList: assessment.erhList,
            legalEntity: assessment.legalEntity,
            filteredErhList: assessment.filteredErhList,
            riskAssessmentCycleKey : assessment.riskAssessmentCycleKey,
            editAssessOwnerRcsaFlag : assessment.editAssessOwnerRcsaFlag,
            riskAssessmentKey : assessment.riskAssessmentKey,
            rcsaPreparerWorker : assessment.rcsaPreparerWorker,
            rcsaOwnerWorker : assessment.rcsaOwnerWorker,
            erhFlag : assessment.erhFlag,
            retroScope : assessment.retroScope,
            retroList : assessment.retroList,
            assessmentNameToEdit : assessment.assessmentNameToEdit,
            riskAssesLevelLookupCode: assessment.riskAssesLevelLookupCode
        };
        // set primary key based on Save or Update
        if (assessment.riskAssessmentKey) {
            objToReturn.riskAssessmentKey = assessment.riskAssessmentKey;
        }

        return objToReturn;
    };
    var serializeTopRisk = function (topRisk, assessmentId) {
        var topRiskData = {
            topRiskName: topRisk.topRiskName,
            mitigationActivityDes: topRisk.mitigationActivityDes,
            issuePltfLookUpCode: topRisk.issuePltfLookUpCode,
            issueNo: topRisk.issueNo,
            riskAssessmentKey: assessmentId,
            riskAssessmentKeyConcernKey: topRisk.riskAssessmentKeyConcernKey
        };

        return topRiskData;
    };

    var serializeAddchallenge = function (challengeDTO, id) {
        var riskAssessmentKey = id;
        var objToReturn = {
            originatingGrpLkupCode: challengeDTO.originatingGrpLkupCode,
            challengeObjectName: challengeDTO.challengeObjectName,
            challengeDescription: challengeDTO.challengeDescription,
            initByWorkerKey: challengeDTO.initByWorkerKey,
            themesKyList: [],
            challengeResponseWrkKey: challengeDTO.challengeResponseWrkKey,
            riskAssessmentKey: riskAssessmentKey,
            challengeResponseComment: challengeDTO.challengeResponseComment,
            challengeDesLkupCode: challengeDTO.challengeDesLkupCode,
            esclRqrFlag: challengeDTO.esclRqrFlag,
            addChlngToChklst: challengeDTO.addChlngToChklst,
            riskAssessmentChecklistSessionKey: challengeDTO.riskAssessmentChecklistSessionKey
        };

        // set primary key based on Save or Update
        if (challengeDTO.riskAssessmentChallengeKey) {
            objToReturn.riskAssessmentChallengeKey = challengeDTO.riskAssessmentChallengeKey;
        }
        challengeDTO.themesUtilKeyList.forEach(function(obj) {
			objToReturn.themesKyList.push(obj.id);
		});
        return objToReturn;
    };

    return {
        sessionKey: null,
        //sessionFlag: null,
        getAttestorRoles: function () {
            return $http.get('app/assessment/rest/attestorsAvailableRoles');
        },
        setAssessmentInfoDTO: function(riskAssessmentDTO) {
        		riskAssessmentInfo = riskAssessmentDTO;
        },
        getAssessmentInfoDTO: function() {
        	return riskAssessmentInfo;
        },
        getAssessmentInfo: function (assessmentId) {
            return $http.get('app/assessment/rest/assessmentInfo?riskAssessmentId=' + assessmentId);
        },
        getChecklistsInfo: function (assessmentId) {
            return $http.get('app/assessment/rest/checklist?riskAssessmentKey=' + assessmentId);
        },
        deleteTopRisk: function (riskAssessmentKeyConcernKey,statusLookUpCode) {
            return $http.post('app/assessment/rest/deleteTopRisk/' + riskAssessmentKeyConcernKey + '/' + statusLookUpCode);
        },
        deleteDocument: function (riskAssessmentAtachKey,statusLookUpCode){
            return $http.post('app/upload/deleteAttchDoc/' + riskAssessmentAtachKey + '/' + statusLookUpCode);
        },
        getAssessmentOptions: function () {
            return $http.get('app/rest/cacheDropdown/RA_ASES_LVL_TYP')
                .then(function (response) {
                    return response.data;
                });
        },
        getCorrespondingIssuePlatformOptions: function () {
            return $http.get('app/rest/cacheDropdown/RA_KY_CNCRN_IS_PLTFM')
                .then(function (response) {
                    return response.data;
                });
        },
        selectedAssessmentRoles: function (asstSelectedRoles) {
            var selectedRoles = [];
            var objToReturn;
            asstSelectedRoles.forEach(function (obj) {
                objToReturn = {};
                objToReturn.riskAssessmentRoleTypeKey = obj.riskAssessmentRoleTypeKey;
                objToReturn.roleName = obj.roleName;
                selectedRoles.push(objToReturn);
            });
            return selectedRoles;
        },
        saveAssessment: function (assessment) {
            var request = serializeRiskAssessment(assessment);
            console.log('request payload', JSON.stringify(request));
            var endpoint = 'app/assessment/rest/riskAssessment';
            return $http.post(endpoint, request);
        },
        saveTopRisk: function (topRisk, id) {
            var request = serializeTopRisk(topRisk, id);
            console.log('request payload', JSON.stringify(request));
            console.log('ID :: ', id);
            var endpoint = 'app/assessment/rest/createUpdateTopRisks';
            return $http.post(endpoint, request);
        },
        saveChallenge: function (challengeDTO, id) {
            var request = serializeAddchallenge(challengeDTO, id);
            console.log('request payload', JSON.stringify(request));
            console.log('ID :: ', id);
            var endpoint = 'app/rcsachallenge/rest/addchallenge';
            return $http.post(endpoint, request);
        },
        getAssessmentInfoWithQuestionnaire: function (assessmentId, questionnaireFlag) {
            return $http.get('app/assessment/rest/assessmentInfo?riskAssessmentId=' + assessmentId + '&questionnaireFlag=' + questionnaireFlag);
        },
        saveQuestionnaire: function (riskAssessmentDTO) {
            return $http.post('app/assessment/rest/saveQuestionnaire', riskAssessmentDTO);
        },
        deleteRcsaChallenge: function (rcsaChallengeKey) {
            return $http.post('app/rcsachallenge/rest/deletechallenge/' + rcsaChallengeKey);
        },
        getAssessmentPreparerInfo: function (assessmentId) {
            return $http.get('app/assessment/rest/assessmentPreparerInfo?riskAssessmentId=' + assessmentId);
        },
        getAssessmentChallengeInfo: function (challengeId) {
            return $http.get('app/rcsachallenge/rest/editChallengeDetails?challengeKey=' + challengeId);
        },
        getTopRisk: function (topRiskId) {
            return $http.get('app/assessment/rest/getTopRisk/' + topRiskId)
                .then(function (response) {
                    return response.data;
                });
        },
        assessmentStatusValidation: function (assessmentId, action) {
            return $http.get('app/assessment/rest/validate?assessmentKey=' + assessmentId + '&action=' + action);
        },
        assessmentStatusUpdate: function (assessmentId, action) {
            return $http.post('app/assessment/rest/executeAssessmentAction/' + assessmentId + '/' + action);
        },
        getThemeOptions: function () {
          return $http.get('app/rest/cacheDropdown/RA_CHLNG_THEME');
        },
        saveSummaryRatings: function (editRiskAssessmentDTO) {
            return $http.post('app/assessment/rest/createUpdateRatings', editRiskAssessmentDTO);
        },
        setContextAndValue : function(riskAssessmentDTO, $scope){
        	if(riskAssessmentDTO.scopeType === 'RA_BUS_UNIT'){
        		$scope.context = 'ASS_ERH';
        		$scope.utilList = riskAssessmentDTO.erhList;
        	}else if(riskAssessmentDTO.scopeType === 'RA_GEO_LOCAT'){
        		$scope.context = 'GEO';
        		$scope.utilList = riskAssessmentDTO.geoLocationLst;
        	}else{
        		$scope.context = 'LEGAL';
        		$scope.utilList = riskAssessmentDTO.legalEntity;
        	}
        	console.log('context :: '+$scope.context);
        	console.log('contextValue :: '+$scope.utilList);
        },
        utilList: function(riskAssessmentKey){
        	return $http.get('app/assessment/rest/utilList?riskAssessmentKey='+riskAssessmentKey);
        }
    };
});
