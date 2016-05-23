// TODO: This file is serving multiple pages without any code reuse. Break this into multiple files.
angular.module('riskAssessmentApp').controller('RiskCtrl', function ($scope, $rootScope, OrcitLoader, $http, RiskService, $state, kendoCustomDataSource, TreeViewData, ViewEditRiskService, $stateParams, $location, alert,
                                                                     processTreeConfig, alignedRiskService, ConfirmationConfig, TreeViewDataERH,
                                                                     processFactory, geoLocationData, erhData, rskEvntTypeData, rskCausalTypeData,
                                                                     TreeHirachyInfo, riskFactory, rskImpactTypeData,pageDisable) {
    'use strict';
    
    $scope.prcLockDownFlag = pageDisable !== null && pageDisable.prcLockDownFlag ? pageDisable.prcLockDownFlag : false;

    var setEmptyArray = function(array){
    	if(array && array.length){
    		return array;
    	}
    	return [];
    };
    var setConfirmationWinButtons = function (hideYesBtn, hideNoBtn, showOkBtn) {
        $scope.hideYesBtn = hideYesBtn;
        $scope.hideNoBtn = hideNoBtn;
        $scope.showOkBtn = showOkBtn;
    };
    $scope.$watch('nonPersistentRisk.erhKey', function () {
      var item = $scope.nonPersistentRisk.erhKey[0];
        if (item) {
            console.log('ERH selected', item.id);
            if ($scope.editMode){ 
            	if($scope.riskDTO && (!$scope.riskDTO.erhUtilKeyList.length || item.id !== $scope.riskDTO.erhUtilKeyList[0].id)) {
            		RiskService.getalignCtrlAndProcessToRisk($stateParams.riskId).then(function (data) {
            			if (data.data.hasProcesses && data.data.hasControls) {
            				$scope.successMessage($rootScope.alertMessages['riskErh.confirmMessage']);
            			} else if (data.data.hasProcesses) {
            				$scope.successMessage($rootScope.alertMessages['riskErh.processConfirmMessage']);
            			} else if (data.data.hasControls) {
            				$scope.successMessage($rootScope.alertMessages['riskErh.ctrlConfirmMessage']);
            			}
            		}, function (error) {
                    	$scope.statusClass ='status invalid userErrorInfo';
                    	var errorMessage = error.data.errorMsg;
                        if (error.data.techErrorMsg) {
                            errorMessage = error.data.techErrorMsg;
                        }
                    	$scope.statusInfo = errorMessage;
                     });
            	}
            }
            TreeHirachyInfo.getErhInfo(item.id).then(function (response) {
                $scope.erhObj = response.data;
                // TODO: we do not ever assign $scope variables to other $scope variables. You're creating duplicate $watch for no reason and it's slowing the application down.
                $scope.businessFlag = $scope.erhObj.businessFlag;
                $scope.riskDTO.businessSegmentOrControlFunction = $scope.erhObj.businessSegmentOrControlFunction;
                $scope.riskDTO.erhToolTip = $scope.erhObj.erhToolTip;
            }, function (error) {
            	$scope.statusClass ='status invalid userErrorInfo';
            	var errorMessage = error.data.errorMsg;
                if (error.data.techErrorMsg) {
                    errorMessage = error.data.techErrorMsg;
                }
            	$scope.statusInfo = errorMessage;
             });
         } else {
          $scope.riskDTO.businessSegmentOrControlFunction = '';
          $scope.riskDTO.erhToolTip = '';
         }
    });
    $scope.$watch('nonPersistentRisk.riskEventText',function(){
      var item = $scope.nonPersistentRisk.riskEventText[0];
      if(item){
          RiskService.getRiskEventinfo($scope.nonPersistentRisk.riskEventText[0].id).then(function (response) {
          $scope.riskEventObj = response.data;
          }, function (error) {
        	$scope.statusClass ='status invalid userErrorInfo';
        	var errorMessage = error.data.errorMsg;
            if (error.data.techErrorMsg) {
                errorMessage = error.data.techErrorMsg;
            }
        	$scope.statusInfo = errorMessage;
         });
         } 
      else {
           $scope.riskEventObj = {};
         }
    });
    var create = function () {
        $scope.closeConfirmation();
        // TODO: we do not ever assign $scope variables to other $scope variables. You're creating duplicate $watch for no reason and it's slowing the application down.
        $scope.riskDTO.rskCausCtgyToRiskKyList = $scope.nonPersistentRisk.riskCausalText;
        $scope.riskDTO.rskImpactCtgyToRiskKyList = $scope.nonPersistentRisk.impactType;
        $scope.riskDTO.erhKey = $scope.nonPersistentRisk.erhKey;
        $scope.riskDTO.riskEventCategoryKey = $scope.nonPersistentRisk.riskEventText;
        OrcitLoader.load(riskFactory.saveRisk($scope.riskDTO)).then(function (response) {
            $scope.statusClass = 'userSuccessInfo';
            $scope.statusInfo = $rootScope.alertMessages['risk.saveSuccess'];
            if ($scope.riskDTO.rskKy) {
                $scope.statusInfo = $rootScope.alertMessages['risk.updateSuccess'];
            }
            if ($scope.editMode) {
                $scope.updateRiskCallBack();
            } else {
                $scope.saveRiskCallBack(response.data.rskKy);
            }
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
    var createAlignRiskToPrcs = function () {
        $scope.closeConfirmation();
        // TODO: do not ever assign $scope properties to $scope properties. All this is doing is slowing the application down.
        $scope.riskDTO.rskCausCtgyToRiskKyList = $scope.nonPersistentRisk.riskCausalText;
        $scope.riskDTO.rskImpactCtgyToRiskKyList = $scope.nonPersistentRisk.impactType;
        $scope.riskDTO.erhKey = $scope.nonPersistentRisk.erhKey;
        $scope.riskDTO.riskEventCategoryKey = $scope.nonPersistentRisk.riskEventText;
        $scope.riskDTO.riskInProcessDTO.geographicLocationKeyList = $scope.nonPersistentRisk.geoLocations;
        OrcitLoader.load(riskFactory.saveRiskInProcess($scope.riskDTO)).then(function () {
            $scope.statusClass = 'userSuccessInfo';
            $scope.statusInfo = $rootScope.alertMessages['riskInProcess.saveSuccess'];
            if ($scope.riskDTO.riskInProcessDTO.riskInProcessKy) {
                $scope.statusInfo = $rootScope.alertMessages['riskInProcess.updateSuccess'];
            }
            $scope.saveRiskInProcessCallBack();
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
    $scope.loadAlignRiskToProcessData = function () {
    	OrcitLoader.load(RiskService.getAllignNewRiskData($stateParams.processId)).then(function (response) {
            $scope.disableERH = true;
            $scope.processGeoLocations = true;
            $scope.riskDTO = response.data;
            // TODO: we do not ever assign $scope variables to other $scope variables. You're creating duplicate $watch for no reason and it's slowing the application down.
            $scope.businessFlag = $scope.riskDTO.businessFlag;
            $scope.nonPersistentRisk.erhKey = setEmptyArray($scope.riskDTO.erhUtilKeyList);
            $scope.nonPersistentRisk.geoLocations = setEmptyArray($scope.riskDTO.riskInProcessDTO.geoLocationsKeyList);
            $scope.riskRatingDTO = [];
            $scope.riskRatingDTO = $scope.riskDTO.riskInProcessDTO.riskInProcessRatingDTO;
            //$scope.riskRatingDataGrid.dataSource = RiskService.getRiskRatingGridDataSource($scope.riskRatingDTO);
            $scope.selectedTypeRisk = new Date().getTime();
            $scope.geoLocationFlag = true;
            $scope.loadFlag = true;
            if($scope.riskDTO.deactiveERHMessage){
	        	$scope.nonPersistentRisk.erhKey = [];
	        	$scope.riskDTO.erhUtilKeyList = [];
	        }
        }, function (error) {
            $scope.statusClass = 'status invalid userErrorInfo';
            $scope.validationMessage = error.data.errorMsg;
        });
    };
    //Check state for View Risk in Process
    if ($state.current.name === 'app.viewAlignRiskToProcess') {
      $scope.disableRiskOnViewPrcs = true;
    }
    // This runs when the edit risk page first loads.
    $scope.loadAlignRiskToProcessEditData = function () {
        OrcitLoader.load(RiskService.getalignRiskToProcess($stateParams.riskInProcessKey)).then(function (response) {
            console.log('got risk data', response.data);
            $scope.riskDTO = response.data;
            if ($scope.riskDTO.riskInProcessDTO.justification) {
                $scope.justificationShow = true;
            }
            else {
                $scope.justificationShow = false;
            }
            // TODO: we do not ever assign $scope variables to other $scope variables. You're creating duplicate $watch for no reason and it's slowing the application down.
            $scope.nonPersistentRisk.geoLocations = $scope.riskDTO.riskInProcessDTO.geoLocationsKeyList;
            $scope.businessFlag = $scope.riskDTO.businessFlag;
            $scope.nonPersistentRisk.erhKey = setEmptyArray($scope.riskDTO.erhUtilKeyList);
            $scope.riskEventTypeInfo = $scope.riskDTO;
            $scope.nonPersistentRisk.riskEventText = setEmptyArray($scope.riskDTO.riskEventUtilKeyList);
            $scope.nonPersistentRisk.riskCausalText = setEmptyArray($scope.riskDTO.riskCausalUtilKeyList);
            $scope.nonPersistentRisk.impactType = setEmptyArray($scope.riskDTO.riskImpactUtilKeyList);
            $scope.riskRatingDTO = [];
            $scope.riskRatingDTO = $scope.riskDTO.riskInProcessDTO.riskInProcessRatingDTO;
            $scope.selectedTypeRisk = new Date().getTime();
            $scope.geoLocationFlag = true;
            $scope.loadFlag = true;
            if($scope.riskDTO.deactiveERHMessage){
	        	$scope.nonPersistentRisk.erhKey = [];
	        	$scope.riskDTO.erhUtilKeyList = [];
	        }
        }, function (error) {
        	$scope.statusClass ='status invalid userErrorInfo';
        	var errorMessage = error.data.errorMsg;
            if (error.data.techErrorMsg) {
                errorMessage = error.data.techErrorMsg;
            }
        	$scope.statusInfo = errorMessage;
         });
    };

    $scope.loadRisk = function () {
        OrcitLoader.load(RiskService.getRisk($stateParams.riskId)).then(function (response) {
            $scope.riskDTO = response.data;
            $scope.businessFlag = $scope.riskDTO.businessFlag;
            $scope.nonPersistentRisk.erhKey = setEmptyArray($scope.riskDTO.erhUtilKeyList);
            $scope.riskEventTypeInfo = $scope.riskDTO;
            $scope.nonPersistentRisk.riskEventText = setEmptyArray($scope.riskDTO.riskEventUtilKeyList);
            $scope.nonPersistentRisk.riskCausalText = setEmptyArray($scope.riskDTO.riskCausalUtilKeyList);
            $scope.nonPersistentRisk.impactType = setEmptyArray($scope.riskDTO.riskImpactUtilKeyList);
            $scope.loadFlag = true;
            if($scope.riskDTO.deactiveERHMessage){
	        	$scope.nonPersistentRisk.erhKey = [];
	        	$scope.riskDTO.erhUtilKeyList = [];
	        }
        }, function (error) {
        	$scope.statusClass ='status invalid userErrorInfo';
        	var errorMessage = error.data.errorMsg;
            if (error.data.techErrorMsg) {
                errorMessage = error.data.techErrorMsg;
            }
        	$scope.statusInfo = errorMessage;
         });
        if ($scope.enableEditRiskInProcess) {
            $scope.alignedProcessesToRiskGridOptions = RiskService.alignedProcessToRiskGrid();
            $scope.alignedProcessesToRiskGridOptions.dataSource = RiskService.getAlignedProcessesToRiskGridDataSource($stateParams.riskId);
            $scope.selectedAlignProcesses = new Date().getTime();
            $scope.alignedControlToRiskGridOptions = RiskService.getAlignedControlToRiskGridData;
        }
    };
    $scope.saveRiskCallBack = function (riskKey) {
    	OrcitLoader.load($location.path('/risk/' + riskKey));
    };
    $scope.updateRiskCallBack = function () {
        $state.go('app.editRisk', {riskId: $scope.riskDTO.rskKy});
    };
    $scope.riskAlignToProcessBack = function () {
        $scope.confirmationWin.close();
        if ($scope.editMode) {
            $location.path('/process/' + $scope.riskDTO.riskInProcessDTO.prcsKy + '/' + new Date().getTime());
        } else {
            $location.path('/process/' + $stateParams.processId + '/' + new Date().getTime());
        }
    };
    $scope.clear = function () {
    	if ($stateParams.from === 'search') {
    		$state.go('app.search');
    	} else if($stateParams.from === 'editRiskInProcess'){
    		$state.go('app.alignRiskToProcess', {from: 'editProcess', processId: $stateParams.processId, riskInProcessKey:$stateParams.riskInProcessKey});
    	}else if($stateParams.from === 'editProcess'){
    		$state.go('app.editProcess', {from: 'search', processId: $stateParams.processId, refresh:new Date().getTime()});
    	}else {
    		$state.go('app.home');
    	}
    	// TODO: $scope.init should not be on $scope at all.
    	$scope.init();
    	$scope.validationMessage = '';
    	$scope.validationClass = 'valid';
    	$scope.createRiskFormName.$setPristine();
    	$scope.createRiskInProcessFormName.$setPristine();    	
    };
    $scope.dateFormat = function (date, format) {
        return kendo.toString(date, format);
    };
    $scope.$watchCollection(function () {
       return $scope.nonPersistentRisk.geoLocations;
    }, function () {
        if (!!$scope.riskDTO.riskInProcessDTO && !!$scope.riskDTO.riskInProcessDTO.geoLocations) {
            //console.log($scope.riskDTO.riskInProcessDTO.geoLocations);
            var processGeoLocationsList = $scope.riskDTO.riskInProcessDTO.geographicLocationTextList;
            var refinedLocations = [];
            for (var i = 0; i < $scope.nonPersistentRisk.geoLocations.length; i++) {
                refinedLocations[i] = $scope.nonPersistentRisk.geoLocations[i].text;
            }
            if (processGeoLocationsList.length !== refinedLocations.length) {
                $scope.justificationShow = true;
            } else if (processFactory.checkTwoArrysMatched(processGeoLocationsList, refinedLocations)) {
                $scope.justificationShow = true;
            } else {
                $scope.justificationShow = false;
                $scope.riskDTO.riskInProcessDTO.justification = null;
            }
        }
    });

    $scope.closeConfirmation = function () {
        $scope.confirmationWin.close();
    };

    $scope.handleCancel = function () {
    	if(($scope.createRiskFormName.$dirty || $scope.createRiskInProcessFormName.$dirty) && !$scope.prcLockDownFlag){
        $scope.messageText = $rootScope.alertMessages['common.cancelConfirmMessage'];
        $scope.confirmationWin.open().center();
        $scope.yesCallback = $scope.clear;
    	}
    	else{
    		$scope.clear();
    	}
    };
    $scope.successMessage = function (mesg) {
        setConfirmationWinButtons(true, true, true);
        $scope.messageText = mesg;
        $scope.confirmationWin.open().center();
        $scope.okCallback = $scope.successCallBack;
    };
    $scope.successCallBack = function () {
        setConfirmationWinButtons(false, false, false);
        $scope.confirmationWin.close();
    };
    $scope.overrideComputedRating = function () {
        $scope.ratingJustification = true;

    };
    $scope.closeRatingModal = function () {
        $scope.messageText = $rootScope.alertMessages['common.cancelConfirmMessage'];
        $scope.confirmationWin.open().center();
        $scope.yesCallback = $scope.closeriskRatingModal;
    };
    $scope.closeriskRatingModal = function () {
        $scope.confirmationWin.close();
        $scope.busOverrideJustComments = '';
        $scope.ratingValidationMsg = '';
        $scope.ratingWinValidationClass = 'valid';
        $scope.alignExstRsk.close();
    };
    $scope.enableEditRiskInProcess = false;
    $scope.init = function () {
        $scope.riskTypeDataSource = kendoCustomDataSource.getDropDownDataSource('RISK_FRAMEWORK');
        $scope.riskImpactDataSource = kendoCustomDataSource.getDropDownDataSource('RISK_IMPACT_TYPE');
        $scope.riskCauseDataSource = kendoCustomDataSource.getDropDownDataSource('RISK_CAUSE_TYPE');
        $scope.effRatingComputed = kendoCustomDataSource.getDropDownDataSource('CTL_EFCTVNS_RT');
        $scope.effBussOverride = kendoCustomDataSource.getDropDownDataSource('CTL_EFCTVNS_RT');
        $scope.statusInfo = '';
        $scope.statusClass = '';
        $scope.ratingSaveInfo = '';
        $scope.ratingJustification = false;
        $scope.effBussRating = 0;
        $scope.riskEffRatingComputed = 0;
        $scope.targetRiskinProcessKey = 0;
        $scope.cnaRskDiv = false;
        $scope.nonRiskReadonly = true;
        $scope.readonly = false;
        $scope.disableRiskFields = false;
        $scope.disableERH = false;
        $scope.processGeoLocations = false;
        $scope.nonPersistentRisk = {
            riskEventText: [],
            erhKey: [],
            riskCausalText: [],
            geoLocations: [],
            impactType: []
        };
        $scope.riskCompRating = true;
        $scope.enableRatingSave = true;
        $scope.ratingGrid = false;
        $scope.checkedRiskGeoNodes = [];
        $scope.checkedRiskCausalNodes = [];
        //Refactored below code due to breadcrumb implementation
        if ($state.is('app.editRisk')) {
            $scope.editMode = true;
            $scope.disableRiskOnViewPrcs = false;
            if ($stateParams.from === 'editRiskInProcess') {
                $scope.enableEditRiskInProcess = true;
            }
            $scope.loadRisk($stateParams.riskId);
        }
        else if ($state.is('app.createAndAlignRisk')) {
          $scope.disableRiskOnViewPrcs = false;
            $scope.cnaRskDiv = true;
            $scope.editMode = false;
            $scope.loadAlignRiskToProcessData($stateParams.processId);
            $scope.nonPersistentRisk = {
                riskEventText: [],
                erhKey: [],
                riskCausalText: [],
                geoLocations: [],
                impactType: []
            };
        }
        else if ($stateParams.processId && $stateParams.riskInProcessKey) {
            $scope.cnaRskDiv = true;
            $scope.editMode = true;
            $scope.disableRiskFields = true;
            $scope.disableERH = true;
            $scope.processGeoLocations = true;
            $scope.loadAlignRiskToProcessEditData($stateParams.riskInProcessKey);
        } 
        else {
            $scope.editMode = false;
            $scope.riskDTO = {};
            $scope.nonPersistentRisk = {
                riskEventText: [],
                erhKey: [],
                riskCausalText: [],
                geoLocations: [],
                impactType: []
            };
            $scope.loadFlag = true;
        }
    };
    $scope.submit = function () {
        $scope.messageText = $rootScope.alertMessages['common.confirmMessage'];
        $scope.yesCallback = create;
        if ($scope.cnaRskDiv) {
            $scope.yesCallback = createAlignRiskToPrcs;
        }
        $scope.confirmationWin.open().center();
    };
    $scope.saveRiskInProcessCallBack = function () {
        var processKey = $stateParams.processId;
        if (!processKey) {
            processKey = $scope.riskDTO.riskInProcessDTO.prcsKy;
        }
        if ($scope.cnaRskDiv && $scope.editMode) {
            $state.go('app.alignRiskToProcess', {processId: processKey, riskInProcessKey: $scope.riskDTO.riskInProcessDTO.riskInProcessKy});
        } else {
            $location.path('/process/' + processKey + '/' + new Date().getTime()).search({from: 'create'});
        }
    };
    $scope.businessFlag = true;
    $scope.justificationShow = false;
    $scope.riskDTO = {};
    $scope.messageText = $rootScope.alertMessages['common.confirmMessage'];
    $scope.init();
	kendoCustomDataSource.getAnguDropdownData('RISK_FRAMEWORK').then(function(response){
			  $scope.riskTypeDataSource = response.data;
   });
    $scope.riskImpactDataSource = kendoCustomDataSource.getDropDownDataSource('RISK_IMPACT_TYPE');
    $scope.riskCauseDataSource = kendoCustomDataSource.getDropDownDataSource('RISK_CAUSE_TYPE');
    $scope.riskImpactOptions = {
        placeholder: 'Select',
        valuePrimitive: true,
        autoBind: false,
        autoClose: false,
        dataSource: $scope.riskImpactDataSource
    };
    if (geoLocationData && geoLocationData.data) {
        $scope.geoLocationTreeData = geoLocationData.data;
    }
    $scope.enterpriseReportingHierarchyFullTreeData = $rootScope.erhFullTree;
    $scope.residualCasualTypesTree = rskCausalTypeData.data;
    $scope.enterpriseReportingHierarchyTreeData = erhData.data;
    $scope.riskImpactTypesTree = rskImpactTypeData.data;
    $scope.riskEventTypesTree = rskEvntTypeData.data;
    //there is no key press event to kendo multiselect dropdown
    //apply the event to input of multiselect
    //this is to stop typing in the dropdown
    $scope.$on('kendoWidgetCreated', function (event, widget) {
        if (widget === $scope.riskImpactType) {
            $scope.riskImpactType.input.on('keypress', function (e) {
                e.preventDefault();
            });
        }
    });
    $scope.commentsValidation = function () {
        if (!!$scope.riskDTO.riskInProcessDTO.justification && $scope.riskDTO.riskInProcessDTO.justification.trim().length) {
            $scope.createRiskInProcessFormName.justification.$setValidity('required', true);
        }
        else {
            $scope.createRiskInProcessFormName.justification.$setValidity('required', false);
        }
    };
    $scope.editRiskInProcess = function () {
        $state.go('app.editRisk', {riskId: $scope.riskDTO.rskKy, from: 'editRiskInProcess', processId: $scope.riskDTO.riskInProcessDTO.prcsKy,riskInProcessKey:$stateParams.riskInProcessKey});
    };
    $scope.$watch(function () {
        return $scope.loadFlag;
    });
});
