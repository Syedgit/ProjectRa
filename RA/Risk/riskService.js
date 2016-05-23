/**
 * @ngdoc Factory
 * @name RiskService
 * @module riskAssessmentApp
 * @description Risk factory for interacting with the Risk API
 */
angular.module('riskAssessmentApp').factory('RiskService', function ($http,KENDO_GRID) {
    'use strict';
    return {
        //working
        getRisk: function (riskId) {
            return $http.get('app/risk/rest/risk/' + riskId);
        },
        //working api
        saveRisk: function (riskObj) {
            return $http.post('app/risk/rest/risk', riskObj);
        },
        //working api
        getRiskEventinfo: function (id) {
            return $http.get('app/risk/rest/risk/getRiskEventTypeInfo/' + id);
        },
        //Working Api
        getAllignNewRiskData: function (processKey) {
            return $http.get('app/risk/rest/riskTocontrol/editProcessForCreateAndAlignNewRisk/' + processKey);
        },
        saveAllignRiskToProcess: function (riskDTO) {
            return $http.post('app/risk/rest/riskTocontrol/saveCreateAndAlignNewRiskToProcess', riskDTO);
        },
        //working api
        getunAllignRiskWithinProcess: function (riskInProcessKey) {
            return $http.get('app/risk/rest/riskTocontrol/unAlignRiskWithinProcess/' + riskInProcessKey);
        },
        //working
        getalignRiskToProcess: function (riskInProcessKey) {
            return $http.get('app/risk/rest/editRiskWithinProcess/' + riskInProcessKey);
        },
        //working
 /*       getRiskRatingGridDataSource: function (dataSource) {
            return new kendo.data.DataSource({
                data: dataSource,
                serverFiltering: false,
                pageSize: 5,
                schema: {
                    model: {
                        fields: {
                            bgnTranTs: {
                                editable: false
                            },
                            overallControlEffectivenessComputed: {
                                editable: false
                            },
                            overallControlEffectivenessBusiness: {
                                editable: false
                            },
                            overallControlEffectivenessJustification: {
                                editable: false
                            }
                        }
                    }
                }
            });
        },*/
        //working
        getalignCtrlAndProcessToRisk: function (riskKey) {
            return $http.get('app/risk/rest/risk/getAllControlsAndProcessAsignedByRisk/' + riskKey);
        },
        alignedProcessToRiskGrid : function() {
			return {
			        sortable: true,
			        scrollable: true,
			        editable: false,
			        dataBound: function () {
			        	var dataSource = this.dataSource;      
			           	this.element.find('tr.k-master-row').each(function() {
			           		var row = $(this);
			           		var data = dataSource.getByUid(row.data('uid'));
			           		if(data.hasControls==='N'){
			           			row.find('.k-hierarchy-cell a').css({ opacity: 0.3, cursor: 'default' , display: 'none'}).click(function(e) {			           				e.stopImmediatePropagation(); 
			           				return false;
			           				});
			           		}
			           	});
			        },
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
			        pageable: {
			          pageSizes:KENDO_GRID.PAGE_SIZES
			      },
			        columns: [
			            {
			                field: 'processName',
			                title: 'Aligned Process Name',
			                width: '300px',
		                    template: function (dataItem) {
		                        return '<div  multiline-ellipsis class = "" size = "270" template = "true">'+dataItem.processName +'</div>';
		                   
		                }
			            },
			            {
			                field: 'epcfName',
			                title: 'Aligned Process EPCF',
			                width: '300px',
		                    template: function (dataItem) {
		                        return '<div  multiline-ellipsis class = "" size = "270" template = "true">'+dataItem.epcfName +'</div>';
		                   
		                }
			            },
			            {
			              field: 'erhName',
			              title: 'Aligned Process ERH',
			              width: '300px',
		                    template: function (dataItem) {
		                        return '<div  multiline-ellipsis class = "" size = "270" template = "true">'+dataItem.erhName +'</div>';
		                   
		                }
			          },
			            {
			              field: 'erhAllLevelsName',
			              title: 'Aligned Process ERH All Levels',
			              width: '300px'
			          },
			          {
			            field: 'riskGeolocationsText',
			            title: 'Risk Geographic Locations',
			            width: '250px',
	                    template: function (dataItem) {
	                    	if(dataItem.riskGeolocationsText){
	                    	
	                        return '<div  multiline-ellipsis class = "" size = "220" template = "true">'+dataItem.riskGeolocationsText +'</div>';
	                    	}
	                    	else{
	                    		
	                    		 return '<div  multiline-ellipsis class = "" size = "220" template = "true"> </div>';
	                    	}
	                }
			        }
			         ]
			    };
		},
		getAlignedProcessesToRiskGridDataSource : function(riskKey) {
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
		                            filter: options.data.filter
		                        };
							return $http.post(
									'app/risk/rest/allAlignedProcessesToRisk/' + riskKey,gridSearchObject).success(
									function(data) {
										 countNew = data.totalCount;
			                                options.success(data.resultDTOList);
									});
						}

					},
					pageSize : 5,
					schema : {
						model : {
						    id:'riskInProcessKey',
							fields : {
								processName : {
									editable : false
								},
								epcfName : {
									editable : false
								},
								erhName : {
									editable : false
								},
								riskGeolocationsText : {
									editable : false
								},
								riskOverallEffectivenessRating : {
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
			getAlignedControlToRiskGridData: function (dataItem) {
	            var countNew = 0;
	            return {
	                dataSource: {
	                    type: 'json',
	                    serverPaging: true,
	                    serverSorting: true,
	                    serverFiltering: true,
	                    transport: {
	                        read: function (options) {
	                            var gridSearchObject = {
	                                skip: options.data.skip,
	                                take: options.data.take,
	                                pageSize: options.data.pageSize,
	                                page: options.data.page,
	                                sorting: options.data.sort,
	                                filter: options.data.filter
	                            };
	                            return $http.post('app/risk/rest/allAlignedControlsToRisk?riskInProcessKey=' + dataItem.riskInProcessKey+ '&refresh=' + new Date().getTime(), gridSearchObject)
	                                .success(function (data) {
	                                	countNew = data.totalCount;
	                                    options.success(data.resultDTOList);
	                                });
	                        }
	                    },
	                    pageSize: 5,
	                    schema: {
	                        total: function () {
	                            return countNew;
	                        }
	                    }
	                },
	            	sortable: true,
	        		pageable: {
	        			pageSizes: KENDO_GRID.PAGE_SIZES
	        		},
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
	        		scrollable: false,
	        		editable: false,
	        		columns: [
					            {
					                field: 'longName',
					                title: 'Aligned Control Name',
					                width: '300px',
				                    template: function (dataItem) {
				                        return '<div  multiline-ellipsis class = "" size = "270" template = "true">'+dataItem.longName +'</div>';
				                   
				                }
					            },
					            {
					                field: 'erhText',
					                title: 'Aligned Control ERH',
					                width: '250px',
				                    template: function (dataItem) {
				                        return '<div  multiline-ellipsis class = "" size = "220" template = "true">'+dataItem.erhText +'</div>';
				                   
				                }
					            },
					            {
					              field: 'controlDesignRatingText',
					              title: 'Control Design Rating',
					              width: '140px'
					          },
					          {
					            field: 'ctlPerformanceRatingText',
					            title: 'Control Performance Rating',
					            width: '170px'
					        },
					          {
					            field: 'businessControlEffectiveness',
					            title: 'Control Effectiveness',
					            width: '140px'
					          }
					         ]
	            };

	        }
    };
});
