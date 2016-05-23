angular.module('riskAssessmentApp').controller('EditRcsaCycleCtrl', function ($filter,$location, $modal, $rootScope, OrcitLoader , 
        $scope, $stateParams, kendoCustomDataSource, RcsaFactory, RcsaAssessConfig, classificationOptions, summaryRatingLevelOptions,
        cycleTypeOptions, cycleStatusOptions, populateFromOptions,OplossValidationDateOptions,$timeout) {
    'use strict';

   $scope.today = $filter('date')(new Date(), 'MM/dd/yyyy');
   $scope.enableOplossFromDate = false;
  
    $scope.closeConfirmation = function () {
        $scope.confirmationWin.close();
    };
    
    
    var includeExcludeGridData = function (id) {
        OrcitLoader.load(RcsaFactory.assessmentsData(id)).then(function (response) {
            $scope.assessmentViewDTO = response.data;
            $scope.includeAssGrid.setDataSource(includeAssData());
            $scope.includeAssGrid.dataSource.read();
             if(!$scope.includeAssGrid.dataSource._total){ 
                      $scope.disableStartAssbtn=true;
              }
              else
              {
                   $scope.disableStartAssbtn=false;
              }
                 
             if($scope.rcsaCycleDTO.opLossFromDate === null || $scope.rcsaCycleDTO.opLossToDate === null || 
                     $scope.rcsaCycleDTO.kriFromDate === null || $scope.rcsaCycleDTO.issueFromDate === null || $scope.rcsaCycleDTO.opLossValidationDateKey === null){
                 	 $scope.disableStartAssbtn=true;
                 }
             
            $scope.excludeAssGrid.setDataSource(excludeAssData());
            $scope.excludeAssGrid.dataSource.read();
        }, function (error) {
            $scope.statusClass ='status invalid userErrorInfo';
            $scope.statusInfo = error.data.errorMsg;
         });
    };
    var includeAssData = function () {
        return new kendo.data.DataSource({
            data: $scope.assessmentViewDTO.includeAssessmentsViewList,
            pageSize: 5
        });
    };

    var excludeAssData = function () {
        return new kendo.data.DataSource({
            data: $scope.assessmentViewDTO.excludeAssessmentsViewList,
            pageSize: 5
        });
    };

    $scope.rcsaCycleDTO = {};
    $scope.assessmentDTO = {};
    
    $scope.populateFromOptions = populateFromOptions;
    $scope.classificationOptions = classificationOptions;
    $scope.summaryRatingLevelOptions = summaryRatingLevelOptions;
    $scope.cycleTypeOptions = cycleTypeOptions;
    $scope.cycleStatusOptions = cycleStatusOptions;
    $scope.OplossValidationDateOptions = OplossValidationDateOptions;
    $scope.statusClass = '';
    $scope.statusInfo ='';

    
    
    // Saving Rcsa cycle
    var create = function () {
        var rcsaCycleId = $stateParams.rcsaCycleId || false;
        OrcitLoader.load(RcsaFactory.saveRcsaCycle($scope.rcsaCycleDTO,rcsaCycleId)).then(function (response) {
            $scope.rcsaCycleDTO = response.data;
            $scope.statusInfo = $scope.rcsaCycleDTO.responseMesg;
            $scope.statusClass ='userSuccessInfo';
            $scope.saveCycleCallBack();
        }, function (error) {
            $scope.statusClass ='status invalid userErrorInfo';
            $scope.statusInfo = error.data.errorMsg;
         });
    };
    $scope.saveCycleCallBack = function () {
        $scope.confirmationWin.close();
        $location.path('/rcsa/editRcsaCycle/' + $scope.rcsaCycleDTO.rskAsesCycleKey+ '/' + new Date().getTime());
    };
    var closeCycle = function () {
        var rcsaCycleId = $stateParams.rcsaCycleId || false;
        OrcitLoader.load(RcsaFactory.closeCycle($scope.rcsaCycleDTO,rcsaCycleId)).then(function (response) {
            $scope.rcsaCycleDTO = response.data;
                $scope.statusInfo = $scope.rcsaCycleDTO.responseMesg;
                $scope.statusClass ='userSuccessInfo';
        }, function (error) {
            $scope.statusClass ='status invalid userErrorInfo';
            $scope.statusInfo = error.data.errorMsg;
         });
    };
    var cancelCycle = function () {
        var rcsaCycleId = $stateParams.rcsaCycleId || false;
        OrcitLoader.load(RcsaFactory.cancelCycle($scope.rcsaCycleDTO,rcsaCycleId)).then(function (response) {
            $scope.rcsaCycleDTO = response.data;
            
            $scope.statusInfo = $scope.rcsaCycleDTO.responseMesg;
            $scope.statusClass ='userSuccessInfo';
            $timeout(function () {
                 $location.path('/rcsa/editRcsaCycle/' + $scope.rcsaCycleDTO.rskAsesCycleKey+ '/' + new Date().getTime());
            }, 500);
        }, function (error) {
            $scope.statusClass ='status invalid userErrorInfo';
            $scope.statusInfo = error.data.errorMsg;
         });
    };
    $scope.submit = function () {
        if($stateParams.rcsaCycleId){
             $modal.open({
                 templateUrl: 'views/rcsa/editRcsaCycleSaveModal.html'
             }).result.then(create);
        }
        else{
            OrcitLoader.load(RcsaFactory.getCycleName($scope.rcsaCycleDTO.longName)).then(function (response) {
            $scope.checkName = response.data;
            if ($scope.checkName === true) {
                $scope.createRcsaCycleForm.rcsaName.$setValidity('unique', false);
            } else {
                $scope.createRcsaCycleForm.rcsaName.$setValidity('unique', true);
                $modal.open({
                    templateUrl: 'views/rcsa/editRcsaCycleSaveModal.html'
                }).result.then(create);
            }
        }, function (error) {
            $scope.statusClass ='status invalid userErrorInfo';
            $scope.statusInfo = error.data.errorMsg;
         });
        }
    };
    $scope.closeCycle = function () {
        $modal.open({
            templateUrl: 'views/rcsa/editRcsaCloseCycleModal.html'
        }).result.then(closeCycle);
    };
    $scope.cancelCycle = function () {
        $modal.open({
            templateUrl: 'views/rcsa/editRcsaCancelCycleModal.html'
        }).result.then(cancelCycle);
    };
    $scope.handleCancel = function () {
        if($scope.createRcsaCycleForm.$dirty){
        $modal.open({
            templateUrl: 'views/rcsa/editRcsaCycleCancelModal.html'
        }).result.then(clear);
        }
        else{
            clear();
        }
    };
    function clear() {
        $location.path('/rcsa/viewSearchCycles');
    }

    $scope.editAssessmentFrmCycle = function (assessmentId) {
        $location.path('/rcsa/editAssessmentFromCycle/'+assessmentId+'/'+$stateParams.rcsaCycleId);
    };
    
    $scope.viewAssessmentFrmCycle = function(assessmentId) {
      $location.path('/rcsa/viewAssessmentFromCycle/'+assessmentId+'/'+$stateParams.rcsaCycleId);
    };

    //get Cycle data in edit state
    function loadRcsaCycle(id) {
        OrcitLoader.load(RcsaFactory.cycleData(id)).then(function (response) {
            $scope.rcsaCycleDTO = response.data;
            if($scope.rcsaCycleDTO.opLossFromDate !== null){
              	 $scope.enableOplossFromDate = true;
              }
            if($scope.rcsaCycleDTO.opLossFromDate === null || $scope.rcsaCycleDTO.opLossToDate === null || 
                $scope.rcsaCycleDTO.kriFromDate === null || $scope.rcsaCycleDTO.issueFromDate === null || $scope.rcsaCycleDTO.opLossValidationDateKey === null){
            	 $scope.disableStartAssbtn=true;
            }
            
            $scope.$watch('rcsaCycleDTO.issueFromDate', function(value){
                if($scope.editMode){
                	 if (!value) {
                        $scope.createRcsaCycleForm.issueFromDate.$setValidity('required', false);
                    } else {
                        $scope.createRcsaCycleForm.issueFromDate.$setValidity('required', true);
                       // $scope.disableStartAssbtn=true;
                    }
                }
            	
            });
            $scope.$watch('rcsaCycleDTO.kriFromDate', function(value){
                if($scope.editMode){
                	 if (!value) {
                         $scope.createRcsaCycleForm.kriFromDate.$setValidity('required', false);
                     } else {
                         $scope.createRcsaCycleForm.kriFromDate.$setValidity('required', true);
                         //$scope.disableStartAssbtn=true;
                     }
                }
                });
                $scope.$watch('rcsaCycleDTO.opLossValidationDateKey', function(value){
                	if($scope.editMode){
                   	 if (!value) {
                            $scope.createRcsaCycleForm.oplossValDate.$setValidity('required', false);
                        } else {
                            $scope.createRcsaCycleForm.oplossValDate.$setValidity('required', true);
                           // $scope.disableStartAssbtn=true;
                        }
                   }
                });
                
                $scope.$watch('rcsaCycleDTO.opLossFromDate', function(value){
                	if($scope.editMode){
                   	 if (!value) {
                            $scope.createRcsaCycleForm.opLossFromDate.$setValidity('required', false);
                        } else {
                            $scope.createRcsaCycleForm.opLossFromDate.$setValidity('required', true);
                            //$scope.disableStartAssbtn=true;
                        }
                   }
                });
                
        }, function (error) {
            $scope.statusClass ='status invalid userErrorInfo';
            $scope.statusInfo = error.data.errorMsg;
         });
    }
    //Remove Assessment from include grid
    $scope.excludeAssess = function (key) {
        OrcitLoader.load(RcsaFactory.assessmentDetails(key.riskAssessmentKey, 'RS_DELETED')).then(function () {
            includeExcludeGridData($stateParams.rcsaCycleId);
            $scope.includeAssGrid.dataSource.read();
        }, function (error) {
            $scope.statusClass ='status invalid userErrorInfo';
            $scope.statusInfo = error.data.errorMsg;
         });
    };
    //Add Assessment to inlcude grid
    $scope.includeAssess = function (key) {
        OrcitLoader.load(RcsaFactory.assessmentDetails(key.riskAssessmentKey, 'RS_ACTIVE')).then(function () {
            includeExcludeGridData($stateParams.rcsaCycleId);
            $scope.excludeAssGrid.dataSource.read();
        }, function (error) {
            $scope.statusClass ='status invalid userErrorInfo';
            $scope.errorMessage = error.data.techErrorMsg;
			$scope.statusInfo = $scope.errorMessage;
         });
    };
    //Check if cycle name already present
    $scope.checkCycleName = function () {
    	if($scope.rcsaCycleDTO.longName.trim().length){	
	        RcsaFactory.getCycleName($scope.rcsaCycleDTO.longName).then(function (response) {
	            $scope.checkName = response.data;
	            if ($scope.checkName === true) {
	                $scope.createRcsaCycleForm.rcsaName.$setValidity('unique', false);
	            } else {
	                $scope.createRcsaCycleForm.rcsaName.$setValidity('unique', true);
	            }
	        }, function (error) {
	            $scope.statusClass ='status invalid userErrorInfo';
	            $scope.statusInfo = error.data.errorMsg;
	         });
      }
    };
    //Setting up grid options
    $scope.includeAssOptions = RcsaAssessConfig.includeAssessmentGrid;
    $scope.excludeAssOptions = RcsaAssessConfig.excludeAssessmentGrid;
    
    //addRcsaAssessmentToCycle
    $scope.createAssess = function () {
        $location.path('/rcsa/addAssessment/' + $stateParams.rcsaCycleId);
    };
    //dates range validation method
    $scope.validateDate = function (startField, endField) {
        var isValid = Date.parse($scope.rcsaCycleDTO[startField]) <= Date.parse($scope.rcsaCycleDTO[endField]);
        $scope.createRcsaCycleForm[endField].$setValidity('dateRange',isValid);
        $scope.createRcsaCycleForm.$setValidity('dateRange',isValid);
    };

    $scope.validateOplossDate = function (startField, endField) {
      var startDate = $scope.rcsaCycleDTO[startField];
      var endDate = $scope.rcsaCycleDTO[endField];
      if(startDate !== null && startDate !== '' && endDate !== null && endDate !== ''){
        var isValid = new Date(startDate) <= new Date(endDate);
        $scope.createRcsaCycleForm[startField].$setValidity('dateRange',isValid);
        $scope.createRcsaCycleForm.$setValidity('dateRange',isValid);
      }
   };
  
    function startAssessment() {
        OrcitLoader.load(RcsaFactory.startAssessments($stateParams.rcsaCycleId)).then(function (response) {
            $scope.rcsaCycleDTO = response.data;
            includeExcludeGridData($scope.rcsaCycleDTO.rskAsesCycleKey);
            //$location.path('/rcsa/viewAssessment');
            $location.path('/rcsa/editRcsaCycle/' + $scope.rcsaCycleDTO.rskAsesCycleKey+ '/' + new Date().getTime());
        }, function (error) {
            $scope.statusClass ='status invalid userErrorInfo';
            $scope.statusInfo = error.data.errorMsg;
         });
    }
    $scope.startAssessmentHandler = function () {
        $modal.open({
            templateUrl: 'views/rcsa/startAssessmentSaveModal.html'
        }).result.then(startAssessment);
    };

    //Setting Cycle edit stateParams
    if ($stateParams.rcsaCycleId) {
        $scope.editMode = true;
        $scope.disablePopulate = true;
        loadRcsaCycle($stateParams.rcsaCycleId);
        includeExcludeGridData($stateParams.rcsaCycleId);
        $scope.rcsaCycleDTO = {};
    } else {
        loadRcsaCycle(0);
    }
    $scope.shoeHideAddAssessment=false;
    $scope.showHideAddAssessment = function (value) {
        if(value === 'Include'){
            $scope.shoeHideAddAssessment=false;
        }else{$scope.shoeHideAddAssessment=true; }
    };
    $scope.onChangeClassification = function(){
        if($scope.rcsaCycleDTO.clasLkupCode === 'RA_CYC_FREQ_ADHOC'){
            $scope.rcsaCycleDTO.populateFromRskAssesCycKey = null;
            $scope.disablePopulateFrom = true;
        }else{
            $scope.disablePopulateFrom = false;
        }
    };
    // get Oploss validation dates ranges
    $scope.OplossFromAndToDate = function() {
      if($scope.rcsaCycleDTO.opLossValidationDateKey === null){
        $scope.rcsaCycleDTO.opLossFromDate = null;
        $scope.rcsaCycleDTO.opLossToDate = null;
        $scope.enableOplossFromDate = false;
        return;
      }
      $scope.enableOplossFromDate = true;
    	$scope.rcsaCycleDTO.opLossValidationDateKey = $scope.rcsaCycleDTO.opLossValidationDateKey;
      RcsaFactory.OplossDatesFactory($scope.rcsaCycleDTO.opLossValidationDateKey).then(function (response){
        $scope.rcsaCycleDTO.opLossFromDate = response.data.opLossFromDate;
        $scope.rcsaCycleDTO.opLossToDate = response.data.opLossToDate;
      });
    };
    $scope.init = function () { 
    		if($scope.editMode){
    		 $scope.requiredstr='required';
        	}
    			
    		  
    };
    $scope.init();

});
