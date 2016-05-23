angular.module('riskAssessmentApp').controller('EditAssessmentCtrl', function ($modal,$state,$scope, $rootScope, OrcitLoader, 
		$http, checklistConfig, kendoCustomDataSource, $stateParams, $location,
		ConfirmationConfig, rcsaAssessmentFactory, rcsaAssessmentService, topRiskValues, 
		attestorConfig, challengesGridConfig, assessmentDocConfig, $timeout) {
    'use strict';
    // ZKDLMAV 6830 - Remove default responses from OPRISK Checklist
    var setConfirmationWinButtons = function (hideYesBtn, hideNoBtn, showOkBtn) {
        $scope.hideYesBtn = hideYesBtn;
        $scope.hideNoBtn = hideNoBtn;
        $scope.showOkBtn = showOkBtn;
    };
   
    $scope.isEditAssessmentGrid = true;

    $scope.panelTitle = 'Assessment';

    $scope.requiredFlag = 'required';

    $scope.outstandingComments = '';

    $scope.cycleDesc = '';

    $scope.standardName ='';

    $scope.qualityElement ='';

    $scope.searchDesc = 'Y';

    $scope.searchID = '';

    $scope.searchTheme = '';

    $scope.chlgCmt = {
    		challengeComments : ''
    			};

    $scope.disablesearchTheme = false;
    $scope.disableUpdateBtn = true;
    $scope.challengesSearchGrid = false;
    
	var selectedChecklistEntries =[];

    $scope.retroChallengesSelection = new kendo.data.DataSource({
	});

	var duplicateOpRiskRecord = false;
	var disableSummaryService = false;
	var disableTopRiskService = false;
	var disableChallengesService = false;
	var disableattestationService = false;
	var disableOpChecklistService = false;
	var disableCorChecklistService = false;
	var disableDocsService = false;
	$scope.selectedResultLOV = 0;
	$scope.statusInfo = '';
	$scope.statusClass= '';
	$scope.challengeStatusInfo = '';
	$scope.challengeStatusClass= '';
	
	$scope.riskAsesCorCheckListDTO={
			preparerResponse : '',
			corComments: '',
			finalResult: '',
			questionOptionKey: 0,
			riskAssessmentKey: 0,
			riskAsesCklstSessionKey: 0
	};
	$scope.riskAssessmentRatingDTO = {
        ratingCommentDescription : ''
    };
	$scope.showExistWarning =false;
	$scope.editMode = false;
	$scope.challengesDTO={};
    $scope.challengThemesDataSource = kendoCustomDataSource.getDropDownDataSource('RA_CHLNG_THEME');
    $scope.challengeThemesOptions = {
	        placeholder: 'Select',
	        valuePrimitive: true,
	        autoBind: false,
	        autoClose: false,
	        maxSelectedItems: 1,
	        dataSource: $scope.challengThemesDataSource
	    };
    $scope.confirmRatingWinOptions = ConfirmationConfig.confirmationWinConfig;
    $scope.confirmationOpCheckOptions = ConfirmationConfig.confirmationWinConfig;
    OrcitLoader.load(rcsaAssessmentFactory.getAssessmentInfo($stateParams.assessmentId)).then(function (response) {
        $scope.riskAssessmentDTO = response.data;
        rcsaAssessmentFactory.setAssessmentInfoDTO($scope.riskAssessmentDTO);
    }, function (error) {
    	$scope.statusClass ='status invalid userErrorInfo';
    	var errorMessage = error.data.errorMsg;
        if (error.data.techErrorMsg) {
            errorMessage = error.data.techErrorMsg;
        }
        $scope.statusInfo = errorMessage;
     });
   
        
    $scope.summaryRatingOptions = rcsaAssessmentService.getSummaryRatingGrid();
    $scope.topRisksOptions = topRiskValues.topRisksGrid;
    $scope.challengesOptions = challengesGridConfig.getChallengesGrid;
    $scope.attestationOptions = attestorConfig.getAttestationGrid;
    $scope.opChecklistOptions = rcsaAssessmentService.getOpChecklistGrid();
    $scope.corChecklistOptions = rcsaAssessmentService.getCorChecklistGrid();
    $scope.assessmentDocumentOptions = assessmentDocConfig.getDocumentationGrid;
    $scope.handleCancel = function () {
        $scope.messageText = $rootScope.alertMessages['common.cancelConfirmMessage'];
        $scope.confirmationWin.open().center();
        $scope.yesCallback = cancelCallback;
    };
    $scope.openRationaleModal = function(rowData) {
      this.summaryRatingRationaleModal.open().center();
      $scope.hideRationalSave = true;
      $scope.riskAssessmentRatingDTO.ratingCommentDescription = rowData.ratingCommentDescription;
    };
    var cancelCallback = function () {
        $scope.confirmationWin.close();
        $location.path('/rcsa/viewAssessment');
    };

    $scope.updateAssessment = function () {
        $scope.messageText = $rootScope.alertMessages['common.confirmMessage'];
        $scope.confirmationWin.open().center();
        $scope.yesCallback = create;
    };

    var create = function () {
        $scope.closeConfirmation();
        OrcitLoader.load(rcsaAssessmentFactory.saveAssessment($scope.riskAssessmentDTO)).then(function () {
        	$scope.statusClass ='userSuccessInfo';
            $scope.statusInfo = $rootScope.alertMessages['editRcsa.updateAssessment'];
            $timeout(function () {
            	$scope.saveAssessmentCallBack();
            }, 500);
            
        }, function (error) {
            // failure
        	$scope.statusClass ='status invalid userErrorInfo';
            var errorMessage = error.data.errorMsg;
            if (error.data.techErrorMsg) {
                errorMessage = error.data.techErrorMsg;
            }
            $scope.statusInfo = errorMessage;
        });
    };
    $scope.opChecklistEditOptions = checklistConfig.opChecklistModalWinConfig;
    $scope.openEditCheklistModal = function(dataRow){
    	$scope.challengesSearchGrid = false;
    	selectedChecklistEntries =[];
    	selectedChecklistEntries = dataRow.challengeDtos;
    	$scope.selectedChecklistSession= dataRow.riskAsesCklstSessionKey;
    	checklistConfig.opChecklistModalWinConfig.title = 'Edit Checklist';
        $scope.opChecklistEditWin.setOptions(checklistConfig.opChecklistModalWinConfig);
        $scope.$broadcast('editOpChecklist', dataRow);
    };
    $scope.viewEditCheklistModal = function(dataRow){
//      $scope.challengesSearchGrid = false;
//      selectedChecklistEntries =[];
//      selectedChecklistEntries = dataRow.challengeDtos;
//      $scope.selectedChecklistSession= dataRow.riskAsesCklstSessionKey;
      checklistConfig.opChecklistModalWinConfig.title = 'View Checklist';
      $scope.opChecklistEditWin.setOptions(checklistConfig.opChecklistModalWinConfig);
      $scope.$broadcast('viewOpChecklist', dataRow);
  };
    $scope.corChecklistEditOptions = checklistConfig.corChecklistModalWinConfig;
    $scope.openEditCorCheklistModal = function(dataRow){
    	$scope.selectedChecklistSession= dataRow.riskAsesCklstSessionKey;
    	checklistConfig.opChecklistModalWinConfig.title = 'Edit Checklist';
        $scope.corChecklistEditWin.setOptions(checklistConfig.corChecklistModalWinConfig);
        $scope.$broadcast('editCorChecklist', dataRow);
    };
    
    $scope.viewCorCheklistModal = function(dataRow){
      $scope.selectedChecklistSession= dataRow.riskAsesCklstSessionKey;
      checklistConfig.opChecklistModalWinConfig.title = 'View Checklist';
      $scope.corChecklistEditWin.setOptions(checklistConfig.corChecklistModalWinConfig);
      $scope.$broadcast('viewCorChecklist', dataRow);
  };
	$scope.checkListModalSearchResults = checklistConfig.getOpChecklistResultGrid();

	$scope.clearChallengeSearch = function(){
		if($scope.searchDesc==='Y'){
			$scope.searchTheme='';
		}else{$scope.searchID='';}
	};
	$scope.addChallengeSearch = function(){
		$scope.challengesSearchGrid = true;
		if($scope.searchID || $scope.searchTheme){
			$scope.checkListModalSearchResults.dataSource = rcsaAssessmentService.getOpChecklistSearchDataSource($scope.searchID, $scope.searchTheme, $stateParams.assessmentId );
			$scope.searchedChallenges = new Date().getTime();
		}
	};

	$scope.checkListModalSearchOptions = checklistConfig.getOpChecklistSearchGrid();

	$scope.selectfromSearchOpChecklist = function(dataRow){
		selectedChecklistEntries = $scope.retroChallengesSelection._data;
		for(var x=0; x<selectedChecklistEntries.length; x++){

			if(selectedChecklistEntries[x].riskAssessmentChallengeKey === dataRow.riskAssessmentChallengeKey){

				duplicateOpRiskRecord =true;
			}
		}

		if(!duplicateOpRiskRecord){
		selectedChecklistEntries.push(dataRow);
		$scope.retroChallengesSelection._data = selectedChecklistEntries;
		}
		var selectedChecklistData =  new kendo.data.DataSource({

			data: 	selectedChecklistEntries,
			pageSize : 5
	        });
	    $scope.checkListModalSearchOptions.dataSource = selectedChecklistData;
		$scope.selectedChallenges = new Date().getTime();
		duplicateOpRiskRecord = false;
	};

	$scope.removefromSelectedOpChecklist = function(dataRow){
		selectedChecklistEntries = $scope.retroChallengesSelection._data;
		var redefinedopChecklist =[];
		for(var z=0; z<selectedChecklistEntries.length; z++){

			if(selectedChecklistEntries[z].riskAssessmentChallengeKey !== dataRow.riskAssessmentChallengeKey){
				redefinedopChecklist.push(selectedChecklistEntries[z]);
			}
		}
		duplicateOpRiskRecord =false;
		selectedChecklistEntries =[];
		selectedChecklistEntries = redefinedopChecklist;
		$scope.retroChallengesSelection._data = selectedChecklistEntries;
		var redefinedChecklistData =  new kendo.data.DataSource({

			data: 	selectedChecklistEntries,
			pageSize : 5
	        });
	    $scope.checkListModalSearchOptions.dataSource = redefinedChecklistData;
		$scope.selectedChallenges = new Date().getTime();

	};

	$scope.updateOpChecklistRow =function(){


		if($scope.checkListModalSearchOptions.dataSource._data){
		$scope.challengesSelected = $scope.checkListModalSearchOptions.dataSource._data;

		}else{
		$scope.challengesSelected = null;
		}
		$scope.riskAsesLobCheckListDTO = {

				riskAssessmentKey: $stateParams.assessmentId,
				riskAsesCklstSessionKey: $scope.selectedChecklistSession,
				opriskYesNo: $scope.opRiskCompleted,
				comments: $scope.chlgCmt.challengeComments,
				challengeDtos : $scope.challengesSelected
			};
		rcsaAssessmentService.saveOpChecklistDataSource($scope.riskAsesLobCheckListDTO).then(function () {
			$scope.opChecklistEditWin.close();
			$scope.$emit('refreshEditOpChecklistGrid');
			$scope.challengesSearchGrid = false;
        }, function (error) {
        	$scope.showExistWarning = true;
            // failure
            var errorMessage = error.data.errorMsg;
            if (error.data.techErrorMsg) {
                errorMessage = error.data.techErrorMsg;
            }
            $scope.validationMessage = errorMessage;
        });
	};

	$scope.$on('refreshEditOpChecklistGrid',function(){
		if($scope.opChecklistOptions.dataSource){
			$scope.opChecklistOptions.dataSource.read();
		}
	    });

	$scope.$on('editOpChecklist', function (s,dataRow){
	        $scope.disableOpriskOnView = false;
			$scope.challengesSearchGrid = false;
	        var mappedModel = {'Yes': 'Y', 'No': 'N'};
		    $scope.opChecklistEditWin.open().center();
		    $scope.standardName = dataRow.standardName;
		    $scope.opRiskCompleted = mappedModel[dataRow.opriskYesNo] || '';
		    $scope.searchID ='';
		    $scope.searchDesc ='Y';
		    $scope.searchTheme ='';
		    $scope.chlgCmt.challengeComments = dataRow.comments;
		    $scope.checkListModalSearchOptions.dataSource = '';
		    $scope.retroChallengesSelection = new kendo.data.DataSource({
				type : 'json',
				data : dataRow.challengeDtos,
				pageSize : 5
			});
		    $scope.checkListModalSearchOptions.dataSource = $scope.retroChallengesSelection;
		    $scope.selectedChallenges = new Date().getTime();
		    $scope.checkListModalSearchResults.dataSource = '';
		    $scope.searchedChallenges = new Date().getTime();
		  });
	$scope.$on('viewOpChecklist',function(s,dataRow){
	  $scope.disableOpriskOnView = true;
	  var mappedModel = {'Yes': 'Y', 'No': 'N'};
	  $scope.opChecklistEditWin.open().center();
	  $scope.standardName = dataRow.standardName;
      $scope.opRiskCompleted = mappedModel[dataRow.opriskYesNo] || '';
      $scope.searchDesc ='Y';
      $scope.chlgCmt.challengeComments = dataRow.comments;
      
      
      $scope.checkListModalSearchOptions = checklistConfig.getOpChecklistViewGrid();
	    $scope.checkListModalSearchOptions.dataSource = '';
	    $scope.retroChallengesSelection = new kendo.data.DataSource({
			type : 'json',
			data : dataRow.challengeDtos,
			pageSize : 5
		});
	    $scope.checkListModalSearchOptions.dataSource = $scope.retroChallengesSelection;
	    $scope.selectedChallenges = new Date().getTime();
	});
	$scope.$on('editCorChecklist', function (s,dataRow){
	    $scope.corChecklistEditWin.open().center();
	    $scope.disableCorChecklistFieldsOnView = false;
		$scope.riskAsesCorCheckListDTO.riskAssessmentKey = dataRow.riskAssessmentKey;
		$scope.riskAsesCorCheckListDTO.riskAsesCklstSessionKey = dataRow.riskAsesCklstSessionKey;
		$scope.qualityElement = dataRow.qualityAsuranceElement;
		$scope.riskAsesCorCheckListDTO.corComments = dataRow.corComments;
		$scope.riskAsesCorCheckListDTO.preparerResponse = dataRow.preparerResponse;
		$scope.riskAsesCorCheckListDTO.finalResult = dataRow.finalResult;
		$scope.resultLOV = dataRow.questionOptionList;
		$scope.selectedResultLOV = dataRow.questionOptionKey;
	  });
	
	$scope.$on('viewCorChecklist',function(s,dataRow){
	  $scope.corChecklistEditWin.open().center();
	  $scope.qualityElement = dataRow.qualityAsuranceElement;
	  $scope.disableCorChecklistFieldsOnView = true;
      $scope.riskAsesCorCheckListDTO = dataRow;
      $scope.selectedResultLOV = dataRow.questionOptionKey;
      $scope.resultLOV = dataRow.questionOptionList;
	});
	$scope.$on('refreshEditCorChecklistGrid',function(){
		 $scope.corChecklistOptions.dataSource.read();
	    });

    $scope.saveAssessmentCallBack = function () {
        //$location.path('/rcsa/viewAssessment');
    	$location.path('/rcsa/editAssessment/'+$scope.riskAssessmentDTO.riskAssessmentKey + '/' + new Date().getTime());
    };
    $scope.closeConfirmation = function () {
        $scope.confirmationWin.close();
    };

    // Top Risks
    $scope.topRiskWinOptions = topRiskValues.topRiskModalWinConfig;
    $scope.addTopRisk = function () {
    	topRiskValues.topRiskModalWinConfig.title = 'Add Top Risk';
        $scope.viewTopRiskWin.setOptions(topRiskValues.topRiskModalWinConfig);
        $scope.$broadcast('addTopRisk', $scope.riskAssessmentDTO.riskAssessmentKey);
    };
    $scope.$on('refreshTopRiskGrid', function () {
        $scope.topRisksOptions.dataSource.read();
    });
    $scope.editTopRisk = function (topRisk) {
    	topRiskValues.topRiskModalWinConfig.title = 'Edit Top Risk';
        $scope.viewTopRiskWin.setOptions(topRiskValues.topRiskModalWinConfig);
        $scope.$broadcast('editTopRisk',topRisk.riskAssessmentKeyConcernKey);
    };
    $scope.deleteTopRisk = function (key) {
        rcsaAssessmentFactory.deleteTopRisk(key.riskAssessmentKeyConcernKey, 'RS_DELETED').then(function () {
          $scope.topRisksOptions.dataSource.read();
        }, function (error) {
        	$scope.statusClass ='status invalid userErrorInfo';
        	var errorMessage = error.data.errorMsg;
            if (error.data.techErrorMsg) {
                errorMessage = error.data.techErrorMsg;
            }
            $scope.statusInfo = errorMessage;
         });
    };
    
    $scope.viewTopRiskData = function(topRisk){
      topRiskValues.topRiskModalWinConfig.title = 'View Top Risk';
      $scope.viewTopRiskWin.setOptions(topRiskValues.topRiskModalWinConfig);
      $scope.$broadcast('viewTopRiskData',topRisk.riskAssessmentKeyConcernKey);
      console.log('Edit Assessment Ctrl>>>>>>>>>broadcast successfull' + JSON.stringify(topRisk));
    };
    $scope.editSummaryRatings = function () {
        $location.path('/rcsa/editSummaryRating/' + $stateParams.assessmentId);
    };
    $scope.addAttestor = function () {
        $location.path('/rcsa/addEditAttestor/' + $stateParams.assessmentId);
    };

    $scope.documentWinOptions = assessmentDocConfig.documentModalWinConfig;
    $scope.addDocument = function () {
        assessmentDocConfig.documentModalWinConfig.title = 'Add document';
        $scope.viewDocumentWin.setOptions(assessmentDocConfig.documentModalWinConfig);
        $scope.$broadcast('addDocument', $scope.riskAssessmentDTO.riskAssessmentKey);
    };

    $scope.addChallenge = function (opCheckList,checklistSessionKey) {
      $scope.sessionId = checklistSessionKey;
      $scope.sessionFlag = opCheckList;
      rcsaAssessmentFactory.sessionKey = $scope.sessionId;
      rcsaAssessmentFactory.sessionFlag = $scope.sessionFlag;
        $state.go('app.addRcsaChallenge',{assessmentId:$stateParams.assessmentId});
    };

    $scope.$on('refreshChallengeGrid', function () {
    	if($scope.challengesOptions.dataSource){
        $scope.challengesOptions.dataSource.read();
    	}
        if($scope.opChecklistOptions.dataSource){
        $scope.opChecklistOptions.dataSource.read();
        }
    });
    $scope.editQuestionnaires = function () {
        $location.path('/rcsa/editQuestionnaire/' + $stateParams.assessmentId);
    };
    // dates range validation method
    $scope.validateDueDate = function () {
//        var isValid = Date.parse($scope.riskAssessmentDTO.cycleEndDate) <= Date.parse($scope.riskAssessmentDTO.dueDate);
//        console.log(isValid);
//        this.editAssessmentInfoForm[startField].$setValidity('dateRange', isValid);
//        this.editAssessmentInfoForm.$setValidity('dateRange', isValid);
//        $scope.disableUpdateBtn = isValid;
    };

    $scope.deleteChallenges = function (key) {
        setConfirmationWinButtons(false, false, false);
        $scope.messageText = $rootScope.alertMessages['delRcsaChallenge.confirmMessage'];
        $scope.confirmationWin.open().center();
        $scope.yesCallback = function () {
            deleteRcsaChallengesCallback(key);
        };
    };
    var deleteRcsaChallengesCallback = function (key) {
        rcsaAssessmentFactory.deleteRcsaChallenge(key.riskAssessmentChallengeKey).then(function () {
            $scope.confirmationWin.close();
            $scope.challengeStatusInfo = $rootScope.alertMessages['delRcsaChallenge.success'];
            $scope.challengeStatusClass = 'userSuccessInfo';
            setInterval(function () {$scope.challengeStatusInfo = '';}, 1000);
            //$scope.okCallback =
            challengeCallBack();
        }, function (error) {
        	$scope.challengeStatusClass ='status invalid userErrorInfo';
        	var errorMessage = error.data.errorMsg;
            if (error.data.techErrorMsg) {
                errorMessage = error.data.techErrorMsg;
            }
            $scope.challengeStatusInfo = errorMessage;
         });
    };
    var challengeCallBack = function () {
    	if($scope.challengesOptions.dataSource){
    		$scope.challengesOptions.dataSource.read();
    	}
        if($scope.opChecklistOptions.dataSource){
        	$scope.opChecklistOptions.dataSource.read();
        }
    };
    $scope.editChallenge = function (challengeKey,opcheckList) {
    	$scope.sessionFlag = opcheckList;
        rcsaAssessmentFactory.sessionFlag = $scope.sessionFlag;
        $scope.$broadcast('editChallenge',challengeKey,opcheckList);
        $state.go('app.editRcsaChallenge',{assessmentId:$stateParams.assessmentId,challengeKey:challengeKey});
    };
    $scope.viewChallenge = function (challengeKey) {
      console.log('Assessment Challenge Key.........', challengeKey);
      $state.go('app.viewRcsaChallenge',{assessmentId:$stateParams.assessmentId,challengeKey:challengeKey});
  };
    
    $scope.deleteAssessmentDoc = function (key) {
    	OrcitLoader.load(rcsaAssessmentFactory.deleteDocument(key.riskAssessmentAtachKey, 'RS_DELETED')).then(function () {
        $scope.assessmentDocumentOptions.dataSource.read();
      }, function (error) {
      	$scope.statusClass ='status invalid userErrorInfo';
      	var errorMessage = error.data.errorMsg;
        if (error.data.techErrorMsg) {
            errorMessage = error.data.techErrorMsg;
        }
    	$scope.statusInfo = errorMessage;
     });
  };
    $scope.$on('refreshDocGrid',function(){
      $scope.assessmentDocumentOptions.dataSource.read();
    });
    $scope.$on('refreshAttGrid',function(){
      $scope.attestationOptions.dataSource.read();
    });
    $scope.addEditAttestorOptions = attestorConfig.addEditAttModalConfig;
    $scope.addEditAttestor = function(attestorObj){
      attestorConfig.addEditAttModalConfig.title = 'Attest';
      $scope.viewEditAttestorWin.setOptions(attestorConfig.addEditAttModalConfig);
      $scope.$broadcast('addEditAttest',attestorObj);
    };
    
    $scope.editDocument = function (dataRow) {
        assessmentDocConfig.documentModalWinConfig.title = 'Edit Document';
        $scope.viewDocumentWin.setOptions(assessmentDocConfig.documentModalWinConfig);
        $scope.$broadcast('editDocument',dataRow);
    };
    $scope.viewAssessmentDoc = function(dataRow){
      assessmentDocConfig.documentModalWinConfig.title = 'View Document';
      $scope.viewDocumentWin.setOptions(assessmentDocConfig.documentModalWinConfig);
      $scope.$broadcast('viewDocument',dataRow);
    };

    $scope.generateAccordionData = function(status, accordionEntity){
    	if(!status && accordionEntity === 'summary'){
    		if(!disableSummaryService){
    			 $scope.summaryRatingOptions.dataSource = rcsaAssessmentService.getSummaryRatingGridDataSource($stateParams.assessmentId);
    	    	 $scope.summaryRebind = new Date().getTime();
    	    	 OrcitLoader.load($http.get('/ra/app/assessment/rest/summaryratingset?riskAssessmentKey=' + $stateParams.assessmentId)).success(function (data) {
    	    	    	$scope.outstandingComments = data.summaryRatingSetDTOs[0].audtRegDescription;
    	    	    	$scope.cycleDesc = data.summaryRatingSetDTOs[0].cycleToCycleChangeDes;
    	    	    	$scope.assessmentStatus = data.summaryRatingSetDTOs[0].assessmentStatus;
    	    	    	
    	    	    }, function (error) {
    	            	$scope.statusClass ='status invalid userErrorInfo';
    	            	var errorMessage = error.data.errorMsg;
    	                if (error.data.techErrorMsg) {
    	                    errorMessage = error.data.techErrorMsg;
    	                }
    	            	$scope.statusInfo = errorMessage;
    	             });

    	    	    if($scope.summaryRatingOptions.dataSource){
    	    	    	disableSummaryService = true;
    	    	    }
    		}
    	}
    	else if(!status && accordionEntity === 'toprisk'){
    		if(!disableTopRiskService){
    			$scope.topRisksOptions.dataSource = rcsaAssessmentService.getTopRisksGridDataSource($stateParams.assessmentId);
    			$scope.topRiskRebind = new Date().getTime();
    			if($scope.topRisksOptions.dataSource){
    			disableTopRiskService =true;
				}
    		}
    	}
    	else if(!status && accordionEntity === 'challenges'){
    		if(!disableChallengesService){
    		    $scope.challengesOptions.dataSource = rcsaAssessmentService.getChallengesGridDataSource($stateParams.assessmentId);
    		    $scope.challengesRebind = new Date().getTime();
    			if($scope.challengesOptions.dataSource){
    				disableChallengesService =true;
    				}
    		}
    	}
    	else if(!status && accordionEntity === 'attestation'){
    		if(!disableattestationService){
    			$scope.attestationOptions.dataSource = rcsaAssessmentService.getAttestationGridDataSource($stateParams.assessmentId);
    			$scope.attestRebind = new Date().getTime();
    			if($scope.attestationOptions.dataSource){
    				disableattestationService =true;
				}
    		}
    	}
    	else if(!status && accordionEntity === 'opcheckgrid'){
    		if(!disableOpChecklistService){
    			$scope.opChecklistOptions.dataSource = rcsaAssessmentService.getOpRiskGridDataSource($stateParams.assessmentId);
    			$scope.opChecklistRebind = new Date().getTime();
    			if($scope.opChecklistOptions.dataSource){
    				disableOpChecklistService = true;
    			}
    		}
    	}
    	else if(!status && accordionEntity === 'corcheckgrid'){

    		if(!disableCorChecklistService){
    			$scope.corChecklistOptions.dataSource = rcsaAssessmentService.getCorRiskGridDataSource($stateParams.assessmentId);
    			$scope.updateCorChallenges = new Date().getTime();
    			if($scope.corChecklistOptions.dataSource){
    				disableCorChecklistService =true;
    			}
    		}
    	}
    	else if(!status && accordionEntity === 'docs'){
    		if(!disableDocsService){
    	    $scope.assessmentDocumentOptions.dataSource = rcsaAssessmentService.getDocGridDataSource($stateParams.assessmentId);
    	    $scope.docsRebind = new Date().getTime();
    	    if($scope.assessmentDocumentOptions.dataSource){
    	    	disableDocsService =true;
    	    }
    		}
    	}
    };

    $scope.successMessage = function (mesg) {
    	$scope.closeConfirmation();
        $scope.statusClass ='status invalid userErrorInfo';
        $scope.statusInfo = mesg;
    };

    $scope.updateAssessmentStatus = function (status) {
    	if(status === 'VALDT_ASSMT_ATTSTN'){
    	 $scope.messageText = $rootScope.alertMessages['assessment.attestation.confirm'];
    	} else if(status === 'VALDT_ASSMT_SBMT'){
    	 $scope.messageText = $rootScope.alertMessages['assessment.submit.confirm'];
    	} else if(status === 'RA_ASES_FINAL'){
    		$scope.messageText = $rootScope.alertMessages['assessment.finalize.confirm'];
    	}else if(status === 'RA_ASES_QA'){
    		$scope.messageText = $rootScope.alertMessages['assessment.return.confirm'];
    	}
    	else if(status === 'RA_ASES_DELETED'){
    		$scope.messageText = $rootScope.alertMessages['delAssessment.confirmMessage'];
    	}
    	else if(status === 'RA_ASES_IN_PROGRESS'){
    		$scope.messageText = $rootScope.alertMessages['assessment.returnToInProgress.openmsg'];
    	}
         $scope.confirmationWin.open().center();
         $scope.yesCallback = function () {
        	 assessmentStatusValidation(status);
         };
    };
    
    $scope.openAlertMessageList = function() {
       
        $scope.alertMessageListModal.open().center();
        $scope.alertMessageGrid = rcsaAssessmentService.getAlertMessagesGrid();
        $scope.alertMessageGrid.dataSource = '';
  	    $scope.alertMessageDataSource = new kendo.data.DataSource({
  			type : 'json',
  			data : $scope.alertMessagesList
  		});
  	    $scope.alertMessageGrid.dataSource = $scope.alertMessageDataSource;
  	    $scope.alertMessagesRebind =  new Date().getTime();
        
        
    };
    
        
    

    var assessmentStatusValidation=function(status){
    	if(status === 'VALDT_ASSMT_ATTSTN' || status === 'VALDT_ASSMT_SBMT' || status === 'RA_ASES_FINAL'){
    		OrcitLoader.load(rcsaAssessmentFactory.assessmentStatusValidation($scope.riskAssessmentDTO.riskAssessmentKey,status)).then(function(response){
    			$scope.alertMessagesList = response.data.alertMessageList;
    		if(response.data.validationMesg === 'SUCCESS'){
    			$scope.statusClass ='userSuccessInfo';
            	if(status === 'RA_ASES_FINAL'){
    				$scope.statusInfo = $rootScope.alertMessages['assessment.finalize.success'];
    			} else if(status === 'VALDT_ASSMT_ATTSTN') {
    				$scope.statusInfo = $rootScope.alertMessages['editRcsa.updateAssessmentStatus']+' attestation';
    			}
    			else if(status === 'VALDT_ASSMT_SBMT') {
    				$scope.statusInfo = $rootScope.alertMessages['editRcsa.updateAssessmentStatus']+' submit to COR';
    			}
            	$timeout(function () {
            		$scope.startAttestationCallBack();
                }, 1000);
    		}else{$scope.successMessage(response.data.validationMesg);}
		}, function (error) {
        	$scope.statusClass ='status invalid userErrorInfo';
        	var errorMessage = error.data.errorMsg;
            if (error.data.techErrorMsg) {
                errorMessage = error.data.techErrorMsg;
            }
        	$scope.statusInfo = errorMessage;
        	$scope.confirmationWin.close();
         });
    	} else if(status === 'RA_ASES_QA' || status === 'RA_ASES_DELETED' || status === 'RA_ASES_IN_PROGRESS'){
    		OrcitLoader.load(rcsaAssessmentFactory.assessmentStatusUpdate($scope.riskAssessmentDTO.riskAssessmentKey,status)).then(function(){
    			$scope.statusClass ='userSuccessInfo';
        			if(status === 'RA_ASES_DELETED'){
        				$scope.statusInfo = $rootScope.alertMessages['delRcsaAssessment.success'];
        			}else if(status === 'RA_ASES_QA'){
        				$scope.statusInfo = $rootScope.alertMessages['assessment.returnToLob.success'];
        			}else if(status === 'RA_ASES_IN_PROGRESS'){
        				$scope.statusInfo = $rootScope.alertMessages['assessment.returnToInProgress.success'];
        			}        			
        			$timeout(function () {
                		$scope.startAttestationCallBack();
                    }, 1000);
    		}, function (error) {
            	$scope.statusClass ='status invalid userErrorInfo';
            	var errorMessage = error.data.errorMsg;
                if (error.data.techErrorMsg) {
                    errorMessage = error.data.techErrorMsg;
                }
            	$scope.statusInfo = errorMessage;
             });
    	}
    };
    $scope.startAttestationCallBack = function () {
        $location.path('/rcsa/editAssessment/'+$scope.riskAssessmentDTO.riskAssessmentKey + '/' + new Date().getTime());
    };

    $scope.updateCorChecklistRow = function (){
    	$scope.riskAsesCorCheckListDTO.questionOptionKey = $scope.selectedResultLOV;
		rcsaAssessmentService.saveCorChecklistDataSource($scope.riskAsesCorCheckListDTO).then(function () {
			$scope.corChecklistEditWin.close();
			$scope.$emit('refreshEditCorChecklistGrid');
        }, function (error) {
        	 $scope.statusClass ='status invalid userErrorInfo';
            var errorMessage = error.data.errorMsg;
            if (error.data.techErrorMsg) {
                errorMessage = error.data.techErrorMsg;
            }
        	$scope.statusInfo = errorMessage;
        });
    };
    $scope.attachedDocOptions = attestorConfig.attachedDocConfig;
    $scope.openDocs = function(docObj){
        attestorConfig.attachedDocConfig.title = 'Attached Docs';
        $scope.viewAttachedDocWin.setOptions(attestorConfig.attachedDocConfig);
        $scope.$broadcast('attachedDocument',docObj);
    };
    //View Process Level top risks
    $scope.viewPrcsLvlRiskOptions = topRiskValues.ViewTopRiskWinConfig;
    $scope.viewTopRisk = function(){
      topRiskValues.ViewTopRiskWinConfig.title = 'View Process Level Top Risks';
      $scope.viewPrcsLvlRiskWin.setOptions(topRiskValues.ViewTopRiskWinConfig);
      $scope.$broadcast('viewPrcsLvlRisk', $stateParams.assessmentId);
     };
   //set context and context value
     rcsaAssessmentFactory.utilList($stateParams.assessmentId).then(function (response) {
     	rcsaAssessmentFactory.setContextAndValue(response.data, $scope);
     });
    
     $scope.statusCheck = function(assessmentStatus, statusConcatenated){
    	 var statusArray = statusConcatenated.split(',');
    	 if(-1!==$.inArray(assessmentStatus, statusArray)){
    		 return true;
    	 }
    	 return false;
     };
});
