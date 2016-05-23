//to get tree view data like epcf and erh
angular.module('riskAssessmentApp').factory('TreeViewData', function ($resource) {
    'use strict';
    return $resource('app/prcs/rest/cacheDropdown/:id', {}, {
        'query': {
            method: 'GET',
            isArray: true
        },
        'get': {
            method: 'GET'
        }
    });
});
//to get tree view data like epcf and erh
angular.module('riskAssessmentApp').factory('TreeViewDataERH', function ($resource) {
    'use strict';
    return $resource('app/prcs/rest/cacheDropdown/ENTR_REP_HRCHY/:id', {}, {
        'query': {
            method: 'GET',
            isArray: true
        },
        'get': {
            method: 'GET'
        }
    });
});
//EPCFHirachyInfo
angular.module('riskAssessmentApp').factory('EPCFHirachyInfo', function ($resource) {
    'use strict';
    return $resource('app/prcs/rest/process/getEPCFhierarchyInfo/:id', {}, {
        'query': {
            method: 'GET'
        },
        'get': {
            method: 'GET'
        }
    });
});
//ERhHirachyInfo

angular.module('riskAssessmentApp').factory('TreeHirachyInfo', function ($http) {
  'use strict';
  return {
      getErhInfo: function (id) {
        return $http.get('app/prcs/rest/process/getERhHirachyInfo/' + id);
      },
      getEpcfInfo: function (id) {
          return $http.get('app/prcs/rest/process/getEPCFhierarchyInfo/' + id);
       }
  };
});

angular.module('riskAssessmentApp').factory('cnaRiskPrcsDetail', function ($resource) {
    'use strict';
    return $resource('app/risk/rest/riskTocontrol/editProcessForCreateAndAlignNewRisk/:id', {}, {
        'query': {
            method: 'GET'
        },
        'get': {
            method: 'GET'
        }
    });
});
angular.module('riskAssessmentApp').factory('saveRiskToProcessGrid', function ($resource) {
    'use strict';
    return $resource('--link here--:id', {}, {
        'query': {
            method: 'GET'
        }
    });
});

angular.module('riskAssessmentApp').factory('processService', function ($http, $stateParams, OrcitLoader) {
    'use strict';
    return {
        getRiskRatings: function () {
            return $http.get('app/processrating/rest/rating/' + $stateParams.processId + '?_ts=' + new Date().getTime());
        },
        getRisksAndCtrlsAlignToProcess: function () {
            return $http.get('app/prcs/rest/process/getAllRisksAsignedByProcess/' + $stateParams.processId);
        },
        getPrcChallengesGridDataSource : function(processKey) {
			return new kendo.data.DataSource({
				type : 'json',
				transport : {
					read : function(options) {

						return OrcitLoader.load($http.get('app/prcchallenge/rest/prcChallenges?processKey=' +processKey)).success(
								function(data) {
									options.success(data);
								}).error(function(err) {
									console.log(err);
								});
					}

				},
				pageSize : 5,				
				schema : {
					model : {
						fields : {
							processChallengeKey : {
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

    };
});
