angular.module('riskAssessmentApp').value('RcsaAssessConfig', {
    includeAssessmentGrid: {
        dataSource: [],
        sortable: true,
        scrollable: false,
        editable: false,
      
        columns: [
            {
                field: '',
                title: 'Action',
                width: '150px',
                template: function () {
                    'use strict';
                    return '<a href="" title="View Assessment" ng-click="viewAssessmentFrmCycle(this.dataItem.riskAssessmentKey)" ><orcit-icon icon="search"  class="text-info" require-control-point="ASSESSMENT_VIEW" ng-show="ASSESSMENT_EDIT || this.dataItem.assessmentStatusLookupCode==\'RA_ASES_FINAL \' || this.dataItem.assessmentStatusLookupCode==\'RA_ASES_DELETED\' ||  this.dataItem.assessmentStatusLookupCode==\'RA_ASES_CANCELLED\' || this.dataItem.cycStatLkupCode==\'RA_CANCEL\' || rcsaCycleDTO.cycStatLkupCode==\'RA_FINAL\'"></orcit-icon></a>&nbsp;&nbsp;<a href="" title="Edit Assessment" ng-click="editAssessmentFrmCycle(this.dataItem.riskAssessmentKey)" ng-hide="this.dataItem.assessmentStatusLookupCode==\'RA_ASES_FINAL \' || this.dataItem.assessmentStatusLookupCode==\'RA_ASES_DELETED\' ||  this.dataItem.assessmentStatusLookupCode==\'RA_ASES_CANCELLED\' || this.dataItem.cycStatLkupCode==\'RA_CANCEL\' || rcsaCycleDTO.cycStatLkupCode==\'RA_FINAL\'"><orcit-icon icon="edit"  class="text-info"  require-control-point="ASSESSMENT_EDIT" disable-control-point="ASSESSMENT_EDIT"></orcit-icon></a>&nbsp;&nbsp;<a href="" title="Exclude Assessment From Cycle" ng-click="excludeAssess(this.dataItem)" ng-hide="this.dataItem.assessmentStatusLookupCode==\'RA_ASES_FINAL \' || this.dataItem.assessmentStatusLookupCode==\'RA_ASES_DELETED\' ||  this.dataItem.assessmentStatusLookupCode==\'RA_ASES_CANCELLED\'|| this.dataItem.cycStatLkupCode==\'RA_CANCEL\' || rcsaCycleDTO.cycStatLkupCode==\'RA_FINAL\'"><orcit-icon class="text-info" icon="clear"  require-control-point="ASSESSMENT_DELETE"></orcit-icon></a>';
                }
            },
            {
                field: 'assessmentName',
                title: 'Assessment Name',
                width: '150px',
                template: function (dataItem) {
                	'use strict';
                    return '<div  multiline-ellipsis class = "" size = "120" template = "true">'+dataItem.assessmentName +'</div>';
               
            }
            },
            {
                field: 'type',
                title: 'Type',
                width: '150px'
            },
            {
                field: 'scope',
                title: 'Scope',
                width: '150px'
            },
            {
                field: 'assessmentStatus',
                title: 'Status',
                width: '150px'
            },
            {
                field: 'dueDate',
                title: 'Due Date',
                width: '150px'
            },
            {
                field: 'rcsaOwner',
                title: 'RCSA Owner',
                width: '150px'
            },
            {
                field: 'rcsaPreparer',
                title: 'RCSA Preparer',
                width: '170px'
            },
            {
                field: 'includeERHNames',
                title: 'Included ERH',
                width: '300px',
                template: function (dataItem) {
                	'use strict';
                	if(dataItem.includeERHNames){
                		return '<div  multiline-ellipsis class = "" size = "270" template = "true">'+dataItem.includeERHNames +'</div>';
                	}
                	else{
                		return '<div  multiline-ellipsis class = "" size = "270" template = "true"> </div>';
                	}
               
            }
                
            },
            {
                field: 'lastModifiedDate',
                title: 'Last Modified',
                width: '300px'
            }
         ]
    },
    excludeAssessmentGrid: {
        dataSource: [],
        sortable: true,
        scrollable: false,
        editable: false,
      
        columns: [
            {
                field: '',
                title: 'Action',
                width: '150px',
                template: function () {
                    'use strict';
                    return '<a href="" title="View Assessment" ng-click="viewAssessmentFrmCycle(this.dataItem.riskAssessmentKey)"><orcit-icon icon="search" require-control-point="ASSESSMENT_VIEW" class="text-info"></orcit-icon></a>&nbsp;&nbsp;<a href="" title="Include Assessment To Cycle" ng-click="includeAssess(this.dataItem)" ng-hide="this.dataItem.cycStatLkupCode==\'RA_CANCEL\' || rcsaCycleDTO.cycStatLkupCode==\'RA_FINAL\'"><orcit-icon icon="add" require-control-point="ASSESSMENT_EDIT" class="text-info"></orcit-icon></a>';
                }
            },
            {
                field: 'assessmentName',
                title: 'Assessment Name',
                width: '150px',
                template: function (dataItem) {
                	'use strict';
                    return '<div  multiline-ellipsis class = "" size = "120" template = "true">'+dataItem.assessmentName +'</div>';
               
            }
            },
            {
                field: 'type',
                title: 'Type',
                width: '150px'
            },
            {
                field: 'scope',
                title: 'Scope',
                width: '150px'
            },
            {
                field: 'dueDate',
                title: 'Due Date',
                width: '150px'
            },
            {
                field: 'rcsaOwner',
                title: 'RCSA Owner',
                width: '150px'
            },
            {
                field: 'rcsaPreparer',
                title: 'RCSA Preparer',
                width: '170px'
            },
            {
                field: 'includeERHNames',
                title: 'Included ERH',
                width: '300px',
                template: function (dataItem) {
                	'use strict';
                	if(dataItem.includeERHNames){
                		return '<div  multiline-ellipsis class = "" size = "270" template = "true">'+dataItem.includeERHNames +'</div>';
                	}else{
                		return '<div  multiline-ellipsis class = "" size = "270" template = "true"> </div>';
                	}
            }
            },
            {
                field: 'lastModifiedDate',
                title: 'Last Modified',
                width: '300px'
            }
        ]
    }
}).config(function ($provide, KENDO_GRID) {
	'use strict';
	//decorator for adding dynamic page sizes for ProcessDataPendConfig
	$provide.decorator('RcsaAssessConfig', function ($delegate) {
		var pageable = {
				pageSizes : KENDO_GRID.PAGE_SIZES
		};
		$delegate.includeAssessmentGrid.pageable = pageable;
		$delegate.excludeAssessmentGrid.pageable = pageable;
		return $delegate;
	});
});
