angular.module('riskAssessmentApp').controller('EditProcessRatingCtrl', function ($scope, $rootScope, OrcitLoader, Rating, kendoCustomDataSource,
																				  $stateParams,$location) {
    'use strict';
    
	kendoCustomDataSource.getAnguDropdownData('RSDL_RSK_DIR').then(function (response) {
          $scope.riskDirOptions = response.data;
    });
   
    kendoCustomDataSource.getAnguDropdownData('CTL_EFCTVNS_RT').then(function (response) {
          $scope.ctrlEffOptions = response.data;
    });
   kendoCustomDataSource.getAnguDropdownData('INHERIT_RISK_SCORE').then(function (response) {
          $scope.inherentRiskRatingOptions = response.data;
    });
	kendoCustomDataSource.getAnguDropdownData('RSDL_RR').then(function (response) {
          $scope.riskComputeOptions = response.data;
		  $scope.riskBusinessOptions = response.data;
    });
    $scope.errMsg = false;
    $scope.disableEffComp = true;
    $scope.compReadOnly = true;
    $scope.statusInfo ='';
    $scope.showStatus = false;
    
    // Edit Function broadcast from parent Ctrl
    $scope.$on('editProcessRating', function (s, processRating) {
    	 $scope.processRatingForm.residualRiskBus.$setUntouched();
    	 $scope.processRatingForm.riskDirection.$setUntouched();
    	 $scope.processRating = processRating;
    	 $scope.residualRisk();
        $scope.showRationalCmmt();
        $scope.riskBusinessOptions = $scope.processRating.residualRiskOverride;
        $scope.errMsg = false;
        $scope.showEditdisForm = true;
        $scope.ProcessRatingWin.open().center();
        if ($scope.processRating.inherentRiskRatingKey === null || $scope.processRating.finalOutcomeInherentRiskRatingKey === null || 
        		$scope.processRating.controlEffectivenessRatingOverrideKey === null) {
          $scope.PrcsratingValidationMsg = 'IRR must be final and at least one Control need to have ratings before POCE can be set and Residual Risk determined';
          $scope.showEditdisForm = false;
        }
        if ($scope.processRating.edit === false){
          $scope.PrcsratingValidationMsg = '';
        }
    });
    // Edit Save Functionality
    $scope.saveProcessRating = function () {
        if ($scope.processRatingForm.$invalid) {
            $scope.emptyErrorMessage = 'Please correct below errors and submit again';
            $scope.errMsg = true;
        } else {
        	OrcitLoader.load(Rating.saveProcessRating($scope.processRating)).then(function () {
                $rootScope.$broadcast('refreshRatingGrid');
                $scope.ProcessRatingWin.close();
                $scope.showStatus = true;
                $scope.statusInfo = 'Process Ratings have been successfully updated';
                $scope.errMsg = false;
                $location.path('/process/' + $stateParams.processId + '/' + new Date().getTime()).search({from: 'create'});
            }, function (error) {
            	$scope.statusClass ='status invalid userErrorInfo';
	        	$scope.emptyErrorMessage = error.data.errorMsg;
	        	$scope.errMsg = true;
	         });
        }
    };
    //Comment box if user overide values
    $scope.overrideBusinessDec = function () {
        if ($scope.processRating.controlEffectivenessRatingComputeKey) {
        	if($scope.processRating.finalOutcomeInherentRiskRatingKey){
        		$scope.processRating.residualRiskRatingComputeKey = '';
        		$scope.processRating.residualRiskRatingOverrideKey = '';
        	}
            Rating.getProcessRatingFields($scope.processRating.controlEffectivenessRatingOverrideKey, $scope.processRating.finalOutcomeInherentRiskRatingKey).then(function (response) {
               $scope.processRating.overallControlEffectivenessOverrideText = '';
               $scope.processRating.residualRiskRatingComputeKey = '';
                $scope.showEditdisForm = true;
                $scope.rationaleComments = false;
				$scope.riskBusinessOptions = response.data.residualRiskOverride;
                $scope.processRating.residualRiskRatingComputeKey = response.data.residualRiskRatingComputeKey;
//                $scope.processRating.residualRiskRatingOverrideKey = $scope.processRating.residualRiskRatingComputeKey;
				$scope.processRating.residualRatingText = '';
                $scope.PrcsratingValidationMsg = '';
				$scope.processRating.riskAcceptanceFlag = '';
				$scope.processRating.riskAcceptanceComment = '';
                $scope.rationaleComments = false;
				$scope.processRating.residualRiskDirKey='';
				$scope.processRating.overallControlEffectivenessOverrideText='';
				$scope.processRating.mssControlFlag='';
				$scope.showrRiskAccpt = false;
                //residualRiskChange();
            }, function (error) {
            	$scope.statusClass ='status invalid userErrorInfo';
            	$scope.statusInfo = error.data.errorMsg;
             });
        }
        
    };
    //Residual Risk Business Change
    // TODO: this function and $scope.riskDirectionChange are the same. Combine them.
    $scope.residualRiskChange = function () {
    	if(!$scope.processRating.residualRiskRatingOverrideKey){
    		$scope.showrRiskAccpt = false;
    		$scope.rationaleComments = false;
    		$scope.processRating.residualRiskDirKey = '';
    	}
    	else if($scope.processRating.residualRiskRatingOverrideKey && $scope.processRating.residualRiskDirKey){
    		 Rating.getProcessRationale($scope.processRating.residualRiskRatingOverrideKey, $scope.processRating.residualRiskDirKey).then(function (response) {
    	            $scope.processRating.riskAcceptanceDisplay = response.data.riskAcceptanceDisplay;
    	            if ($scope.processRating.riskAcceptanceDisplay === 'Y') {
    	                $scope.showrRiskAccpt = true;
    	            } else if ($scope.processRating.riskAcceptanceDisplay === 'N') {
    	                $scope.showrRiskAccpt = false;
    	                $scope.rationaleComments = false;
    	            }
    	            
    	        }, function (error) {
    	        	$scope.statusClass ='status invalid userErrorInfo';
    	        	$scope.statusInfo = error.data.errorMsg;
    	         });
				$scope.processRating.residualRatingText = '';
                $scope.PrcsratingValidationMsg = '';
				$scope.processRating.riskAcceptanceFlag = '';
				$scope.processRating.riskAcceptanceComment = '';
               	$scope.processRating.residualRiskDirKey='';
               	$scope.processRating.mssControlFlag='';
    	}
    };
    //Residual direction on change update acceptance flag function
    $scope.riskDirectionChange = function () {
        Rating.getProcessRationale($scope.processRating.residualRiskRatingOverrideKey, $scope.processRating.residualRiskDirKey).then(function (response) {
           $scope.processRating.riskAcceptanceDisplay = response.data.riskAcceptanceDisplay;
            if ($scope.processRating.riskAcceptanceDisplay === 'Y') {
                $scope.showrRiskAccpt = true;
            } else if ($scope.processRating.riskAcceptanceDisplay === 'N') {
                $scope.showrRiskAccpt = false;
                $scope.rationaleComments = false;
                $scope.processRating.riskAcceptanceComment = '';
            }
            //Reset the radio button
            $scope.processRating.riskAcceptanceFlag = '';
        }, function (error) {
        	$scope.statusClass ='status invalid userErrorInfo';
        	$scope.statusInfo = error.data.errorMsg;
         });
    };
    //show rational comment if user select risk acceptance Yes
    $scope.showRationalCmmt = function () {
        if ($scope.processRating.riskAcceptanceFlag === 'Y') {
            $scope.rationaleComments = true;
        } else if ($scope.processRating.riskAcceptanceFlag === 'N') {
            $scope.processRating.riskAcceptanceComment = '';
            $scope.rationaleComments = false;
        }
    };

    $scope.closeModal = function () {
        $scope.ProcessRatingWin.close();
    };
    $scope.residualRisk = function () {
    		 Rating.getProcessRationale($scope.processRating.residualRiskRatingOverrideKey, $scope.processRating.residualRiskDirKey).then(function (response) {
    	            $scope.processRating.riskAcceptanceDisplay = response.data.riskAcceptanceDisplay;
    	            if ($scope.processRating.riskAcceptanceDisplay === 'Y') {
    	                $scope.showrRiskAccpt = true;
    	            } else if ($scope.processRating.riskAcceptanceDisplay === 'N') {
    	                $scope.showrRiskAccpt = false;
    	                $scope.rationaleComments = false;
    	            }
    	        }, function (error) {
    	        	$scope.statusClass ='status invalid userErrorInfo';
    	        	$scope.statusInfo = error.data.errorMsg;
    	         });
    };

});
