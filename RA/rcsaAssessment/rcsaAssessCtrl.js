angular
		.module('riskAssessmentApp')
		.controller(
				'rcsaAssessmentCtrl',
				function($scope, $rootScope, OrcitLoader, $stateParams, $http, alert,ConfirmationConfig,
						kendoCustomDataSource, processFactory, geoLocationData,$location,
						processData, legalEntityData, rcsaAssessmentService,rcsaAssessmentFactory,
						cycleData,assessmentOptions,$state) {
					'use strict';
				    $scope.confirmRatingWinOptions = ConfirmationConfig.confirmationWinConfig;
					$scope.validationMessage = '';
					$scope.validationClass = 'valid';
					$scope.nameSearchwin = false;
					$scope.showSearchGrid = false;
					$scope.showmsgGrid = false;
					$scope.searchresult = '';
					$scope.dueDate = '';
					$scope.showLegalDropdown = false;
					$scope.showGeoDropdown = false;
					$scope.showBusDropdown = false;
					$scope.showRefineERH = false;
					$scope.selectedGeoLocations = '';
					$scope.disableLegalEntity = false;
					$scope.editMode = false;
					$scope.refinedERHList = '';
					$scope.editAsmt = false;
					var selectedGeoText='';
					var initWatchCount = 0;
					var watchThreshold = 0;
					var initName ='';
					$scope.statusInfo = ''; 
					$scope.statusClass = '';
                    $scope.resultModalOption = processFactory
					.getTreeviewOptions();
					$scope.geoTreeviewOption = geoLocationData.data;
					$scope.legalTreeviewOption = legalEntityData.data;
					$scope.erhTreeviewOption  = processData.data;
					$scope.refinedErhOption = processData.data;
					// jshint maxdepth:8
					var setWatch = function(prop) {
						$scope
								.$watch(
										function() {
											return $scope.riskAssessmentDTO[prop].length;
										},
										function(newVal) {
											watchThreshold++;
											if(watchThreshold > initWatchCount){
											if (newVal) {
												$scope.addAssessment[prop]
														.$setDirty();
												$scope.addAssessment[prop]
														.$setValidity(
																'required',
																true);
												if (prop === 'geoLocationLst') {
													$scope.riskAssessmentDTO.assessmentName = '';
													if($scope.riskAssessmentDTO.erhFlag === 'Y'){
													$scope.refinedERHList='';
													}
													for (var i = 0; i < $scope.riskAssessmentDTO.geoLocationLst.length; i++) {
														if (i !== 0) {
															$scope.riskAssessmentDTO.assessmentName = $scope.riskAssessmentDTO.assessmentName +
																	 '_'+
																	 $scope.riskAssessmentDTO.geoLocationLst[i].text;
														} else {
															$scope.riskAssessmentDTO.assessmentName = $scope.riskAssessmentDTO.geoLocationLst[i].text;
														}
													}
													$scope.selectedGeoLocations = $scope.riskAssessmentDTO.assessmentName;
													if($scope.refinedERHList.charAt(0)==='_'){
														$scope.riskAssessmentDTO.assessmentName = $scope.selectedGeoLocations +
														 $scope.refinedERHList;
													}
													else if($scope.refinedERHList){
														$scope.riskAssessmentDTO.assessmentName = $scope.selectedGeoLocations +'_'+
														 $scope.refinedERHList;
													}else{
														$scope.riskAssessmentDTO.assessmentName = $scope.selectedGeoLocations +
														 $scope.refinedERHList;
													}

												}
												if (prop === 'legalEntity') {
													$scope.riskAssessmentDTO.assessmentName = '';
													$scope.refinedERHList='';
													var filteredLstRec = '';
													if($scope.riskAssessmentDTO.filteredErhList.length >0 && $scope.riskAssessmentDTO.erhFlag === 'N'){
													for (var m = 0; m < $scope.riskAssessmentDTO.filteredErhList.length; m++) {

														filteredLstRec = filteredLstRec +
																'_' +
															    $scope.riskAssessmentDTO.filteredErhList[m].text;
													}
													}
													if($scope.riskAssessmentDTO.legalEntity.length>0){
													$scope.refinedERHList =filteredLstRec.replace('_', '');
													}else{
														$scope.refinedERHList =filteredLstRec;

													}
													if($scope.refinedERHList){
													$scope.riskAssessmentDTO.assessmentName = $scope.riskAssessmentDTO.legalEntity[0].text+'_'+
													$scope.refinedERHList;
													}else{
														$scope.riskAssessmentDTO.assessmentName = $scope.riskAssessmentDTO.legalEntity[0].text;
													}
												}
												if (prop === 'erhList') {

													$scope.riskAssessmentDTO.assessmentName = '';
													for ( var k = 0; k < $scope.riskAssessmentDTO.erhList.length; k++) {
														if (k !== 0) {
															$scope.riskAssessmentDTO.assessmentName = $scope.riskAssessmentDTO.assessmentName +
																	 '_' +
																	 $scope.riskAssessmentDTO.erhList[k].text;
														} else  {
															$scope.riskAssessmentDTO.assessmentName = $scope.riskAssessmentDTO.erhList[k].text;
														}
													}
												}
												if (prop === 'filteredErhList') {
													var filteredList = '';
													for (var j = 0; j < $scope.riskAssessmentDTO.filteredErhList.length; j++) {

														filteredList = filteredList +
																'_' +
															    $scope.riskAssessmentDTO.filteredErhList[j].text;

													}
													if ($scope.riskAssessmentDTO.scopeType === 'RA_GEO_LOCAT') {

															$scope.refinedERHList = filteredList;

															if($scope.riskAssessmentDTO.geoLocationLst.length===0){


														$scope.riskAssessmentDTO.assessmentName =  filteredList.replace('_','');
															}
															else{
																var selGeo ='';

																for (var l = 0; l < $scope.riskAssessmentDTO.geoLocationLst.length; l++) {
																	selGeo =selGeo+ $scope.riskAssessmentDTO.geoLocationLst[l].text+'_';
																}

																$scope.selectedGeoLocations =selGeo.substring(0,selGeo.length-1);


																$scope.riskAssessmentDTO.assessmentName = $scope.selectedGeoLocations +
																 filteredList;

															}
													} else if($scope.riskAssessmentDTO.scopeType === 'RA_LEGAL_ENTITY'){
                                                        if($scope.riskAssessmentDTO.legalEntity.length>0){
														$scope.riskAssessmentDTO.assessmentName = $scope.riskAssessmentDTO.legalEntity[0].text +
														filteredList;
														}else{
															$scope.riskAssessmentDTO.assessmentName = filteredList.replace('_','');

														}
													}else {
														$scope.riskAssessmentDTO.assessmentName = filteredList
																.replace('_',
																		'');
													}

												}
											} else {

												$scope.addAssessment[prop]
														.$setValidity(
																'required',
																false);
												if (prop === 'geoLocationLst' || prop === 'legalEntity') {
													$scope.riskAssessmentDTO.assessmentName = '';
													$scope.selectedGeoLocations ='';

													if($scope.riskAssessmentDTO.erhFlag === 'Y'){
													$scope.refinedERHList='';
													}

													var filteredListRec = '';
													if($scope.riskAssessmentDTO.filteredErhList.length >0 && $scope.riskAssessmentDTO.erhFlag === 'N'){
													for (var n = 0; n < $scope.riskAssessmentDTO.filteredErhList.length; n++) {

														filteredListRec = filteredListRec +
																'_' +
															    $scope.riskAssessmentDTO.filteredErhList[n].text;
													}
													}

													$scope.refinedERHList =filteredListRec.replace('_', '');

													$scope.riskAssessmentDTO.assessmentName = $scope.refinedERHList;
	                                               }else if (prop === 'filteredErhList') {
													$scope.refinedERHList = '';
													if ($scope.riskAssessmentDTO.scopeType === 'RA_GEO_LOCAT' && $scope.riskAssessmentDTO.geoLocationLst.length > 0) {

														selectedGeoText='';

														for(var a = 0; a < $scope.riskAssessmentDTO.geoLocationLst.length ;a++ ){

															selectedGeoText = selectedGeoText + $scope.riskAssessmentDTO.geoLocationLst[a].text + '_';

														}
														$scope.riskAssessmentDTO.assessmentName = selectedGeoText.substring(0,selectedGeoText.length-1);

													} else if($scope.riskAssessmentDTO.scopeType === 'RA_LEGAL_ENTITY' && $scope.riskAssessmentDTO.legalEntity[0]){
														$scope.riskAssessmentDTO.assessmentName = $scope.riskAssessmentDTO.legalEntity[0].text;
													}else {
														$scope.riskAssessmentDTO.assessmentName = '';

													}
												}else {
													$scope.riskAssessmentDTO.assessmentName = '';

												}
											}
										}else{

											$scope.riskAssessmentDTO.assessmentName = initName;
										}
										});
					};


					var setRolesPanel = function () {
				    	rcsaAssessmentFactory.getAttestorRoles().then(function(response){
				            $scope.attestorAvailablRoles= response.data.assessmentRoleTypeDTOs;
				            $scope.attestorSelectedRoles=[];
				    	}, function (error) {
				        	$scope.statusClass ='status invalid userErrorInfo';
				        	var errorMessage = error.data.errorMsg;
				            if (error.data.techErrorMsg) {
				                errorMessage = error.data.techErrorMsg;
				            }
				        	$scope.statusInfo = errorMessage;
				         });
				    };
				    if(!$stateParams.assessmentId){
				    setRolesPanel();
				    }

					$scope.init = function() {
						kendoCustomDataSource.getAnguDropdownData('RA_CYCLE_SCOP_TYP').then(function(response){
							$scope.assessmentTypeOptions = [];
							$.each(response.data, function (index, scopeType) {
								if(scopeType.id === 'RA_BUS_UNIT' && processData.data.length){
									$scope.assessmentTypeOptions.push(scopeType);
								}
								if(scopeType.id === 'RA_GEO_LOCAT' && geoLocationData.data.length){
									$scope.assessmentTypeOptions.push(scopeType);
								}
								if(scopeType.id === 'RA_LEGAL_ENTITY' && legalEntityData.data.length){
									$scope.assessmentTypeOptions.push(scopeType);
								}
							});
				    	});
						$scope.assessmentOptions = assessmentOptions;
						//this will be overridden on edit mode
						$scope.riskAssessmentDTO = {
								geoLocationLst : [],
								legalEntity : [],
								erhList : [],
								filteredErhList : [],
								cycleName : cycleData.data.longName,
								dueDate : cycleData.data.assessmentDueDate,
								riskAssessmentCycleKey : cycleData.data.rskAsesCycleKey,
								availableRolesKey: [],
								selectedRolesKey: [],
								erhFlag: 'Y',
								assessmentName: '',
								scopeType: '',
								rcsaOwnerWorker: '',
								rcsaPreparerWorker: '',
								editAssessOwnerRcsaFlag:'',
								assessmentNameToEdit:''
							};
					};
					$scope.assessmentData = {
							geoLocationLst : [],
							legalEntity : [],
							erhList : [],
							filteredErhList : [],
							availableRolesKey: [],
							selectedRolesKey: [],
							erhFlag: 'Y',
							assessmentName: '',
							scopeType: '',
							rcsaOwnerWorker: '',
							rcsaPreparerWorker: '',
							editAssessOwnerRcsaFlag:'',
							rcsaOwnerWorkerKey: '',
							rcsaPreparerWorkerKey: '',
							retroScope: '',
			            	retroList : []
						};
					$scope.init();
					$scope.editAssessmentData = function(){
						return $http.get('app/assessment/rest/editassessment?riskAssessmentKey='+$stateParams.assessmentId);
					};
					if($stateParams.assessmentId){
						$scope.editAsmt= true;
						$scope.disableViewAssessmentview = false;
						OrcitLoader.load($scope.editAssessmentData()).then(function(response){
							$scope.assessmentData= response;
							if($scope.assessmentData.data.filteredErhList){
							initWatchCount = initWatchCount +2+ $scope.assessmentData.data.filteredErhList.length;
							$scope.riskAssessmentDTO.erhFlag='N';
							$scope.showRefineERH = true;
							$scope.riskAssessmentDTO.filteredErhList = $scope.assessmentData.data.filteredErhList;
							}
							$scope.riskAssessmentDTO.assessmentName = $scope.assessmentData.data.assessmentName;
							initName = $scope.assessmentData.data.assessmentName;
							$scope.riskAssessmentDTO.dueDate=$scope.assessmentData.data.dueDate;
							$scope.riskAssessmentDTO.scopeType = $scope.assessmentData.data.scopeType;
							$scope.riskAssessmentDTO.scopeTypeName = $scope.assessmentData.data.scopeTypeName;
							$scope.riskAssessmentDTO.retroScope = $scope.assessmentData.data.scopeType;
							$scope.riskAssessmentDTO.rcsaOwnerWorker = $scope.assessmentData.data.rcsaOwnerWorker;
							$scope.riskAssessmentDTO.rcsaPreparerWorker = $scope.assessmentData.data.rcsaPreparerWorker;
							$scope.riskAssessmentDTO.editAssessOwnerRcsaFlag = $scope.assessmentData.data.editAssessOwnerRcsaFlag;
							$scope.riskAssessmentDTO.rcsaOwnerWorkerKey = $scope.assessmentData.data.rcsaOwnerWorkerKey;
							$scope.riskAssessmentDTO.rcsaPreparerWorkerKey = $scope.assessmentData.data.rcsaPreparerWorkerKey;
							$scope.riskAssessmentDTO.assessmentNameToEdit = $scope.assessmentData.data.assessmentNameToEdit;
							$scope.riskAssessmentDTO.riskAssesLevelLookupCode = $scope.assessmentData.data.riskAssesLevelLookupCode;


							if($scope.riskAssessmentDTO.scopeType === 'RA_GEO_LOCAT'){
								$scope.showGeoDropdown = true;
								$scope.disableAssessmentType = true;
								$scope.riskAssessmentDTO.geoLocationLst = $scope.assessmentData.data.geoLocationLst;
								$scope.riskAssessmentDTO.retroList = $scope.assessmentData.data.geoLocationLst;
								initWatchCount = initWatchCount+2 + $scope.assessmentData.data.geoLocationLst.length;
								setWatch('geoLocationLst');
								if($scope.riskAssessmentDTO.erhFlag ==='N'){
									setWatch('filteredErhList');

								}
							}else if($scope.riskAssessmentDTO.scopeType === 'RA_LEGAL_ENTITY'){
								$scope.showLegalDropdown = true;
								$scope.disableAssessmentType = true;
								$scope.riskAssessmentDTO.legalEntity = $scope.assessmentData.data.legalEntity;
								$scope.riskAssessmentDTO.retroList = $scope.assessmentData.data.legalEntity;
								initWatchCount = initWatchCount+2 + $scope.assessmentData.data.legalEntity.length;
								setWatch('legalEntity');
								if($scope.riskAssessmentDTO.erhFlag ==='N'){
									setWatch('filteredErhList');
								}

							}else if($scope.riskAssessmentDTO.scopeType === 'RA_BUS_UNIT'){
								$scope.showBusDropdown =true;
								$scope.disableAssessmentType = false;
								$scope.riskAssessmentDTO.erhList = $scope.assessmentData.data.erhList;
								$scope.riskAssessmentDTO.retroList = $scope.assessmentData.data.erhList;
								initWatchCount = initWatchCount +2+ $scope.assessmentData.data.erhList.length;
								setWatch('erhList');
							}

							  	$scope.attestorAvailablRoles = $scope.assessmentData.data.availableRolesKey;
					            $scope.attestorSelectedRoles = $scope.assessmentData.data.selectedRolesKey;
					          //set context and context value
					          rcsaAssessmentFactory.setContextAndValue($scope.riskAssessmentDTO, $scope);
						});
					}

					 $scope.$on('multiselectChange', function (s, data) {
					    	$scope.riskAssessmentDTO.selectedRolesKey=rcsaAssessmentFactory.selectedAssessmentRoles(data.data);
					    });
					$scope.assessmentType = function() {
						$scope.riskAssessmentDTO.assessmentName = '';
						$scope.riskAssessmentDTO.erhFlag = 'Y';

						$scope.showRefineERH = false;
						if ($scope.riskAssessmentDTO.scopeType === 'RA_GEO_LOCAT') {
							$scope.showLegalDropdown = false;
							$scope.showGeoDropdown = true;
							$scope.showBusDropdown = false;
							$scope.disableAssessmentType = true;
							$scope.riskAssessmentDTO.riskAssesLevelLookupCode = 'RA_ASES_LVL_SUMM';
							setWatch('geoLocationLst');
						} else if ($scope.riskAssessmentDTO.scopeType === 'RA_LEGAL_ENTITY') {
							$scope.showLegalDropdown = true;
							$scope.showGeoDropdown = false;
							$scope.showBusDropdown = false;
							$scope.disableAssessmentType = true;
							$scope.riskAssessmentDTO.riskAssesLevelLookupCode = 'RA_ASES_LVL_SUMM';
							setWatch('legalEntity');
						} else if ($scope.riskAssessmentDTO.scopeType === 'RA_BUS_UNIT') {
							$scope.showLegalDropdown = false;
							$scope.showGeoDropdown = false;
							$scope.showBusDropdown = true;
							$scope.disableAssessmentType = false;
							$scope.riskAssessmentDTO.riskAssesLevelLookupCode ='';
							setWatch('erhList');
						} else {
							$scope.showLegalDropdown = false;
							$scope.showGeoDropdown = false;
							$scope.showBusDropdown = false;
							$scope.showRefineERH = false;
						}
					};
					$scope.mandateAllERH = function() {
						if ($scope.riskAssessmentDTO.erhFlag === 'N') {
							$scope.showRefineERH = true;
							setWatch('filteredErhList');
							if ($scope.riskAssessmentDTO.scopeType === 'RA_GEO_LOCAT') {
								setWatch('geoLocationLst');
							} else if ($scope.riskAssessmentDTO.scopeType === 'RA_LEGAL_ENTITY') {
								setWatch('legalEntity');
							} else if ($scope.riskAssessmentDTO.scopeType === 'RA_BUS_UNIT') {
								setWatch('erhList');
							}
						} else {
							$scope.showRefineERH = false;
							if ($scope.riskAssessmentDTO.scopeType === 'RA_GEO_LOCAT') {
								setWatch('geoLocationLst');
							} else if ($scope.riskAssessmentDTO.scopeType === 'RA_LEGAL_ENTITY') {
								setWatch('legalEntity');
							} else if ($scope.riskAssessmentDTO.scopeType === 'RA_BUS_UNIT') {
								setWatch('erhList');
							}
						}
					};

					$scope.openRcsaOwner = function() {
						$scope.clearSearchModal();
						$scope.clearSearchModalData();
						this.rcsaOwnerModal.open().center();
					};
					$scope.openRcsaPreparer = function() {
						$scope.clearSearchModal();
						$scope.clearSearchModalData();
						this.rcsaPreparerModal.open().center();
					};
					$scope.ownerSearchResultGrid = rcsaAssessmentService
							.getOwnerSearchGrid();
					$scope.preparerSearchResultGrid = rcsaAssessmentService
							.getPreparerSearchGrid();
					$scope.searchOwner = function() {
						$scope.clearSearchModal();
						$scope.searchresult = '';
						$scope.ownerSearchResultGrid.dataSource = rcsaAssessmentService
								.getOwnerSearchGridDataSource(
										$scope.riskAssessmentDTO.firstName,
										$scope.riskAssessmentDTO.lastName,
										$scope.riskAssessmentDTO.emailId,
										$scope.riskAssessmentDTO.nbkId);
						$scope.getOwnerSearchResultGrid = new Date().getTime();
						$scope.showSearchGrid = true;
					};

					$scope.searchPreparer = function() {
						$scope.clearSearchModal();
						$scope.searchresult = '';
						$scope.preparerSearchResultGrid.dataSource = rcsaAssessmentService
								.getPreparerSearchGridDataSource(
										$scope.riskAssessmentDTO.firstName,
										$scope.riskAssessmentDTO.lastName,
										$scope.riskAssessmentDTO.emailId,
										$scope.riskAssessmentDTO.nbkId);
						$scope.getPreparerSearchResultGrid = new Date()
								.getTime();
						$scope.showSearchGrid = true;
					};
					$scope.selectedOwner = function(selectedOwner, workerKey) {
						this.$parent.$parent.rcsaOwnerModal.close();
						$scope.riskAssessmentDTO.rcsaOwnerWorkerKey = workerKey;
						$scope.riskAssessmentDTO.rcsaOwnerWorker = selectedOwner;
					};
					$scope.selectedPreparer = function(selectedPreparer,
							workerKey) {
						this.$parent.$parent.rcsaPreparerModal.close();
						$scope.riskAssessmentDTO.rcsaPreparerWorkerKey = workerKey;
						$scope.riskAssessmentDTO.rcsaPreparerWorker = selectedPreparer;

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

					$scope.handleCancel = function() {
						if($scope.addAssessment.$dirty){
						$scope.messageText = $rootScope.alertMessages['common.cancelConfirmMessage'];
				        $scope.confirmationWin.open().center();
				        $scope.yesCallback = cancelCallback;
						}
						else{
							cancelCallback();
						}
					};

					$scope.submit = function () {

						$scope.messageText = $rootScope.alertMessages['common.confirmMessage'];
				        $scope.confirmationWin.open().center();
				        $scope.yesCallback = create;
				    };

					var create = function () {
						$scope.closeConfirmation();
						$scope.riskAssessmentDTO.riskAssessmentKey = $stateParams.assessmentId;
						$scope.riskAssessmentDTO.availableRolesKey = rcsaAssessmentFactory.selectedAssessmentRoles($scope.attestorAvailablRoles);
						$scope.riskAssessmentDTO.selectedRolesKey = rcsaAssessmentFactory.selectedAssessmentRoles($scope.attestorSelectedRoles);


						if($scope.riskAssessmentDTO.erhFlag==='Y'){
							$scope.riskAssessmentDTO.filteredErhList=[];

						}
						if($stateParams.assessmentId){
							if($scope.riskAssessmentDTO.scopeType === $scope.riskAssessmentDTO.retroScope){
								$scope.riskAssessmentDTO.retroScope='';
								$scope.riskAssessmentDTO.retroList= [];



							}
						}
						OrcitLoader.load(rcsaAssessmentFactory.saveAssessment($scope.riskAssessmentDTO)).then(function (response) {
				            $scope.statusClass ='userSuccessInfo';
				            if($stateParams.assessmentId){
				            $scope.statusInfo = $rootScope.alertMessages['editRcsa.updateAssessment'];
				            }else{
				            $scope.statusInfo = response.data.responseMesg;
				        	}
				            $scope.saveAssessmentCallBack();
				        }, function (error) {
				            // failure
				        	$scope.statusClass ='status invalid userErrorInfo';
				        	var errorMessage = error.data.errorMsg;
				        	if(error.data.techErrorMsg){
				        		errorMessage = error.data.techErrorMsg;
				        	}
				        	$scope.statusInfo = errorMessage;
				        });

				    };
				    if ($state.current.name === 'app.viewAssessmentFromCycle') {
				      $scope.disableViewAssessmentview = true;
				      console.log('Test ',$scope.assessmentTypeOptions);
				    }

				    $scope.saveAssessmentCallBack = function () {
				        $location.path('/rcsa/editRcsaCycle/'+cycleData.data.rskAsesCycleKey + '/' + new Date().getTime());
				    };
				    $scope.closeConfirmation = function () {
				        $scope.confirmationWin.close();
				    };
				    var cancelCallback = function(){
				    	 $scope.confirmationWin.close();
				    	$location.path('/rcsa/editRcsaCycle/'+cycleData.data.rskAsesCycleKey + '/' + new Date().getTime());
				    };
				  //dates range validation method
			        $scope.validateDueDate = function(){
//			          var isValid =  Date.parse(cycleData.data.targetCycEndDate) <= Date.parse($scope.riskAssessmentDTO.dueDate) ;
//			          console.log(isValid);
//			          $scope.addAssessment[startField].$setValidity('dateRange',isValid);
//			          $scope.addAssessment.$setValidity('dateRange',isValid);

			        };
				});