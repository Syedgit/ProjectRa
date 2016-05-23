angular
        .module('riskAssessmentApp')
        .controller('ProcessCtrl', function($scope, existingProcess, $rootScope, OrcitLoader, $stateParams, kendoCustomDataSource, $http, $state, $location, alert, ihtRskRatingGridConfig, processTreeConfig, alignedRisksHeaderPallette, riskToControlGridDataService, savaControlToProcessGrid, processService, savaControlToProcessNoAlignGrid, processRatingGridConfig, Rating, alignExstRskDataService, alignedCtrlsHeaderPallette, processFactory, alignedRiskService, RiskService, TreeHirachyInfo, rcsaAssessmentService, processChallengesGridConfig, RiskHomePageService, pageDisable) {
            'use strict';

            $scope.prcLockDownFlag = pageDisable !== null && pageDisable.prcLockDownFlag ? pageDisable.prcLockDownFlag : false;
            $scope.prcChallengesLockDownFlag = pageDisable !== null && pageDisable.prcChallengesLockDownFlag ? pageDisable.prcChallengesLockDownFlag : false;

            var setConfirmationWinButtons = function(hideYesBtn, hideNoBtn, showOkBtn) {
                $scope.hideYesBtn = hideYesBtn;
                $scope.hideNoBtn = hideNoBtn;
                $scope.showOkBtn = showOkBtn;
            };
            var disableChallengesService = false;
            $scope.disableErhAllLevels = true;
            var resetData2 = function() {

                return new kendo.data.DataSource({
                    type: 'json',
                    serverFiltering: false,
                    transport: {
                        read: function(options) {
                            OrcitLoader.load(processService.getRiskRatings()).then(function(data) {
                                var ratings = data.data;
                                $.each(ratings, function(index, ratingObj) {
                                    if (ratingObj.status !== 'Final') {
                                        $scope.disableRiskRatingBtn = true;
                                        $scope.$broadcast('disableQuestionGrid');
                                    }
                                });
                                options.success(ratings);
                            }, function(error) {
                                $scope.statusClass = 'status invalid userErrorInfo';
                                var errorMessage = error.data.errorMsg;
                                if (error.data.techErrorMsg) {
                                    errorMessage = error.data.techErrorMsg;
                                }
                                $scope.statusInfo = errorMessage;
                            });
                        }
                    },
                    pageSize: 5
                });
            };
            var resetDataPrt = function() {
                return new kendo.data.DataSource({
                    type: 'json',
                    serverFiltering: false,
                    pageSize: 5,
                    transport: {
                        read: function(options) {
                            Rating.getAllProcessRatings($stateParams.processId).then(function(data) {
                                var processRating = data.data;
                                options.success(processRating);
                            }, function(error) {
                                $scope.statusClass = 'status invalid userErrorInfo';
                                var errorMessage = error.data.errorMsg;
                                if (error.data.techErrorMsg) {
                                    errorMessage = error.data.techErrorMsg;
                                }
                                $scope.statusInfo = errorMessage;
                            });
                        }
                    }
                });
            };

            var init = function() {
                // Should only do things that are in BOTH create and edit
                $scope.nonProcessReadonly = true;
                $scope.readonly = false;
                $scope.epcfHirachyInfo = {};
                $scope.dealignCtrlPrcsKey = '';
                $scope.dealignRskPrcsKey = '';
                $scope.CtrlOption = '';
                $scope.RsKey = '';
                $scope.statusInfo = '';
                $scope.statusClass = '';
                $scope.validationClass = '';
                $scope.alignInfo = '';
                $scope.prtStatusInfo = '';
                $scope.prtStatusInfoClass = '';
                $scope.statusAlignInfo = '';
                $scope.processname = '';
                $scope.prcGvrnDTO = {};
                // Do conditional setting up
                if ($stateParams.processId) {
                    $scope.editMode = true;
                    console.log('existing process', existingProcess.data);
                    $scope.nonPersistentProcess = $scope.nonPersistentProcess || {};
                    $scope.processname = existingProcess.data.processLongName;
                    $scope.processDTO = existingProcess.data;

                    if ($scope.processDTO.geoLocationsKeyList) {
                        $scope.nonPersistentProcess.geoLocations = $scope.processDTO.geoLocationsKeyList;
                    } else {
                        $scope.nonPersistentProcess.geoLocations = [];

                    }
                    if ($scope.processDTO.requestedEpcfUtilKeyList) {
                        $scope.nonPersistentProcess.requestedEpcfKey = $scope.processDTO.requestedEpcfUtilKeyList;
                        $scope.nonPersistentProcess.requestedEpcfKeyDB = $scope.processDTO.requestedEpcfUtilKeyList;
                    } else {
                        $scope.nonPersistentProcess.requestedEpcfKey = [];
                    }
                    if ($scope.processDTO.legalEntitiesKeyList) {
                        $scope.nonPersistentProcess.legalEnty = $scope.processDTO.legalEntitiesKeyList;
                    } else {
                        $scope.nonPersistentProcess.legalEnty = [];

                    }
                    if ($scope.processDTO.erhUtilKeyList) {
                        $scope.nonPersistentProcess.erhKey = $scope.processDTO.erhUtilKeyList;
                    } else {
                        $scope.nonPersistentProcess.erhKey = [];
                    }
                    if($scope.processDTO.erhAllLevelsUtilKeyList){
                        $scope.nonPersistentProcess.erhAllLevelsKey = $scope.processDTO.erhAllLevelsUtilKeyList;
                    }else{
                        $scope.nonPersistentProcess.erhAllLevelsKey = [];
                    }
                    $scope.prcGvrnDTO.prcGvrnAprvKy = $scope.processDTO.processGvrnAprvKy;
                    
                    if($scope.processDTO.deactiveERHMessage){
                        $scope.nonPersistentProcess.erhKey = [];
                        $scope.processDTO.erhUtilKeyList = [];
                    }
                } else {
                    $scope.editMode = false;

                    // models for treeview dropdowns
                    $scope.nonPersistentProcess = {
                        epcfKey: [],
                        legalEnty: [],
                        erhKey: [],
                        erhAllLevelsKey: [],
                        geoLocations: [],
                        requestedEpcfKey: []
                    };
                    $scope.processDTO = {
                        epcfUtilKeyList: $scope.nonPersistentProcess.epcfKey,
                        legalEntitiesKeyList: $scope.nonPersistentProcess.legalEnty,
                        erhUtilKeyList: $scope.nonPersistentProcess.erhKey,
                        erhAllLevelsUtilKeyList: $scope.nonPersistentProcess.erhAllLevelsKey,
                        geoLocationsKeyList: $scope.nonPersistentProcess.geoLocations,
                        processOwnerWorkerKey: '',
                        prcsOwner: '',
                        requestedEpcfUtilKeyList: $scope.nonPersistentProcess.requestedEpcfKey
                    };
                }
                // Control Frequency
                kendoCustomDataSource.getAnguDropdownData('CTL_FREQ').then(function(response) {
                    $scope.frequencyOptions = response.data;
                });
                // Yes or No flag
                $scope.yesOrNoOptions = [{
                    id: 'Yes',
                    text: 'Yes'
                }, {
                    id: 'No',
                    text: 'No'
                }];

            };

            var closeWindow = function(scope) {
                if (scope.alignExstRsk) {
                    scope.alignExstRsk.close();
                }
                if (scope.$parent.alignControlToProcess) {
                    scope.$parent.alignControlToProcess.close();
                }
                $scope.alignedRisksGridOptions.dataSource.read();
                $scope.selectedAlignRisksFlag = true;
            };

            var successCallBack = function() {
                setConfirmationWinButtons(false, false, false);
                $scope.confirmationWin.close();
            };

            var unAlignedCallBack = function(scope) {
                scope.alignedRisksGrid.dataSource.read();
                $scope.selectedAlignRisksFlag = true;
                processRatingGridConfig.processRatingGrid.dataSource.read();
                $scope.selectedProcessRating = new Date().getTime();
                ihtRskRatingGridConfig.ihtRskRatingGrid.dataSource.read();
                $scope.selectedIRR = new Date().getTime();
                setInterval(function() {
                    $scope.alignInfo = '';
                }, 1000);
            };

            var unAlignRiskWithinProcessCallback = function(riskInProcessKey, scope) {
                RiskService.getunAllignRiskWithinProcess(riskInProcessKey).then(function() {
                    $scope.alignInfo = 'Selected Risk and associated Controls are UnAligned successfully ';
                    $scope.statusClass = 'userSuccessInfo';
                    setInterval(function() {
                        $scope.alignInfo = '';
                    }, 1000);
                    $scope.confirmationWin.close();
                    unAlignedCallBack(scope);
                }, function(error) {
                    $scope.statusClass = 'status invalid userErrorInfo';
                    $scope.alignInfo = error.data.errorMsg;
                });
            };

            var create = function() {
                console.log('Owner DTO during create:', $scope.processDTO);
                var processId = $stateParams.processId || false;
                $scope.closeConfirmation();
                // going forward we dont want to use nonPersistentProcess
                $scope.processDTO.epcfUtilKeyList = $scope.nonPersistentProcess.epcfKey;
                $scope.processDTO.erhUtilKeyList = $scope.nonPersistentProcess.erhKey;
                $scope.processDTO.erhAllLevelsUtilKeyList = $scope.nonPersistentProcess.erhAllLevelsKey;
                $scope.processDTO.legalEntitiesKeyList = $scope.nonPersistentProcess.legalEnty;
                $scope.processDTO.geoLocationsKeyList = $scope.nonPersistentProcess.geoLocations;
                console.log('b4 save', $scope.processDTO);

                OrcitLoader.load(processFactory.saveProcess($scope.processDTO, processId)).then(function(response) {
                    $scope.statusClass = 'userSuccessInfo';
                    $scope.statusInfo = response.data.responseMesg;
                    $scope.saveProcessCallBack(response.data);
                }, function(error) {
                    $scope.statusClass = 'status invalid userErrorInfo';
                    var errorMessage = error.data.errorMsg;
                    if (error.data.techErrorMsg) {
                        errorMessage = error.data.techErrorMsg;
                    }
                    $scope.statusInfo = errorMessage;
                });
            };

            $scope.$watch('nonPersistentProcess.erhKey', function() {
                var item = $scope.nonPersistentProcess.erhKey[0];
                if (item) {
                    if ($scope.editMode && (!existingProcess.data.erhUtilKeyList.length || item.id !== existingProcess.data.erhUtilKeyList[0].id)) {
                        processService.getRisksAndCtrlsAlignToProcess().then(function(data) {
                            if (data.data.hasRisks && data.data.hasControls) {
                                $scope.successMessage($rootScope.alertMessages['processErh.confirmMessage']);
                            } else if (data.data.hasRisks) {
                                $scope.successMessage($rootScope.alertMessages['processErh.riskConfirmMessage']);
                            } else if (data.data.hasControls) {
                                $scope.successMessage($rootScope.alertMessages['processErh.ctrlConfirmMessage']);
                            }
                        }, function(error) {
                            $scope.statusClass = 'status invalid userErrorInfo';
                            var errorMessage = error.data.errorMsg;
                            if (error.data.techErrorMsg) {
                                errorMessage = error.data.techErrorMsg;
                            }
                            $scope.statusInfo = errorMessage;
                        });
                    }
                    TreeHirachyInfo.getErhInfo(item.id).then(function(response) {
                        $scope.erhObj = response.data;
                        $scope.processDTO.businessSegmentOrControlFunction = $scope.erhObj.businessSegmentOrControlFunction;
                        $scope.processDTO.erhToolTip = $scope.erhObj.erhToolTip;
                    }, function(error) {
                        $scope.statusClass = 'status invalid userErrorInfo';
                        var errorMessage = error.data.errorMsg;
                        if (error.data.techErrorMsg) {
                            errorMessage = error.data.techErrorMsg;
                        }
                        $scope.statusInfo = errorMessage;
                    });
                    $http.get('app/prcs/rest/cacheDropdown/ENTR_REP_HRCHY/ERH_ALL?id='+item.id).then(function(response) {
                        $scope.erhAllTreeData = response.data;
                        $scope.disableErhAllLevels = false;
                    });
                } else {
                    $scope.processDTO.businessSegmentOrControlFunction = '';
                    $scope.processDTO.erhToolTip = '';
                    $scope.processDTO.erhAllLevelsToolTip = '';
                    $scope.nonPersistentProcess.erhAllLevelsKey = [];
                    $scope.disableErhAllLevels = true;
                }
            });
            
            $scope.$watch('nonPersistentProcess.erhAllLevelsKey', function() {
                var item = $scope.nonPersistentProcess.erhAllLevelsKey[0];
                if (item) {
                    TreeHirachyInfo.getErhInfo(item.id).then(function(response) {
                        $scope.erhAllLevelsObj = response.data;
                        $scope.processDTO.erhAllLevelsToolTip = $scope.erhAllLevelsObj.erhToolTip;
                    }, function(error) {
                        $scope.statusClass = 'status invalid userErrorInfo';
                        var errorMessage = error.data.errorMsg;
                        if (error.data.techErrorMsg) {
                            errorMessage = error.data.techErrorMsg;
                        }
                        $scope.statusInfo = errorMessage;
                    });
                } else {
                    $scope.processDTO.erhAllLevelsToolTip = '';
                }
            });

            $scope.$watch('nonPersistentProcess.requestedEpcfKey', function() {
                var item = $scope.nonPersistentProcess.requestedEpcfKey[0];

                if (item) {
                    if(!$scope.prcGvrnDTO.prcGvrnAprvKy){
                        if (item.text === $scope.processDTO.currentEpcfText) {
                            $scope.nonPersistentProcess.requestedEpcfKey = [];
                            $scope.processDTO.epcfDescription = '';
                            $scope.successMessage('Current and Requested EPCF values cannot be same');
                            return;
                        }
                    }
                    TreeHirachyInfo.getEpcfInfo(item.id).then(function(response) {
                        $scope.epcfObj = response.data;
                        $scope.processDTO.requestedEpcfDescription = $scope.epcfObj.epcfDescription;
                        $scope.processDTO.requestedEpcfToolTip = $scope.epcfObj.epcfToolTip;
                    }, function(error) {
                        $scope.statusClass = 'status invalid userErrorInfo';
                        var errorMessage = error.data.errorMsg;
                        if (error.data.techErrorMsg) {
                            errorMessage = error.data.techErrorMsg;
                        }
                        $scope.statusInfo = errorMessage;
                    });
                } else {
                    $scope.processDTO.requestedEpcfToolTip = '';
                }
            });

            $scope.saveProcessCallBack = function(data) {
                $scope.processDTO = data;
                // TODO: Why are we putting a timestamp on the end of a browser URL? remove this.
                $location.path('/process/' + $scope.processDTO.processKey + '/' + new Date().getTime()).search({
                    from: 'create'
                });
            };

            $scope.updateProcessCallBack = function() {
                $location.path('/');
            };
            $scope.createAlignCtrltoPrcs = function() {
                $location.path('/cnaCtrl/' + $stateParams.processId + '/' + $scope.nonPersistentProcess.riskKey + '?from=editProcess');
            };

            $scope.clear = function() {
                init();
                $scope.validationMessage = ' ';
                $scope.createProcessFormName.$setPristine();
                if ($stateParams.from) {
                    $location.path('/viewSearchInv');
                } else {
                    $location.path('/');
                }
            };

            $scope.gotoQstnPage = function(isNew) {

                $rootScope.status = 'NewPrt';
                processFactory.setprocessname($scope.processname);
                $location.path('/createRtgQstnAir/' + $scope.processDTO.processKey + '/' + isNew);
            };

            $scope.dateFormat = function(date, format) {
                return kendo.toString(date, format);
            };

            $scope.cnaRsk = function() {

                $state.go('app.createAndAlignRisk', {
                    from: 'editProcess',
                    processId: $scope.processDTO.processKey
                });
            };
            // TODO: editProcessRating and viewProcessRating are the same function and should be combined
            $scope.editProcessRating = function(prcsSessionKey) {
                processFactory.setprocessname($scope.processname);
                var prtUrl = '/getProcessRating/' + $scope.processDTO.processKey + '/' + prcsSessionKey;
                $rootScope.status = 'edit';
                $location.path(prtUrl);
            };

            $scope.viewProcessRating = function(prcsSessionKey) {
                processFactory.setprocessname($scope.processname);
                var prtUrl = '/viewProcessRating/' + $scope.processDTO.processKey + '/' + prcsSessionKey;
                $rootScope.status = 'view';
                $location.path(prtUrl);
            };

            // Load on toggle radio button
            $scope.toggleChange = function() {
//              if ($scope.nonPersistentProcess.showCriteria === 'disassign') {
//                  $scope.controlRiskGridOption = riskToControlGridDataService.getControlsInProcess();
//                  $scope.controlRiskGridOption.dataSource = riskToControlGridDataService.getControlsInProcessGridDataSource($stateParams.processId, $scope.nonPersistentProcess.riskKey);
//              } else if ($scope.nonPersistentProcess.showCriteria === 'assign') {
                   // $scope.controlRiskGridOption = riskToControlGridDataService.getAllControls($scope);
                   // $scope.controlRiskGridOption.dataSource = riskToControlGridDataService.getAllControlsGridDataSource($stateParams.processId, $scope.nonPersistentProcess.riskKey);
//              }
                $scope.selectedFlagControlInProcess = true;
                $scope.selectedTypeProcess = new Date().getTime();
                $scope.controlInPrcsSelected = {};
                $scope.controlInPrcsNoAlignSelected = {};
                $scope.controlInPrcsSelectedArray = {};
                $scope.controlInPrcsNoAlignSelectedArray = {};
            };

            // TODO: this function needs to be broken up. It is way too complex.
            $scope.validateControlInPrcs = function() {

                var that = this;
                var controlInProcessObjectDTO = {};
                var currentData = {};
                var updatedRecords = [];
                var rowData, checkedRows, selected;
                // check radio button using ng-model in template
//              if ($scope.nonPersistentProcess.showCriteria === 'disassign') {
//                  checkedRows = $scope.controlInPrcsSelected;
//                  currentData = $scope.controlInPrcsSelectedArray;
//              } else {
                    checkedRows = $scope.controlInPrcsNoAlignSelected;
                    currentData = $scope.controlInPrcsNoAlignSelectedArray;
               // }
                // check checkbox is selected
                $.each(checkedRows, function(key, value) {
                    if (value) {
                        selected = true;
                    }
                });
                if (!selected) {
                    $scope.successMessage('Please select the controls you want to align to the risk');
                    return;
                }
                controlInProcessObjectDTO.riskKey = $scope.nonPersistentProcess.riskKey;
                controlInProcessObjectDTO.processKey = $stateParams.processId;
                // get grid object available in the current scope
                $.each(currentData, function(key, value) {
                    rowData = value;
                    if (checkedRows[key]) {
                        rowData.controlGeoLocation = [];
                        processFactory.getIdList(rowData.geoLocationsKeyList, rowData.controlGeoLocation);
                        updatedRecords.push(rowData.toJSON());
                    }
                });

                // set the list in the object and call angular service fro save and reload
                controlInProcessObjectDTO.lstControlInProcessDTO = updatedRecords;
//              if ($scope.nonPersistentProcess.showCriteria === 'disassign') {
//                  savaControlToProcessGrid.save(controlInProcessObjectDTO, function() {
//                      $scope.alignInfo = $rootScope.alertMessages['alignControlToRisk.success'];
//                      $scope.statusClass = 'userSuccessInfo';
//                      $scope.ControlToProcessCallBack();
//                      closeWindow(that);
//                  }, function(error) {
//                      $scope.statusClass = 'status invalid userErrorInfo';
//                      var errorMessage = error.data.errorMsg;
//                      if (error.data.techErrorMsg) {
//                          errorMessage = error.data.techErrorMsg;
//                      }
//                      $scope.statusInfo = errorMessage;
//                  });
//              } 
             //   else {
                    savaControlToProcessNoAlignGrid.save(controlInProcessObjectDTO, function() {
                        $scope.alignInfo = $rootScope.alertMessages['alignControlToRisk.success'];
                        $scope.statusClass = 'userSuccessInfo';
                        $scope.ControlToProcessCallBack();
                        closeWindow(that);
                    }, function(error) {
                        $scope.statusClass = 'status invalid userErrorInfo';
                        var errorMessage = error.data.errorMsg;
                        if (error.data.techErrorMsg) {
                            errorMessage = error.data.techErrorMsg;
                        }
                        $scope.statusInfo = errorMessage;
                    });
               // }
            };

            $scope.ControlToProcessCallBack = function() {
            	if(alignedCtrlsHeaderPallette.alignedCtrlsGrid.dataSource){
	                alignedCtrlsHeaderPallette.alignedCtrlsGrid.dataSource.read();
	                $scope.alignedControlsToProcess = new Date().getTime();
            	}
               if(processRatingGridConfig.processRatingGrid.dataSource){
	                processRatingGridConfig.processRatingGrid.dataSource.read();
	                $scope.selectedProcessRating = new Date().getTime();
               }
                
                setInterval(function() {
                    $scope.alignInfo = '';
                }, 1000);
            };

            $scope.openAlignControlToProcess = function(riskKey) {
                $scope.controlInPrcsSelected = {};
                $scope.controlInPrcsNoAlignSelected = {};
                $scope.controlInPrcsSelectedArray = {};
                $scope.controlInPrcsNoAlignSelectedArray = {};
                $scope.nonPersistentProcess.showCriteria = 'disassign';
                $scope.nonPersistentProcess.riskKey = riskKey;
                this.alignControlToProcess.open().center();
                this.alignControlDescModal.close();
                // Load control in process on opening the window
                $scope.controlRiskGridOption = riskToControlGridDataService.getControlsInProcess();
                $scope.controlRiskGridOption.dataSource = riskToControlGridDataService.getControlsInProcessGridDataSource($stateParams.processId, $scope.nonPersistentProcess.riskKey);
                $scope.selectedTypeProcess = new Date().getTime();
                // Load Geo location on opening the window
                $scope.controlInPrcsGeoLocationTreeOptions = processTreeConfig.controlInPrcsGeoLocationTreeGridConfig;
            };
            $scope.openAlignControldecision = function(rskKey) {
                console.log('this', this);
                $scope.CtrlOption = 'N';
                this.$parent.alignControlDescModal.open().center();
                $scope.RsKey = rskKey;
            };
            $scope.openCtrlRedirect = function(CtrlOpt) {
                $scope.CtrlOption = CtrlOpt;
                $scope.selectedFlagControlInProcess=true;
                //this.$parent.alignControlDescModal.close();
                if ($scope.CtrlOption === 'Y') {
                    $state.go('app.createAndAlignControl', {
                        processId: $scope.processDTO.processKey,
                        rskKey: $scope.RsKey,
                        from: 'editProcess'
                    });
                } else if ($scope.CtrlOption === 'N') {
                    this.$parent.openAlignControlToProcess($scope.RsKey);
                    $scope.controlRiskGridOption = riskToControlGridDataService.getAllControls($scope);
                    $scope.controlRiskGridOption.dataSource = riskToControlGridDataService.getAllControlsGridDataSource($stateParams.processId, $scope.nonPersistentProcess.riskKey);
                    $scope.toggleChange();
                }
            };
            $scope.openAlignExistingRisk = function() {
                $scope.statusInfo = '';
                $scope.statusClass = '';
                $scope.riskInPrcsSelected = {};
                $scope.riskInPrcsSelectedArray = {};
                $scope.selectedFlagRiskInProcess = true;
                this.alignExstRsk.open().center();
                $scope.alignedRisksOptions = alignedRiskService.getAlignedRisksModalHeader();
                $scope.alignedRisksOptions.dataSource = alignExstRskDataService.getExistingRskDataSource($stateParams.processId);
                // TODO: either this needs to be renamed to something that explains what it is or removed.
                $scope.alignRiskToPrcoess = new Date().getTime();
                
                
            };
            
           
            
           
            $scope.validateRiskInPrcs = function() {
                var checkedRisks = $scope.riskInPrcsSelected;
                var notSelected = true;
                var riskInProcessDTO = {};
                var currentData = $scope.riskInPrcsSelectedArray;
                var updatedRecords = [];
                var rowData;
                var that = this;
                $.each(checkedRisks, function(key, value) {
                    if (value) {
                        notSelected = false;
                    }
                });
                if (notSelected) {
                    $scope.successMessage('Please select the Risks you want to align to the process');
                    return;
                }
                riskInProcessDTO.processKey = $stateParams.processId;
                $.each(currentData, function(key, value) {
                    rowData = value;
                    if (checkedRisks[key] === true) {
                        rowData.refineLocationskeyList = [];
                        processFactory.getIdList(rowData.geoLocationsKeyList, rowData.refineLocationskeyList);
                        updatedRecords.push(rowData.toJSON());
                    }
                });
                riskInProcessDTO.lstRiskInProcessDTO = updatedRecords;
                OrcitLoader.load(alignExstRskDataService.saveExistingRisk(riskInProcessDTO)).then(function() {
                    $scope.statusAlignInfo = $rootScope.alertMessages['alignExistRiskToProcess.success'];
                    $scope.statusClass = 'userSuccessInfo';
                    setInterval(function() {
                        $scope.statusAlignInfo = '';
                    }, 1000);
                    $scope.ControlToProcessCallBack();
                    closeWindow(that);
                    setInterval(function() {
                        $scope.statusInfo = '';
                    }, 1000);
                }, function(error) {
                    $scope.statusClass = 'status invalid userErrorInfo';
                    var errorMessage = error.data.errorMsg;
                    if (error.data.techErrorMsg) {
                        errorMessage = error.data.techErrorMsg;
                    }
                    $scope.statusInfo = errorMessage;
                });
            };
            $scope.closeConfirmation = function() {
                $scope.confirmationWin.close();
            };

            $scope.editRiskWithinProcess = function(riskInProcessKey) {
                $state.go('app.alignRiskToProcess', {
                    from: 'editProcess',
                    processId: $stateParams.processId,
                    riskInProcessKey: riskInProcessKey
                });
            };
            $scope.viewRiskWithinProcess = function(riskInProcessKey) {
                $state.go('app.viewAlignRiskToProcess', {
                    from: 'editProcess',
                    processId: $stateParams.processId,
                    riskInProcessKey: riskInProcessKey
                });
            };
            $scope.editAlignCtrlToRisk = function(controlKey, controlInProcessKey) {
                $state.go('app.alignCtrlToProcess', {
                    from: 'editProcess',
                    processId: $scope.processDTO.processKey,
                    controlInProcessKey: controlInProcessKey,
                    controlId: controlKey
                });
            };
            $scope.viewAlignCtrlToRisk = function(controlKey, controlInProcessKey) {
                $state.go('app.viewAlignCtrlToProcess', {
                    from: 'editProcess',
                    processId: $scope.processDTO.processKey,
                    controlInProcessKey: controlInProcessKey,
                    controlId: controlKey
                });
            };

            $scope.successMessage = function(mesg) {
                setConfirmationWinButtons(true, true, true);
                $scope.messageText = mesg;
                $scope.confirmationWin.open().center();
                $scope.okCallback = successCallBack;
            };

            $scope.handleCancel = function() {
                if ($scope.createProcessFormName.$dirty && !$scope.prcLockDownFlag) {
                    $scope.messageText = $rootScope.alertMessages['common.cancelConfirmMessage'];
                    $scope.confirmationWin.open().center();
                    $scope.yesCallback = $scope.clear;
                } else {
                    $scope.clear();
                }
            };
            $scope.entityClosure = function($event) {
                if ($event.keyCode === 27) {
                    $scope.nonPersistentProcess.legalEntityTreeViewStyle = {
                        display: 'none'
                    };
                }
            };

            $scope.unAlignRiskWithinProcess = function(riskInProcessKey) {
                var that = this;
                setConfirmationWinButtons(false, false, false);
                $scope.messageText = $rootScope.alertMessages['unAlignRiskToProcess.confirmMessage'];
                $scope.confirmationWin.open().center();
                $scope.yesCallback = function() {
                    unAlignRiskWithinProcessCallback(riskInProcessKey, that);
                };
            };

            $rootScope.$on('refreshRatingGrid', function() {
                processRatingGridConfig.processRatingGrid.dataSource.read();
            });

            $scope.deAlignCtrls = function(controlInPrcsKey, riskInProcessKey) {
                setConfirmationWinButtons(false, false, false);
                $scope.messageText = $rootScope.alertMessages['deAlignCtrl.confirmMessage'];
                $scope.confirmationWin.open().center();
                $scope.dealignCtrlPrcsKey = controlInPrcsKey;
                $scope.dealignRskPrcsKey = riskInProcessKey;
                $scope.yesCallback = $scope.unalignCtrl;
            };

            $scope.unalignCtrl = function() {
                $scope.confirmationWin.close();
                // TODO: this needs to go into a factory
                $http.get('app/control/rest/disassociateControlInProcess/' + $scope.dealignCtrlPrcsKey + '/' + $scope.dealignRskPrcsKey).success(function() {
                    $scope.statusClass = 'userSuccessInfo';
                    $scope.alignInfo = $rootScope.alertMessages['unAlignCtrl.success'];
                    $scope.postdeAlignCtrlRefresh();
                }, function(error) {
                    $scope.statusClass = 'status invalid userErrorInfo';
                    var errorMessage = error.data.errorMsg;
                    if (error.data.techErrorMsg) {
                        errorMessage = error.data.techErrorMsg;
                    }
                    $scope.statusInfo = errorMessage;
                });
            };

            $scope.postdeAlignCtrlRefresh = function() {
                $scope.dealignCtrlPrcsKey = '';
                $scope.dealignRskPrcsKey = '';
                alignedRisksHeaderPallette.alignedRisksGrid.dataSource.read();
                $scope.selectedAlignRisksFlag = true;
                alignedCtrlsHeaderPallette.alignedCtrlsGrid.dataSource.read();
                $scope.alignedControlsToProcess = new Date().getTime();
                processRatingGridConfig.processRatingGrid.dataSource.read();
                $scope.selectedProcessRating = new Date().getTime();
                ihtRskRatingGridConfig.ihtRskRatingGrid.dataSource.read();
                $scope.selectedIRR = new Date().getTime();
                setInterval(function() {
                    $scope.alignInfo = '';
                }, 1000);
            };

            $scope.updateCtlInPrcsCheckedRecord = function(obj) {
                $scope.controlInPrcsSelectedArray[obj.controlKey] = obj;
                var checkedControl = $scope.controlInPrcsSelected;
                if(checkedControl){
                    
                    var flag = true;
                     $.each(checkedControl, function(key, value) {
                            if (value) {
                                
                                flag = false;
                            }
                        });
                     $scope.selectedFlagControlInProcess = flag;
                     
                }
                
            };
            $scope.updateCtlInPrcsNoAlignCheckedRecord = function(obj) {
                $scope.controlInPrcsNoAlignSelectedArray[obj.controlKey] = obj;
                var checkedControl = $scope.controlInPrcsNoAlignSelected;
                if(checkedControl){
                    var flag = true;
                     $.each(checkedControl, function(key, value) {
                            if (value) {
                                
                                flag = false;
                            }
                        });
                     $scope.selectedFlagControlInProcess = flag;
                     
                }
            };
            $scope.updateRiskInPrcsCheckedRecord = function(obj) {
                $scope.riskInPrcsSelectedArray[obj.rskKy] = obj;
                var checkedRisks = $scope.riskInPrcsSelected;
                
                if(checkedRisks){
                    
                    var flag = true;
                     $.each(checkedRisks, function(key, value) {
                            if (value) {
                                
                                flag = false;
                            }
                        });
                     $scope.selectedFlagRiskInProcess = flag;
                     
                }
            };

            $scope.submit = function() {
                if ($scope.editMode && checkLegalOrGeolocationsChanged()) {
                    processService.getRisksAndCtrlsAlignToProcess().then(function(data) {
                        if (data.data.hasRisks && data.data.hasControls) {
                            $scope.messageText = $rootScope.alertMessages['processEpcf.confirmMessage'] + ' ' + $rootScope.alertMessages['common.confirmMessage'];
                        } else if (data.data.hasRisks) {
                            $scope.messageText = $rootScope.alertMessages['processEpcf.riskConfirmMessage'] + ' ' + $rootScope.alertMessages['common.confirmMessage'];
                        } else if (data.data.hasControls) {
                            $scope.messageText = $rootScope.alertMessages['processEpcf.ctrlConfirmMessage'] + ' ' + $rootScope.alertMessages['common.confirmMessage'];
                        }
                    }, function(error) {
                        $scope.statusClass = 'status invalid userErrorInfo';
                        var errorMessage = error.data.errorMsg;
                        if (error.data.techErrorMsg) {
                            errorMessage = error.data.techErrorMsg;
                        }
                        $scope.statusInfo = errorMessage;
                    });
                } else {
                    $scope.messageText = $rootScope.alertMessages['common.confirmMessage'];
                }
                // uid, index added to all ng-model making null before save
                $scope.yesCallback = create;
                $scope.confirmationWin.open().center();
            };

            var checkLegalOrGeolocationsChanged = function() {
                return checkLegalEntityChanged() || checkGeoLocationChanged();
            };
            var checkLegalEntityChanged = function() {
                var existedLegalEntityKeys = [];
                var currentLegalentityKeys = [];
                var legalChanged = false;
                $scope.nonPersistentProcess.legalEnty.forEach(function(obj) {
                    currentLegalentityKeys.push(obj.id);
                });
                if (existingProcess && existingProcess.data && existingProcess.data.legalEntitiesKeyList) {
                    existingProcess.data.legalEntitiesKeyList.forEach(function(obj) {
                        existedLegalEntityKeys.push(obj.id);
                    });
                }
                if (existedLegalEntityKeys.length !== currentLegalentityKeys.length) {
                    legalChanged = true;
                }
                return legalChanged || processFactory.checkTwoArrysMatched(existedLegalEntityKeys, currentLegalentityKeys);
            };
            var checkGeoLocationChanged = function() {
                var existedGeoLocationKeys = [];
                var currentGeoLocationKeys = [];
                var geoChanged = false;
                $scope.nonPersistentProcess.geoLocations.forEach(function(obj) {
                    currentGeoLocationKeys.push(obj.id);
                });
                if (existingProcess && existingProcess.data && existingProcess.data.geoLocationsKeyList) {
                    existingProcess.data.geoLocationsKeyList.forEach(function(obj) {
                        existedGeoLocationKeys.push(obj.id);
                    });
                }
                if (existedGeoLocationKeys.length !== currentGeoLocationKeys.length) {
                    geoChanged = true;
                }
                return geoChanged || processFactory.checkTwoArrysMatched(existedGeoLocationKeys, currentGeoLocationKeys);
            };
            init();

            $scope.riskAssessmentDTO = {
                firstName: '',
                lastName: '',
                emailId: '',
                nbkId: ''
            };
            $scope.clearSearchModal = function() {
                $scope.showmsgGrid = false;
                $scope.showSearchGrid = false;
            };

            $scope.clearSearchModalData = function() {
                $scope.riskAssessmentDTO.firstName = '';
                $scope.riskAssessmentDTO.lastName = '';
                $scope.riskAssessmentDTO.emailId = '';
                $scope.riskAssessmentDTO.nbkId = '';
            };

            $scope.openPrcsOwner = function() {
                $scope.clearSearchModal();
                $scope.clearSearchModalData();
                this.prcsOwnerModal.open().center();
            };
            $scope.ownerSearchResultGrid = rcsaAssessmentService.getProcessOwnerSearchGrid();

            $scope.searchOwner = function() {
                $scope.clearSearchModal();
                $scope.searchresult = '';
                $scope.ownerSearchResultGrid.dataSource = rcsaAssessmentService.getOwnerSearchGridDataSource($scope.riskAssessmentDTO.firstName, $scope.riskAssessmentDTO.lastName, $scope.riskAssessmentDTO.emailId, $scope.riskAssessmentDTO.nbkId);
                $scope.getOwnerSearchResultGrid = new Date().getTime();
                $scope.showSearchGrid = true;
            };
            $scope.selectedProcessOwner = function(selectedOwner, workerKey) {
                // alert(selectedOwner+' '+workerKey);
                $scope.prcsOwnerModal.close();
                $scope.processDTO.processOwnerWorkerKey = workerKey;
                $scope.processDTO.prcsOwner = selectedOwner;
            };

            $scope.nonPersistentProcess.riskKey = 0;
            // $scope.processDTO.processKey = 0;
            // TODO: this is a terrible use of $rootScope. All alert messages should be stored in an angular value, not
            // a properties file with an endpoint. This needs to be fixed immediately.
            $scope.messageText = $rootScope.alertMessages['common.confirmMessage'];
            $scope.validationMessage = $rootScope.alertMessages['common.validationMessage'];
            $scope.disableRiskRatingBtn = false;
            $scope.disabled = '';
            $scope.stateParams = $stateParams;
            // These should execute exactly one time only when the page loads.
            $scope.$on('$viewContentLoaded', function() {
                if ($scope.editMode) {
                    var disableProcessRatingService = false;
                    $scope.ihtRskRatingGridOptions = ihtRskRatingGridConfig.ihtRskRatingGrid;
                    // Process Rating Grid Data
                    $scope.processRatingGridOptions = processRatingGridConfig.processRatingGrid;
                    $scope.loadProcessRating = function(close) {
                        if (!close && !disableProcessRatingService) {
                            ihtRskRatingGridConfig.ihtRskRatingGrid.dataSource = resetData2();
                            $scope.selectedIRR = new Date().getTime();

                            processRatingGridConfig.processRatingGrid.dataSource = resetDataPrt();
                            $scope.selectedProcessRating = new Date().getTime();

                            if (ihtRskRatingGridConfig.ihtRskRatingGrid.dataSource) {
                                disableProcessRatingService = true;
                            }
                        }
                    };
                    $scope.PrtWinOptions = processRatingGridConfig.PrtmodalWinConfig;
                    processRatingGridConfig.PrtmodalWinConfig.title = 'Process Rating:' + $scope.processDTO.processLongName;
                    // Edit Process Rating modal
                    $scope.editProcessRtng = function(id, editvalue) {
                        $scope.selectedId = id;
                        OrcitLoader.load(Rating.findProcessRating(id.processRatingKey)).then(function(response) {
                            $scope.processRating = response.data;
                            $scope.processRating.edit = editvalue;
                            $scope.$broadcast('editProcessRating', $scope.processRating);
                        }, function(error) {
                            $scope.statusClass = 'status invalid userErrorInfo';
                            var errorMessage = error.data.errorMsg;
                            if (error.data.techErrorMsg) {
                                errorMessage = error.data.techErrorMsg;
                            }
                            $scope.statusInfo = errorMessage;
                        });
                    };
                    $scope.controlInPrcsSelected = {};
                    $scope.controlInPrcsNoAlignSelected = {};
                    $scope.controlInPrcsSelectedArray = {};
                    $scope.controlInPrcsNoAlignSelectedArray = {};
                    $scope.selected = [5654];
                    $scope.nonPersistentProcess.showCriteria = 'disassign';
                    // controls aligned to process
                    $scope.alignedCtrls = alignedCtrlsHeaderPallette.alignedCtrlsGrid;
                    // risks aligned to process
                    $scope.alignedRisksGridOptions = alignedRisksHeaderPallette.alignedRisksGrid;
                    $scope.controlRiskInnerOptions = riskToControlGridDataService.getAlignedControlToRisksGrid;

                    $scope.loadRisksAndControls = function(close) {
                        $scope.selectedAlignRisksFlag = false;
                        if (!close) {
                            alignedRisksHeaderPallette.alignedRisksGrid.dataSource = alignExstRskDataService.getAlignedRiskDataSource($stateParams.processId);
                            $scope.selectedAlignRisks = new Date().getTime();
                            $scope.selectedAlignRisksFlag = true;

                            alignedCtrlsHeaderPallette.alignedCtrlsGrid.dataSource = riskToControlGridDataService.getControlsInProcessForPrcsKyGridDataSource($stateParams.processId);
                            $scope.alignedControlsToProcess = new Date().getTime();
                        }
                    };
                }
            });

            // set treeoptions for multiselect
            $scope.geoLocationTreeData = $rootScope.geoLocationTree;
            $scope.legalEntityTreeData = $rootScope.legalTree;
            $scope.epcfTreeData = $rootScope.epcfTree;
            $scope.enterpriseReportingHierarchyTreeData = $rootScope.processErhTree;
            $scope.enterpriseReportingHierarchyFullTreeData = $rootScope.erhFullTree;

            $scope.challengesDTO = {};
            $scope.challengeProcessWinOptions = processChallengesGridConfig.challengeModalWinConfig;
            $scope.addProcessChallenge = function() {
                $state.go('app.addPrcChallenge', {
                    processId: $stateParams.processId
                });
            };

            $scope.$on('refreshPrcsChallengeGrid', function() {
                if ($scope.processChallengesOptions.dataSource) {
                    $scope.processChallengesOptions.dataSource.read();
                }
            });
            $scope.processChallengesOptions = processChallengesGridConfig.getProcessChallengesGrid;
            $scope.generateAccordionData = function(status, accordionEntity) {
                if (!status && accordionEntity === 'challenges') {
                    if (!disableChallengesService) {
                        $scope.processChallengesOptions.dataSource = processService.getPrcChallengesGridDataSource($stateParams.processId);
                        $scope.challengesRebind = new Date().getTime();
                        if ($scope.processChallengesOptions.dataSource) {
                            disableChallengesService = true;
                        }
                    }
                }
            };

            $scope.editPrcChallenge = function(challengeKey) {
                $scope.$broadcast('editPrcChallenge', challengeKey);
                $state.go('app.editPrcChallenge', {
                    processId: $stateParams.processId,
                    challengeKey: challengeKey
                });
            };

            $scope.viewPrcsChallenge = function(challengeKey) {
                $state.go('app.viewPrcChallenge', {
                    processId: $stateParams.processId,
                    challengeKey: challengeKey
                });
            };

            $scope.deleteChallenges = function(key) {
                setConfirmationWinButtons(false, false, false);
                $scope.messageText = $rootScope.alertMessages['delRcsaChallenge.confirmMessage'];
                $scope.confirmationWin.open().center();
                $scope.yesCallback = function() {
                    deleteRcsaChallengesCallback(key);
                };
            };
            var deleteRcsaChallengesCallback = function(key) {
                processFactory.deleteProcessChallenge(key.processChallengeKey).then(function() {
                    $scope.confirmationWin.close();
                    $scope.challengeStatusInfo = $rootScope.alertMessages['delRcsaChallenge.success'];
                    $scope.challengeStatusClass = 'userSuccessInfo';
                    setInterval(function() {
                        $scope.challengeStatusInfo = '';
                    }, 1000);
                    challengeCallBack();
                }, function(error) {
                    $scope.challengeStatusClass = 'status invalid userErrorInfo';
                    var errorMessage = error.data.errorMsg;
                    if (error.data.techErrorMsg) {
                        errorMessage = error.data.techErrorMsg;
                    }
                    $scope.challengeStatusInfo = errorMessage;
                });
            };
            var challengeCallBack = function() {
                if ($scope.processChallengesOptions.dataSource) {
                    $scope.processChallengesOptions.dataSource.read();
                }
            };
            $scope.epcfTreeModalOptions = processTreeConfig.epcfTreeModalWinConfig;
            $scope.openEpcfTreeModel = function() {
                //onOpen retain previous value using processDTO
                //prcGvrnDTO.prcGvrnAprvKy to check whether pending approval or not
                if($scope.processDTO.requestedEpcfKey && !$scope.prcGvrnDTO.prcGvrnAprvKy){
                    $scope.nonPersistentProcess.requestedEpcfKey = [{
                        id:$scope.processDTO.requestedEpcfKey,
                        text:$scope.processDTO.epcfText.replace('Pending approval - ','')
                    }];
                }
                if ($scope.processDTO.processLongName) {
                    processTreeConfig.epcfTreeModalWinConfig.title = 'EPCF Alignment Request for Process ' + $scope.processDTO.processLongName;
                } else {
                    processTreeConfig.epcfTreeModalWinConfig.title = 'EPCF Alignment Request for Process ';
                }
                $scope.epcfTreeModalWin.setOptions(processTreeConfig.epcfTreeModalWinConfig);
                $scope.$broadcast('epcfTreeModal');
            };
            $scope.$on('epcfTreeModal', function() {
                $scope.epcfTreeModalWin.open().center();
                $scope.epcfTreeModalWin.wrapper.find('.k-window-action').css('visibility', 'hidden');
            });
            $scope.submitEpcf = function() {
                $scope.epcfTreeModalWin.close();
                $scope.processDTO.epcfText = 'Pending approval - ' + $scope.nonPersistentProcess.requestedEpcfKey[0].text;
                $scope.processDTO.requestedEpcfKey = $scope.nonPersistentProcess.requestedEpcfKey[0].id;
                $scope.processDTO.epcfDescription = $scope.epcfObj.epcfDescription;
                $scope.processDTO.epcfToolTip = $scope.epcfObj.epcfToolTip;
            };
            $scope.cancelEpcf = function() {
                $scope.epcfTreeModalWin.close();
                if($scope.nonPersistentProcess.requestedEpcfKey && $scope.nonPersistentProcess.requestedEpcfKey.length){
                    //cancel selected without previous selection
                    if(!$scope.processDTO.requestedEpcfKey){
                        $scope.nonPersistentProcess.requestedEpcfKey = [];
                        $scope.processDTO.requestedEpcfComment='';
                    }else if($scope.processDTO.requestedEpcfKey !== $scope.nonPersistentProcess.requestedEpcfKey[0].id){
                        //cancel selected with previous selection and retain previous value
                        $scope.nonPersistentProcess.requestedEpcfKey = [{
                            id:$scope.processDTO.requestedEpcfKey,
                            text:$scope.processDTO.epcfText.replace('Pending approval - ','')
                        }];
                    }
                }
                //on cancel nullify decision check box and comments
                $scope.prcGvrnDTO.requestDecisionLookupCode = false;
                $scope.prcGvrnDTO.decisionCommentText = '';
            };
            $scope.cancelProcessGovernance = function() {
                $scope.prcGvrnDTO.requestDecisionLookupCode = 'RA_GVRNC_DECSN_CANCL';
                console.log($scope.prcGvrnDTO);
                OrcitLoader.load(RiskHomePageService.saveProcessGovernance($scope.prcGvrnDTO)).then(function() {
                    $scope.epcfTreeModalWin.close();
                    $location.path('/process/' + $scope.processDTO.processKey + '/' + new Date().getTime()).search({
                        from: 'create'
                    });
                }, function(error) {
                    $scope.statusClass = 'status invalid userErrorInfo';
                    var errorMessage = error.data.errorMsg;
                    if (error.data.techErrorMsg) {
                        errorMessage = error.data.techErrorMsg;
                    }
                    $scope.statusInfo = errorMessage;
                });
            };
        });
