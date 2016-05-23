angular
		.module('riskAssessmentApp')
		.factory(
				'rcsaAssessmentService',
				function(summaryRatingGrids,$http, $rootScope, datasetFactory, OrcitLoader, KENDO_GRID) {
					'use strict';
					
					var filterContainer={},pagesizes={};
					var filterDescriptions=[];
					pagesizes=KENDO_GRID.PAGE_SIZES;
					var Filter = function(operator,field,value,type){
						this.operator=operator;
						this.field=field;
						this.value=value;
						this.type=type;
					};
					function selectChildren(items){
						$.each(items, function (index, status) {
							 if(status.items && status.items.length>0){
								 selectChildren(status.items);
							 }else{
								 filterDescriptions.push(new Filter('or','VAL.ASSES_STAT_LKUP_CD',status.id,'string'));
							 }
						 });
					}
					function pupulateCustomFilters (riskAssessmentSearchDTO,filter) {
						filterContainer={};
						filterDescriptions=[];
						if(!!riskAssessmentSearchDTO.cycleType){
							filterDescriptions.push(new Filter('eq','VAL.CYC_TYP_LKUP_CD',riskAssessmentSearchDTO.cycleType,'string'));
						}
						if(!!riskAssessmentSearchDTO.cycleKey){
							filterDescriptions.push(new Filter('eq','VAL.RSK_ASES_CYC_KY',riskAssessmentSearchDTO.cycleKey,'string'));
						}
						if(!!riskAssessmentSearchDTO.assessmentStatus && riskAssessmentSearchDTO.assessmentStatus.length>0){
							 $.each(riskAssessmentSearchDTO.assessmentStatus, function (index, status) {
								 if(status.items && status.items.length>0){
									 selectChildren(status.items);
								 }else{
									 filterDescriptions.push(new Filter('or','VAL.ASSES_STAT_LKUP_CD',status.id,'string'));
								 }
							 });
						}
						if(!!riskAssessmentSearchDTO.scopeType){
							filterDescriptions.push(new Filter('eq','VAL.TYPE_KEY',riskAssessmentSearchDTO.scopeType,'string'));
						}
						if(!!riskAssessmentSearchDTO.assessmentName){
							filterDescriptions.push(new Filter('contains','VAL.ASSESSMENT_NAME',riskAssessmentSearchDTO.assessmentName,'string'));
						}
						if(filter && filter.filters){
					          $.each(filter.filters, function (index, filterObject) {
					              if(filterObject.field){
					                  if(filterObject.field==='cyclePeriodStart' || filterObject.field==='cyclePeriodEnd' ||
					                     filterObject.field==='assessmentPeriodStart' || filterObject.field==='assessmentPeriodEnd' ||
					                     filterObject.field==='assessmentDueDate'){
					                      var date = new Date(filterObject.value);
					                      filterObject.value = kendo.toString(date, 'yyyy-MM-dd');
					                      filterDescriptions.push(filterObject);
					                  }
					                  else{
					                	  filterDescriptions.push(filterObject);
					                  }
					              }
					          });

					      }
						filterContainer.filters=filterDescriptions;
                        return filterContainer;
                    }
					function displayChallengeKeys(dataItem) {
						var returnData = '';
						var s=0;
						if(!!dataItem.challengeKeys){
							dataItem.challengeKeys.forEach(function(challengeKey){
								if(returnData){
									returnData= returnData+', ';
								}else{
									returnData = '<span require-control-point="CHALLENGES_VIEW" context-val-id="utilList">';
								}
								if(dataItem.riskAssessmentStatus === 'RA_ASES_FINAL' || dataItem.riskAssessmentStatus === 'RA_ASES_SUBMITTED' || dataItem.riskAssessmentStatus === 'RA_ASES_ATTEST' || dataItem.challengeDtos[s].challengeDesLkupCode){
									returnData= returnData+ challengeKey;
								}else{
									returnData= returnData+ '<a href="" ng-hide="dataItem.riskAssessmentStatus===\'RA_ASES_DELETED\'"  ng-click="editChallenge('+challengeKey+',\'Y\')"><span require-control-point="CHALLENGES_VIEW" context-val-id="utilList">'+challengeKey+'</span></a>';
								}
								s++;
					          });
						}
						return returnData+'</span>';
				    }
					return {
						getOwnerSearchGrid : function() {
							return {
								sortable : false,
								pageable: {
							          pageSizes: pagesizes
							      }, 
								scrollable : false,
								columns : [
										{
											field : '',
											title : 'Name',
											width : '48em',
											template : '<a href=""  ng-click="selectedOwner(dataItem.fullName, dataItem.workerKey)" ><span>{{dataItem.fullName}}</span></a>'

										}, {
											field : 'workEmailAddressText',
											title : 'Email Address'

										}, {
											field : 'stdId',
											title : 'NBK Id'

										} ]
							};

						},
						getProcessOwnerSearchGrid : function() {
							return {
								sortable : false,
								pageable: {
							          pageSizes: pagesizes
							      }, 
								scrollable : false,
								columns : [
										{
											field : '',
											title : 'Name',
											width : '48em',
											template : '<a href=""  ng-click="selectedProcessOwner(dataItem.fullName, dataItem.workerKey)" ><span>{{dataItem.fullName}}</span></a>'

										}, {
											field : 'workEmailAddressText',
											title : 'Email Address'

										}, {
											field : 'stdId',
											title : 'NBK Id'

										} ]
							};

						},
						getOwnerSearchGridDataSource : function(fName, lName,
								mailId, nbkId) {
							var countNew = 0;
							return new kendo.data.DataSource({
								type : 'json',
								serverPaging: true,
				                serverSorting: true,
				                serverFiltering: true,
								transport : {
									read : function(options) {
										var gridSearchObject = {
					                            skip: options.data.skip,
					                            take: options.data.take,
					                            pageSize: options.data.pageSize,
					                            page: options.data.page,
					                            sorting: options.data.sort,
					                            
					                        };
										return OrcitLoader.load($http.post(
												'app/assessment/rest/ownerList?firstName=' +
												fName + '&lastName=' +
												 lName + '&emailId=' +
												 mailId + '&nbkId=' +
												 nbkId,gridSearchObject)).success(
												function(data) {
													countNew = data.totalCount;
													 options.success(data.resultDTOList);
												});
									}

								},
								pageSize : 5,
								schema : {
									model : {
										fields : {
											fullName : {
												editable : false
											},
											workEmailAddressText : {
												editable : false
											},
											stdId : {
												editable : false
											}
										}
									},
									total: function () {
				                        return countNew;
				                    }

								}
							});
						},
						getAttestorSearch : function(fName, lName,
                            mailId, nbkId,srchType) {
							var countNew = 0;
                        return new kendo.data.DataSource({
                            type : 'json',
                                	serverPaging: true,
    				                serverSorting: true,
    				                serverFiltering: true,
    								transport : {
    									read : function(options) {
    										var gridSearchObject = {
    					                            skip: options.data.skip,
    					                            take: options.data.take,
    					                            pageSize: options.data.pageSize,
    					                            page: options.data.page,
    					                            sorting: options.data.sort,
    					                            
    					                        };
    										
                                    return OrcitLoader.load($http.post(
                                            'app/assessment/rest/attesterProxySrch?firstName=' +
                                                    fName + '&lastName=' +
                                                     lName + '&emailId=' +
                                                     mailId + '&nbkId=' +
                                                     nbkId + '&srchType=' + srchType,gridSearchObject)).success(
                                            function(data) {
                                            	countNew = data.totalCount;
												 options.success(data.resultDTOList);
                                            });
                                }

                            },
                            pageSize : 5,
                            schema : {
                                model : {
                                    fields : {
                                        fullName : {
                                            editable : false
                                        },
                                        workEmailAddressText : {
                                            editable : false
                                        },
                                        stdId : {
                                            editable : false
                                        }
                                    }
                                },
                                total:function(){
                                	return countNew;
                                }

                            }
                        });
                    },
						getPreparerSearchGrid : function() {
							return {
								sortable : false,
								pageable: {
							          pageSizes: pagesizes
							      }, 
								scrollable : false,
								columns : [

										{
											field : '',
											title : 'Name',
											width : '48em',
											template : '<a href=""  ng-click="selectedPreparer(dataItem.fullName, dataItem.workerKey)" ><span>{{dataItem.fullName}}</span></a>'

										}, {
											field : 'workEmailAddressText',
											title : 'Email Address'

										}, {
											field : 'stdId',
											title : 'NBK Id'

										} ]
							};

						},
						
						getAlertMessagesGrid : function() {
							return {
								sortable : false,
								
								scrollable : false,
								columns : [

										 {
											field : 'alertMessage',
											title : 'List Of Pending Items'

										} ]
							};

						},
						
						getPreparerSearchGridDataSource : function(fName,
								lName, mailId, nbkId) {
							return new kendo.data.DataSource({
								type : 'json',
								transport : {
									read : function(options) {
										return OrcitLoader.load($http.get(
												'app/assessment/rest/preparerList?firstName=' +
														 fName + '&lastName=' +
														 lName + '&emailId=' +
														 mailId + '&nbkId=' +
														 nbkId)).success(
												function(data) {
													options.success(data);
												});
									}

								},
								pageSize : 5,
								schema : {
									model : {
										fields : {
											fullName : {
												editable : false
											},
											workEmailAddressText : {
												editable : false
											},
											stdId : {
												editable : false
											}
										}
									}

								}
							});
						},
						rcsaOwnerModalConfig : {
							width : '700px',
							title : 'RCSA Owner Search',
							modal : true,
							content : 'views/rcsa/rcsaOwnerModal.html',
							visible : false,
							draggable : false
						},
						getShowAllAssessmentGrid : function() {
							return {
								sortable : false,
								scrollable : true,
								pageable: {
							          pageSizes: pagesizes
							      },
								columns : [

										{
											field : 'assessmentName',
											title : 'Assessment <br>Name',
											width : '200px',
							                template: function (dataItem) {
							                    return '<a href="" ng-click="callEditRCSA( dataItem.assessmentId)" ><div  multiline-ellipsis class = "" size = "170" template = "true">'+ dataItem.assessmentName +'</div></a>';
							               
							            }
										}, {
											field : 'assessmentId',
											title : 'Assessment <br>ID'

										}, {
											field : 'assessmentStatus',
											title : 'Assessment <br>Status'

										},{
											field : 'cycleName',
											title : 'Cycle Name',
											width : '250px',
							                template: function (dataItem) {
							                    return '<div  multiline-ellipsis class = "" size = "220" template = "true">'+dataItem.cycleName +'</div>';							               
							            }

										},{
											field : 'cycleKey',
											title : 'Cycle ID'

										},{
											field : 'challengesOutstandings',
											title : 'Challenges <br>Outstanding',
											width : '250px',
							                template: function (dataItem) {
							                    return '<div  multiline-ellipsis class = "" size = "220" template = "true">'+dataItem.challengesOutstandings +'</div>';							               
							            }

										},{
											field : 'checkListComplete',
											title : 'CheckLists <br>Complete'

										},{
											field : 'cyclePeriodStart',
											title : 'Cycle <br>Period Start'

										},{
											field : 'cyclePeriodEnd',
											title : 'Cycle <br>Period End '

										},{
											field : 'assessmentPeriodStart',
											title : 'Assessment <br>Period Start'

										},{
											field : 'assessmentPeriodEnd',
											title : 'Assessment <br>Period End'

										},{
											field : 'assessmentDueDate',
											title : 'Assessment <br>Due Date'

										}
										]
							};

						},

						getSummaryRatingGridDataSource : function(assessmentId) {
							return new kendo.data.DataSource({
								type : 'json',
								transport : {
									read : function(options) {

										 return OrcitLoader.load($http.get('app/assessment/rest/summaryrating?riskAssessmentKey=' +assessmentId)).success(
												function(data) {
														
													options.success(data.summaryRatingDTOs);	
												}).error(function(err) {
													console.log(err);
												});
									}
								},
								pageSize : 5

							});
						},

						saveOpChecklistDataSource : function(opChecklistData) {
										 return OrcitLoader.load($http.post('app/assessment/rest/saveLobChecklist',opChecklistData )).success(
												function() {
												});
						},

						saveCorChecklistDataSource : function(CorChecklistData) {
							 return OrcitLoader.load($http.post('app/assessment/rest/saveCorChecklist',CorChecklistData )).success(
									function() {
									});
						},

						getSummaryRatingGrid : function() { 
							
							return {
								sortable : false,
								pageable: {
							          pageSizes: pagesizes
							      },
								scrollable : true,
								
								columns : [

										{
											field : 'ratingItemName',
											title : 'Rating Type',
											template : '<span>{{dataItem.ratingItemName}}</span>'

										}, {
											field : 'inherentRiskRatingText',
											title : 'Inherent Risk Rating'

										}, {
											field : 'controlEffectivenessRatingText',
											title : 'Control Effectiveness'

										},{
											field : 'residualRiskComputingText',
											title : 'Residual Risk Computed',
											headerAttributes: {
								                style: 'height: auto; white-space: normal'
								              }

										},{
											field : 'residualRiskRatingText',
											title : 'Residual Risk Final'

										},{
											field : 'residualRiskDirectionText',
											title : 'Risk Direction'

										},{
											field : 'ratingCommentDescription',
											title : 'Rationale',
											width : '250px',
										    template : function() {
                                                  return '<div><a href="" ng-if="dataItem.ratingCommentDescription" ng-click = "openRationaleModal(dataItem)" >View Rationale<\a></div>';
                                          },
										}
										]
							};

						},


						getTopRisksGridDataSource : function(assessmentId) {
							return new kendo.data.DataSource({
								type : 'json',
								transport : {
									read : function(options) {

										return OrcitLoader.load($http.get('app/assessment/rest/topRisks?riskAssessmentKey=' +assessmentId)).success(
												function(data) {
													options.success(data.riskAssessmentKeyConcernDTOs);
												}).error(function(err) {
													console.log(err);
												});
									}

								},
								pageSize : 5

							});
						},
						getChallengesGridDataSource : function(assessmentId) {
							return new kendo.data.DataSource({
								type : 'json',
								transport : {
									read : function(options) {

										return OrcitLoader.load($http.get('app/assessment/rest/challenge?riskAssessmentKey=' +assessmentId)).success(
												function(data) {
													options.success(data.assessmentChallengeDTOs);
												}).error(function(err) {
													console.log(err);
												});
									}

								},
								pageSize : 5,
								schema : {
									model : {
										fields : {
											riskAssessmentChallengeKey : {
												editable : false,
												 type: 'string',
											},
											createWorkerText : {
												editable : false
											},
											initByWorker : {
												editable : false
											},
											challengeDescription : {
												editable : false
											},
											outcomeResolutionText : {
												editable : false
											},
											originatingArearLkupCode : {
												editable : false
											},
											originatingGrpText : {
												editable : false
											},
											challengeResponseWrk : {
												editable : false
											},
											challengeResponseComment : {
												editable : false
											},
											theme : {
												editable : false
											},
											esclRqrFlag : {
												editable : false
											}
										}
									}

								}

							});
						},


						getAttestationGridDataSource : function(assessmentId) {
							return new kendo.data.DataSource({
								type : 'json',
								transport : {
									read : function(options) {

										return OrcitLoader.load($http.get('app/assessment/rest/attestation?riskAssessmentKey=' +assessmentId)).success(
												function(data) {
													options.success(data.assessmentRoleAsgnDTOs);
												}).error(function(err) {
													console.log(err);													
												});
									}

								},
								pageSize : 5,
								schema: {
				                	model : {
										fields : {
											attestationDate : {
												editable : false,
												type: 'string'
											}
										}
				                	}
								}

							});
						},

						getOpRiskGridDataSource : function(assessmentId) {
							return new kendo.data.DataSource({
								type : 'json',
								transport : {
									read : function(options) {

										return OrcitLoader.load($http.get('app/assessment/rest/checklist?riskAssessmentKey=' +assessmentId)).success(
												function(data) {
													options.success(data.lobCheckListDTOs);
													}).error(function(err) {
													console.log(err);
												});
									}

								},
								pageSize : 5

							});
						},
						getCorRiskGridDataSource : function(assessmentId) {
							return new kendo.data.DataSource({
								type : 'json',
								transport : {
									read : function(options) {

										return OrcitLoader.load($http.get('app/assessment/rest/checklist?riskAssessmentKey=' +assessmentId)).success(
												function(data) {
													options.success(data.corCheckListDTOs);
												}).error(function(err) {
													console.log(err);
												});
									}

								},
								pageSize : 5

							});
						},


						getOpChecklistSearchDataSource : function(searchID, searchTheme, assessmentKey) {
							return new kendo.data.DataSource({
								type : 'json',
								transport : {
									read : function(options) {

										return $http.get('app/assessment/rest/challengelist?challengeId=' + searchID +'&themeLookUpCode='+searchTheme+'&riskAssessmentKey='+assessmentKey).success(
												function(data) {
													options.success(data);
												});
									}

								},
								pageSize : 5

							});
						},

					getOpChecklistGrid : function() {
							return {
								sortable : true,
								pageable: {
							          pageSizes: pagesizes
							      }, 
								scrollable : true,
								 excel: {
							          fileName: 'OpRiskCheckList.xlsx',
							          proxyURL: '/ra/app/xls/export',
							          allPages: true,
							          filterable: false
							      },
							      toolbar: [
							          {
							              template: '<button class="btn btn-default k-grid-excel btn-sm pull-right">Export to Excel</button>'
							          }
							          ],
								filterable:{
							          extra: false,
							          operators: {
							              string: {
							                  startswith: 'Starts with',
							                  eq: 'Is equal to',
							                  contains: 'Contains'
							              }
							          }
							      },
								columns : [

										{
											field : '',
											title : 'Action',
											width: '5em',
											template : function () {
												return '<a href="" title="View OpRisk Checklist" ng-show="statusCheck(dataItem.riskAssessmentStatus,\'RA_ASES_FINAL,RA_ASES_DELETED,RA_ASES_ATTEST,RA_ASES_SUBMITTED\') || OR_CHECKLIST_EDIT" ng-click="viewEditCheklistModal(dataItem)" ><orcit-icon icon="search" require-control-point="OR_CHECKLIST_VIEW" context-val-id="utilList" class="text-info"></orcit-icon></a><a href="" title="Edit OpRisk CheckList"  ng-hide="statusCheck(dataItem.riskAssessmentStatus,\'RA_ASES_FINAL,RA_ASES_DELETED,RA_ASES_ATTEST,RA_ASES_SUBMITTED\')"  ng-click="openEditCheklistModal(dataItem)" ><orcit-icon icon="edit" class="text-info" require-control-point="OR_CHECKLIST_EDIT" context-val-id="utilList"></orcit-icon></a>&nbsp;&nbsp;<a  href="" class="text-decoration-irr" title="Add Challenge To OpRisk Checklist" ng-hide="statusCheck(dataItem.riskAssessmentStatus,\'RA_ASES_FINAL,RA_ASES_DELETED,RA_ASES_ATTEST,RA_ASES_SUBMITTED\')" ng-click="addChallenge(\'Y\',dataItem.riskAsesCklstSessionKey)"> <orcit-icon icon="add" class="text-info" require-control-point="CHALLENGES_ADD" context-val-id="utilList"></orcit-icon></a>';
							                }

										}, {
											field : 'rcsaStandard',
											title : 'RCSA Standard Reference',
											width: '15em',
										}, {
											field : 'standardName',
											title : 'Standard Name',
											width: '10em',
										},{
											field : 'actionItem',
											title : 'Action Item',
											width: '9em',
										},{
											field : 'testingProcedure',
											title : 'Testing Procedure',
											width: '12em',
										},{
											field : 'opriskYesNo',
											title : 'Op Risk Completed (Yes/No)',
											width: '15em',
										},
										{
											field : 'challengeKeysConcatenated',
											title : 'Challenge # If Created',
											template: displayChallengeKeys,
								            sortable : false,
								            filterable:false,
								            width: '13em'
								            
										},
										{
											field : 'comments',
											title : 'Comments',
											width: '10em',
										},
										{
											field : 'modifiedBy',
											title : 'Last Modified By',
                                            width:'11em'
										}

										]
							};

						},
						getCorChecklistGrid : function() {
							return {
								sortable : true,
								pageable: {
							          pageSizes: pagesizes
							      }, 
								scrollable : true,
								 excel: {
							          fileName: 'CorCheckList.xlsx',
							          proxyURL: '/ra/app/xls/export',
							          allPages: true,
							          filterable: false
							      },
							      toolbar: [
							          {
							              template: '<button class="btn btn-default k-grid-excel btn-sm pull-right">Export to Excel</button>'
							          }
							          ],
								filterable:{
							          extra: false,
							          operators: {
							              string: {
							                  startswith: 'Starts with',
							                  eq: 'Is equal to',
							                  contains: 'Contains'
							              }
							          }
							      },
								columns : [

										{
											field : '',
											title : 'Action',
											width: '4em',
											template : function () {
												return '<a href="" title="View COR Checklist" ng-show="statusCheck(dataItem.riskAssessmentStatus,\'RA_ASES_FINAL,RA_ASES_DELETED\') || (COR_CHECKLIST_EDIT && COR_RESPONSE_EDIT)" ng-click="viewCorCheklistModal(dataItem)"><orcit-icon icon="search" class="text-info" require-control-point="COR_CHECKLIST_VIEW,COR_RESPONSE_VIEW" context-val-id="utilList"></orcit-icon></a>&nbsp;&nbsp;<a href="" title="Edit COR Checklist" ng-hide="statusCheck(dataItem.riskAssessmentStatus,\'RA_ASES_FINAL,RA_ASES_DELETED\')" ng-click="openEditCorCheklistModal(dataItem)"><orcit-icon icon="edit" class="text-info" require-control-point="COR_CHECKLIST_EDIT,COR_RESPONSE_EDIT" context-val-id="utilList"></orcit-icon></a>';
							                }

										}, {
											field : 'qualityAsuranceElement',
											title : 'Quality Assurance Element',
											width:'15em'

										}, {
											field : 'objectiveOfQaElement',
											title : 'Objective of Quality Assurance Element (Passing Criteria)',
											width:'26em'

										},{
											field : 'stepsToComplete',
											title : 'Steps to Complete Quality Assurance Test',
											width:'21em'
										},{
											field : 'supportingArtifacts',
											title : 'Recommended Supporting Artifacts',
											width:'19em'											 
										},{
											field : 'result',
											title : 'Results',
											width:'7em'											
										},
										{
											field : 'corComments',
											title : 'COR Commentary/ Findings',
											width:'16em'    
	                                       

										},
										{
											field : 'preparerResponse',
											title : 'LOB / Preparer Response',
											width:'14em'

										},
										{
											field : 'finalResult',
											title : 'Final Disposition/ Commentary',
											width:'16em'

										},
										{
											field : 'modifiedBy',
											title : 'Last Modified By',
											width:'10.7em'
										}

										]
							};

						},
	                      getAlldocs : function (assessmentId){
	                        return  $http.get('app/upload/getallDoc/' +assessmentId);
	                      },
						getAllAsessmentGridDataSource : function(riskAssessmentSearchDTO) {
							var countNew = 0;
							return new kendo.data.DataSource({
								type : 'json',
								serverPaging: true,
				                serverSorting: true,
				                serverFiltering: true,
								transport : {
									read : function(options) {
										var gridSearchObject = {
					                            skip: options.data.skip,
					                            take: options.data.take,
					                            pageSize: options.data.pageSize,
					                            page: options.data.page,
					                            sorting: options.data.sort,
					                            filter: pupulateCustomFilters(riskAssessmentSearchDTO,options.data.filter)
					                        };
										return $http.post(
												'app/assessment/rest/getRiskAssessments',gridSearchObject).success(
												function(data) {
													 countNew = data.totalCount;
						                                options.success(data.resultDTOList);
												});
									}

								},
								pageSize : 10,
								schema : {
									model : {
									    id:'assessmentId',
										fields : {
											assessmentName : {
												editable : false
											},
											assessmentId : {
												editable : false
											},
											assessmentStatus : {
												editable : false
											},
											cycleName : {
												editable : false
											},
											cycleKey : {
												editable : false
											},
											challengesOutstandings : {
												editable : false
											},
											checkListComplete : {
												editable : false
											},
											cyclePeriodStart : {
												editable : false
											},
											cyclePeriodEnd : {
												editable : false
											},
											assessmentPeriodStart : {
												editable : false
											},
											assessmentPeriodEnd : {
												editable : false
											},
											assessmentDueDate : {
												editable : false
											}
									}
									},
									total: function () {
				                        return countNew;
				                    }
								}
							});

						},
						getDocGridDataSource : function(assessmentId) {
                          return new kendo.data.DataSource({
                              type : 'json',
                              transport : {
                                  read : function(options) {
                                      return OrcitLoader.load($http.get('app/upload/getallDoc/' +assessmentId)).success(
                                              function(data) {
                                                  options.success(data);
                                              }).error(function(err) {
                                            	  	console.log(err);
												});
                                  }

                              },
                              pageSize : 5

                          });
                      }
					};

				});
