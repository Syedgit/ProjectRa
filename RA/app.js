angular.module('riskAssessmentApp', [
    'angularSpinner',
    'ngResource',
    'ui.router',
    'ngCookies',
    'bacMultiselect',
    'kendo.directives',
    'kendoMultiselectTreeview',
    'offClick',
    'myMaxlength',
    'requireControlPoint',
    'disableControlPoint',
    'disablePageElements',
    'progressStepbar',
    'ui.bootstrap',
    'orcit.ssoHandler',
    'orcit.icon',
    'orcit.multiselectTreeview',
    'orcit.loader'
]).config(function ($stateProvider, $httpProvider, $urlRouterProvider,$tooltipProvider) {
    'use strict';
    /*
     * This has to be here because the browsers will not catch the home
     * state without it
     */
    $urlRouterProvider.otherwise(function ($injector) {
        var $state = $injector.get('$state');
        $state.go('app.home');
    });

    $httpProvider.defaults.withCredentials = true;
    $httpProvider.defaults.headers.post = {'Content-Type': 'application/json'};
    $httpProvider.defaults.headers.get = {'keep-alive': 'timeout=600, max=1200'};
    $httpProvider.interceptors.push('ssoInterceptor');
    $httpProvider.interceptors.push('HttpResponseInterceptor');

    $stateProvider
        .state('app', {
            abstract: true,
            url: '',
            templateUrl: 'views/global/main.html',
            controller: 'MainCtrl'
        })
        .state('app.home', {
            url: '/',
            templateUrl: 'views/riskHomePage/riskAssesmentHomePage.html',
            controller: 'HomeCtrl',
            data: {
                authenticate: true
            },
            /*resolve: {
                decisionData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/RA_PRC_GVRNC_DECSN');
                }
            },*/
            breadcrumb: {
              title: 'Home',
              path: ['app.home']
          }
        })
        .state('app.error', {
            url: '/error',
            templateUrl: 'views/confirmation/error.html'
        })
        .state('app.createProcess', {
            url: '/process/create',
            templateUrl: 'views/process/createEditProcessContent.html',
            controller: 'ProcessCtrl',
            data: {
                authenticate: true
            },
            resolve: {
                existingProcess: function(){
                    return null;
                },
                pageDisable: function(RcsaFactory){                	
                	return RcsaFactory.disableonOpenCycles();
                }
            },
            breadcrumb: {
              title: 'Create New Process',
              path: ['app.home', 'app.createProcess']
          }
        })
        .state('app.editProcess', {
            url: '/process/:processId/:refresh?:from',
            templateUrl: 'views/process/createEditProcessContent.html',
            controller: 'ProcessCtrl',
            data: {
                authenticate: true
            },
            resolve: {
                existingProcess: function($http, $stateParams, OrcitLoader){
                   return OrcitLoader.load($http.get('app/prcs/rest/process/'+ $stateParams.processId));
                },
                pageDisable: function(RcsaFactory){                	
                    return RcsaFactory.disableonOpenCycles();
                }
            },
            breadcrumb: {
              title: 'Edit Process',
              path: ['app.home', 'app.search','app.editProcess']
          }
        })
        .state('app.createRisk', {
            url: '/risk/create',
            templateUrl: 'views/risk/createNewRisk.html',
            controller: 'RiskCtrl',
            data: {
                authenticate: true
            },
            resolve: {
                geoLocationData: function(){
                    return null;
                },
                erhData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/ENTR_REP_HRCHY/RISK');
                },
                rskEvntTypeData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/RISK_EVENT');
                },
                rskCausalTypeData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/RISK_CAUSE_TYPE');
                },
                rskImpactTypeData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/RISK_IMPACT_TYPE');
                },
                pageDisable: function(RcsaFactory){                	
                    return RcsaFactory.disableonOpenCycles();
                }
            },
            breadcrumb : {
              title: 'Create New Unaligned Risk',
              path: ['app.home', 'app.createRisk']
            }
        })
        .state('app.editRiskProcess', {
            url: '/risk/create/:processId',
            templateUrl: 'views/risk/createNewRisk.html',
            controller: 'RiskCtrl',
            data: {
                authenticate: true
            },
            resolve: {
                geoLocationData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/GEO_LOCAT');
                },
                erhData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/ENTR_REP_HRCHY/RISK');
                },
                rskEvntTypeData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/RISK_EVENT');
                },
                rskCausalTypeData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/RISK_CAUSE_TYPE');
                },
                rskImpactTypeData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/RISK_IMPACT_TYPE');
                },
                pageDisable: function(RcsaFactory){                	
                    return RcsaFactory.disableonOpenCycles();
                }
            }
         })
         .state('app.addPrcChallenge', {
            url: '/addEditChallenge/:processId',
            templateUrl: 'views/process/processChallenge.html',
            controller: 'ProcessChallengesCtrl',
            data: {
                authenticate: true
            },
            resolve: {
              originatGroupData: function($http){
                return $http.get('app/prcs/rest/cacheDropdown/RA_ASES_CHLNG_GRP');
              },
              outcomeResolutionData: function($http){
                return $http.get('app/prcs/rest/cacheDropdown/RA_CHLNG_OUTCOME');
              },
              challengThemesData: function($http){
                  return $http.get('app/prcs/rest/cacheDropdown/RA_CHLNG_THEME');
              },
              pageDisable: function(RcsaFactory){                	
            	  return RcsaFactory.disableonOpenCycles();
              }
            },
            breadcrumb: {
              title: 'Add Challenge',
              path: ['app.home','app.editProcess','app.addPrcChallenge']
          }
            
        })
        .state('app.editPrcChallenge', {
            url: '/editChallenge/:processId/:challengeKey',
            templateUrl: 'views/process/processChallenge.html',
            controller: 'ProcessChallengesCtrl',
            data: {
                authenticate: true
            },
            resolve: {
              originatGroupData: function($http){
                return $http.get('app/prcs/rest/cacheDropdown/RA_ASES_CHLNG_GRP');
              },
              outcomeResolutionData: function($http){
                return $http.get('app/prcs/rest/cacheDropdown/RA_CHLNG_OUTCOME');
              },
              challengThemesData: function($http){
                  return $http.get('app/prcs/rest/cacheDropdown/RA_CHLNG_THEME');
              },
              pageDisable: function(RcsaFactory){                	
            	  return RcsaFactory.disableonOpenCycles();
              }
            },
            breadcrumb: {
              title: 'Edit Challenge',
              path: ['app.home','app.editProcess','app.editPrcChallenge']
          }
        })
        .state('app.viewPrcChallenge', {
            url: '/viewChallenge/:processId/:challengeKey',
            templateUrl: 'views/process/processChallenge.html',
            controller: 'ProcessChallengesCtrl',
            data: {
                authenticate: true
            },
            resolve: {
              originatGroupData: function($http){
                return $http.get('app/prcs/rest/cacheDropdown/RA_ASES_CHLNG_GRP');
              },
              outcomeResolutionData: function($http){
                return $http.get('app/prcs/rest/cacheDropdown/RA_CHLNG_OUTCOME');
              },
              challengThemesData: function($http){
                  return $http.get('app/prcs/rest/cacheDropdown/RA_CHLNG_THEME');
              },
              pageDisable: function(RcsaFactory){                	
            	  return RcsaFactory.disableonOpenCycles();
              }
            },
            breadcrumb: {
              title: 'View Challenge',
              path: ['app.home','app.editProcess','app.viewPrcChallenge']
          }
        })
        .state('app.editRisk', {
            url: '/risk/:riskId?:from&:processId&:riskInProcessKey',
            templateUrl: 'views/risk/createNewRisk.html',
            controller: 'RiskCtrl',
            data: {
                authenticate: true
            },
            resolve: {
                geoLocationData: function(){
                    return null;
                },
                erhData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/ENTR_REP_HRCHY/RISK');
                },
                rskEvntTypeData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/RISK_EVENT');
                },
                rskCausalTypeData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/RISK_CAUSE_TYPE');
                },
                rskImpactTypeData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/RISK_IMPACT_TYPE');
                },
                pageDisable: function(RcsaFactory){                	
                    return RcsaFactory.disableonOpenCycles();
                }
            },
            breadcrumb : {
              title: 'Edit Risk',
              path: function($stateParams){
            	  //if same page launched from multiple screen us path as function and
            	  //differentiate using $stateParams
            	  if($stateParams.from==='editRiskInProcess'){
            		  return ['app.home','app.editProcess','app.alignRiskToProcess','app.editRisk'];
            	  }
            	  return ['app.home','app.search','app.editRisk'];
              }
            	
            }
        })
        .state('app.createControl', {
            url: '/createNewControl/:controls',
            templateUrl: 'views/control/createNewControl.html',
            controller: 'CreateControlCtrl',
            data: {
                authenticate: true
            },
            resolve: {
                geoLocationData: function(){
                    return null;
                },
                controlData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/ENTR_PRCS_CLAS_FWRK/CONTROL');
                },
                controlTypeData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/CONTROL_TYPE');
                },
                pageDisable: function(RcsaFactory){                	
                    return RcsaFactory.disableonOpenCycles();
                }
            },
            breadcrumb: {
              title: 'Create New Unaligned Control',
              path: ['app.home','app.createControl']
            }
        })
        .state('app.createAndAlignControl', {
            url: '/cnaCtrl/:processId/:rskKey?:from',
            templateUrl: 'views/control/createNewControl.html',
            controller: 'CreateControlCtrl',
            data: {
                authenticate: true
            },
            resolve: {
                geoLocationData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/GEO_LOCAT');
                },
                controlData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/ENTR_PRCS_CLAS_FWRK/CONTROL');
                },
                controlTypeData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/CONTROL_TYPE');
                },
                pageDisable: function(RcsaFactory){                	
                    return RcsaFactory.disableonOpenCycles();
                }
            },
            breadcrumb: {
              title: 'Align Control To Process',
              path: ['app.home','app.editProcess','app.createAndAlignControl']
            }
        })
        .state('app.editControl', {
            url: '/control/:controlId/:controlInProcessKey?:from&:processId',
            templateUrl: 'views/control/createNewControl.html',
            controller: 'CreateControlCtrl',
            data: {
                authenticate: true
            },
            resolve: {
                geoLocationData: function(){
                    return null;
                },
                controlData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/ENTR_PRCS_CLAS_FWRK/CONTROL');
                },
                controlTypeData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/CONTROL_TYPE');
                },
                pageDisable: function(RcsaFactory){                	
                    return RcsaFactory.disableonOpenCycles();
                }
            },
            breadcrumb: {
              title: 'Edit Control',
              path: function($stateParams){
            	  //if same page launched from multiple screen us path as function and
            	  //differentiate using $stateParams
            	  if($stateParams.from === 'editControlInProcess'){
            		  return ['app.home','app.editProcess','app.alignCtrlToProcess','app.editControl'];
            	  }
            	  return ['app.home','app.search', 'app.editControl'];
              }
            }
         })
        .state('app.uploadProcess', {
            url: '/uploadProcessInventory',
            templateUrl: 'views/upload/uploadProcessInventory.html',
            controller: 'UploadProcessInventory',
            data: {
                authenticate: true
            }
        })
        .state('app.search', {
            url: '/viewSearchInv',
            templateUrl: 'views/viewAll/viewSearchInv.html',
            controller: 'ViewSearchInvCtrl',
            data: {
                authenticate: true
            },
            breadcrumb: {
              title: 'View Search Inventory',
              path: ['app.home','app.search']
            }
        })
        .state('app.logout', {
            url: '/logout',
            controller: 'LogoutController'
        })
        .state('app.docs', {
            url: '/docs',
            templateUrl: 'views/docs.html'
        })
        .state('app.ratingQuestionnaire1', {
            url: '/createRtgQstnAir/:processId/:isNewQstnair',
            templateUrl: 'views/rating/ratingQuestionnaire.html',
            controller: 'RatingCtrl',
            resolve: {
                processPromiseObj: function (Rating) {
                    return Rating.getAllQuestions();
                },
                getDecisionList: function(Rating){
                    return Rating.getDropDownList('INHERIT_RISK_SCORE');
                }  
            },
            data: {
                authenticate: true
            },
            breadcrumb:{
              title: 'Create Process Rating Questionnaire - New',
              path: ['app.home', 'app.editProcess','app.ratingQuestionnaire1']
            }
        })
        .state('app.createAndAlignRisk', {
            url: '/risk/cnaRsk/:processId?:from',
            templateUrl: 'views/risk/createNewRisk.html',
            controller: 'RiskCtrl',
            data: {
                authenticate: true
            },
            resolve: {
                geoLocationData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/GEO_LOCAT');
                },
                erhData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/ENTR_REP_HRCHY/RISK');
                },
                rskEvntTypeData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/RISK_EVENT');
                },
                rskCausalTypeData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/RISK_CAUSE_TYPE');
                },
                rskImpactTypeData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/RISK_IMPACT_TYPE');  
                },
                pageDisable: function(RcsaFactory){                	
                    return RcsaFactory.disableonOpenCycles();
                }
            },
            breadcrumb: {
              title: 'Align Risk To Process',
              path: ['app.home','app.editProcess','app.createAndAlignRisk']
            }
        })
        .state('app.editProcessRatingQstn', {
            url: '/getProcessRating/:processId/:prcsSessionKey',
            templateUrl: 'views/rating/ratingQuestionnaire.html',
            controller: 'RatingCtrl',
            resolve: {
                processPromiseObj: function (Rating, $stateParams) {
                    return Rating.getAllUpdateQuestions($stateParams.prcsSessionKey);
                },
                getDecisionList: function(Rating){
                    return Rating.getDropDownList('INHERIT_RISK_SCORE');
                }  
            },
            data: {
                authenticate: true
            },
            breadcrumb:{
              title: 'Edit Process Rating Questionnaire',
              path: ['app.home', 'app.editProcess', 'app.editProcessRatingQstn']
            }
        })
        .state('app.viewProcessRatingQstn', {
            url: '/viewProcessRating/:processId/:prcsSessionKey',
            templateUrl: 'views/rating/ratingQuestionnaire.html',
            controller: 'RatingCtrl',
            resolve: {
                processPromiseObj: function (Rating, $stateParams) {
                    return Rating.getAllUpdateQuestions($stateParams.prcsSessionKey);
                },
				getDecisionList: function(Rating){
                    return Rating.getDropDownList('INHERIT_RISK_SCORE');
                }  
            },
            data: {
                authenticate: true
            },
            breadcrumb:{
              title: 'View Process Rating Questionnaire',
              path: ['app.home', 'app.editProcess', 'app.viewProcessRatingQstn']
            }
        })
        .state('app.alignRiskToProcess', {
            url: '/editRiskWithinProcess/:processId/:riskInProcessKey?:from',
            templateUrl: 'views/risk/createNewRisk.html',
            controller: 'RiskCtrl',
            data: {
                authenticate: true
            },
            resolve: {
                geoLocationData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/GEO_LOCAT');
                },
                erhData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/ENTR_REP_HRCHY/RISK');
                },
                rskEvntTypeData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/RISK_EVENT');
                },
                rskCausalTypeData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/RISK_CAUSE_TYPE');
                },
                rskImpactTypeData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/RISK_IMPACT_TYPE');
                },
                pageDisable: function(RcsaFactory){                	
                    return RcsaFactory.disableonOpenCycles();
                }
            },
            breadcrumb: {
              title: 'Edit Risk Aligned To Process',
              path: ['app.home','app.editProcess','app.alignRiskToProcess']
            }

        })
        .state('app.viewAlignRiskToProcess', {
            url: '/viewRiskWithinProcess/:processId/:riskInProcessKey?:from',
            templateUrl: 'views/risk/createNewRisk.html',
            controller: 'RiskCtrl',
            data: {
                authenticate: true
            },
            resolve: {
                geoLocationData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/GEO_LOCAT');
                },
                erhData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/ENTR_REP_HRCHY/RISK');
                },
                rskEvntTypeData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/RISK_EVENT');
                },
                rskCausalTypeData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/RISK_CAUSE_TYPE');
                },
                rskImpactTypeData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/RISK_IMPACT_TYPE');
                },
                pageDisable: function(RcsaFactory){                 
                    return RcsaFactory.disableonOpenCycles();
                }
            },
            breadcrumb: {
              title: 'Edit Risk Aligned To Process',
              path: ['app.home','app.editProcess','app.alignRiskToProcess']
            }

        })
        .state('app.alignCtrlToProcess', {
            url: '/getEditAlignControlToRiskToProcess/:controlId/:controlInProcessKey/:processId?:from',
            templateUrl: 'views/control/createNewControl.html',
            controller: 'CreateControlCtrl',
            data: {
                authenticate: true
            },
            resolve: {
                geoLocationData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/GEO_LOCAT');
                },
                controlData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/ENTR_PRCS_CLAS_FWRK/CONTROL');
                },
                controlTypeData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/CONTROL_TYPE');
                },
                pageDisable: function(RcsaFactory){                	
                    return RcsaFactory.disableonOpenCycles();
                }
            },
            breadcrumb: {
              title: 'Edit Control Aligned To Risk',
              path: ['app.home','app.editProcess','app.alignCtrlToProcess']
            }
        })
        .state('app.viewAlignCtrlToProcess', {
            url: '/getEditAlignControlToRiskToProcess/:controlId/:controlInProcessKey/:processId?:from',
            templateUrl: 'views/control/createNewControl.html',
            controller: 'CreateControlCtrl',
            data: {
                authenticate: true
            },
            resolve: {
                geoLocationData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/GEO_LOCAT');
                },
                controlData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/ENTR_PRCS_CLAS_FWRK/CONTROL');
                },
                controlTypeData: function($http){
                    return $http.get('app/prcs/rest/cacheDropdown/CONTROL_TYPE');
                },
                pageDisable: function(RcsaFactory){                 
                    return RcsaFactory.disableonOpenCycles();
                }
            },
            breadcrumb: {
              title: 'Edit Control Aligned To Process',
              path: ['app.home','app.editProcess','app.alignCtrlToProcess']
            }
        })

        //RCSA States
        .state('app.createRcsaCycle', {
            url: '/rcsa/create',
            templateUrl: 'views/rcsa/editRcsaCycle.html',
            controller: 'EditRcsaCycleCtrl',
            data: {
                authenticate: true
            },
            resolve: {
                classificationOptions: function (RcsaFactory) {
                    return RcsaFactory.getClassificationOptions();
                },
                summaryRatingLevelOptions: function (RcsaFactory) {
                    return RcsaFactory.getSummaryRatingLevelOptions();
                },
                cycleTypeOptions: function (RcsaFactory) {
                    return RcsaFactory.getCycleTypeOptions();
                },
                cycleStatusOptions: function (RcsaFactory) {
                    return RcsaFactory.getCycleStatusOptions();
                },
                populateFromOptions: function (RcsaFactory) {
                    return RcsaFactory.getPopulateFromOptions();
                },
                OplossValidationDateOptions: function(RcsaFactory){
                  return RcsaFactory.getOplossValidationDate();
                }
            },
            breadcrumb: {
              title: 'Create New RCSA Cycle',
              path: ['app.home','app.createRcsaCycle']
            }
        })
        .state('app.editRcsaCycle', {
            url: '/rcsa/editRcsaCycle/:rcsaCycleId/:refresh',
            templateUrl: 'views/rcsa/editRcsaCycle.html',
            controller: 'EditRcsaCycleCtrl',
            data: {
                authenticate: true
            },
            resolve: {
                classificationOptions: function (RcsaFactory) {
                    return RcsaFactory.getClassificationOptions();
                },
                summaryRatingLevelOptions: function (RcsaFactory) {
                    return RcsaFactory.getSummaryRatingLevelOptions();
                },
                cycleTypeOptions: function (RcsaFactory) {
                    return RcsaFactory.getCycleTypeOptions();
                },
                cycleStatusOptions: function (RcsaFactory) {
                    return RcsaFactory.getCycleStatusOptions();
                },
                populateFromOptions: function (RcsaFactory) {
                    return RcsaFactory.getPopulateFromOptions();
                },
                OplossValidationDateOptions: function(RcsaFactory){
                  return RcsaFactory.getOplossValidationDate();
                }
            },
            breadcrumb: {
              title: 'Edit RCSA Cycle',
              path: ['app.home','app.searchRcsaCycle','app.editRcsaCycle']
            }
        })
        .state('app.addRcsaAssessment', {
            url: '/rcsa/addAssessment/:rcsaCycleId',
            templateUrl: 'views/rcsa/addRcsaAssessment.html',
            controller: 'rcsaAssessmentCtrl',
            data: {
                authenticate: true
            },
            resolve: {
                geoLocationData: function($http, $stateParams, OrcitLoader){
                    return OrcitLoader.load($http.get('app/rcsa/rest/cacheDropdown/GEO_LOCAT/'+$stateParams.rcsaCycleId));
                },
                legalEntityData: function($http, $stateParams, OrcitLoader){
                    return OrcitLoader.load($http.get('app/rcsa/rest/cacheDropdown/LEGAL_ENTITY/'+$stateParams.rcsaCycleId));
                },
                processData: function($http, $stateParams, OrcitLoader){
                    return OrcitLoader.load($http.get('app/rcsa/rest/cacheDropdown/ENTR_REP_HRCHY/'+$stateParams.rcsaCycleId));
                },
                cycleData : function(RcsaFactory, $stateParams){
                    return RcsaFactory.cycleData($stateParams.rcsaCycleId);
                },
                assessmentOptions: function (rcsaAssessmentFactory) {
                    return rcsaAssessmentFactory.getAssessmentOptions();
                }
            },
            breadcrumb: {
              title: 'Add Assessment To RCSA Cycle',
              path: ['app.home', 'app.editRcsaCycle','app.addRcsaAssessment']
            }
        })
        .state('app.editRcsaAssessment', {
            url: '/rcsa/editAssessment/:assessmentId/:refresh',
            templateUrl: 'views/assessment/editAssessment.html',
            controller: 'EditAssessmentCtrl',
            data: {
                authenticate: true
            },
            resolve:{
            	OplossValidationDateOptions: function(RcsaFactory){
                    return RcsaFactory.getOplossValidationDate();
                  }
            },
            breadcrumb: {
              title: 'Edit Assessment',
              path: ['app.home','app.viewRcsaAssessment','app.editRcsaAssessment']
            }
        })
        .state('app.viewRcsaAssessment', {
            url: '/rcsa/viewAssessment',
            templateUrl: 'views/rcsa/viewRcsaAssessment.html',
            controller: 'viewAssessmentCtrl',
            data: {
                authenticate: true
            },
            resolve: {
              cycleTypeOptions: function (RcsaFactory) {
                  return RcsaFactory.getCycleTypeOptions();
              },
              assessmentStatusOptions: function (RcsaFactory) {
                  return RcsaFactory.assessmentStatusOptions();
              }
          },
            breadcrumb: {
              title: 'View Search Assessments',
              path: ['app.home','app.viewRcsaAssessment']
            }
        })
        .state('app.editSummaryGrid', {
            url: '/rcsa/editSummaryRating/:assessmentId',
            templateUrl: 'views/editRcsaSummaryRating/summaryDetails.html',
            controller: 'editRcsaSummaryRatingCtrl',
            data: {
                authenticate: true
            },
            resolve: {
                utilList : function(rcsaAssessmentFactory, $stateParams){
              	  return rcsaAssessmentFactory.utilList($stateParams.assessmentId);
                } 
            },
            breadcrumb: {
              title: 'Edit Summary Rating',
              path: ['app.home','app.editRcsaAssessment','app.editSummaryGrid']
            }
        })
        .state('app.editQuestionnaire', {
            url: '/rcsa/editQuestionnaire/:assessmentId',
            templateUrl: 'views/rcsa/editQuestionnaire.html',
            controller: 'editQuestionnaireCtrl',
            data: {
                authenticate: true
            },
            resolve: {
                utilList : function(rcsaAssessmentFactory, $stateParams){
              	  return rcsaAssessmentFactory.utilList($stateParams.assessmentId);
                } 
            },
            breadcrumb: {
              title: 'Edit Assessment Questionnaire',
              path: ['app.home','app.editRcsaAssessment','app.editQuestionnaire']
            }
        })
        .state('app.editAssessmentFromCycle', {
            url: '/rcsa/editAssessmentFromCycle/:assessmentId/:rcsaCycleId',
            templateUrl: 'views/rcsa/addRcsaAssessment.html',
            controller: 'rcsaAssessmentCtrl',
            data: {
                authenticate: true
            },
            resolve: {
            	geoLocationData: function($http, $stateParams, OrcitLoader){
                    return OrcitLoader.load($http.get('app/rcsa/rest/cacheDropdown/GEO_LOCAT/'+$stateParams.rcsaCycleId));
                },
                legalEntityData: function($http, $stateParams, OrcitLoader){
                    return OrcitLoader.load($http.get('app/rcsa/rest/cacheDropdown/LEGAL_ENTITY/'+$stateParams.rcsaCycleId));
                },
                processData: function($http, $stateParams, OrcitLoader){
                    return OrcitLoader.load($http.get('app/rcsa/rest/cacheDropdown/ENTR_REP_HRCHY/'+$stateParams.rcsaCycleId));
                },
                cycleData : function(RcsaFactory, $stateParams){
                    return RcsaFactory.cycleData($stateParams.rcsaCycleId);
                },
                assessmentOptions: function (rcsaAssessmentFactory) {
                    return rcsaAssessmentFactory.getAssessmentOptions();
                }
            },
            breadcrumb: {
              title: 'Edit Assessment In Cycle',
              path: ['app.home','app.editRcsaCycle','app.editAssessmentFromCycle']
            }
        })
        .state('app.viewAssessmentFromCycle', {
            url: '/rcsa/viewAssessmentFromCycle/:assessmentId/:rcsaCycleId',
            templateUrl: 'views/rcsa/addRcsaAssessment.html',
            controller: 'rcsaAssessmentCtrl',
            data: {
                authenticate: true
            },
            resolve: {
            	geoLocationData: function($http, $stateParams, OrcitLoader){
                    return OrcitLoader.load($http.get('app/rcsa/rest/cacheDropdown/GEO_LOCAT/'+$stateParams.rcsaCycleId));
                },
                legalEntityData: function($http, $stateParams, OrcitLoader){
                    return OrcitLoader.load($http.get('app/rcsa/rest/cacheDropdown/LEGAL_ENTITY/'+$stateParams.rcsaCycleId));
                },
                processData: function($http, $stateParams, OrcitLoader){
                    return OrcitLoader.load($http.get('app/rcsa/rest/cacheDropdown/ENTR_REP_HRCHY/'+$stateParams.rcsaCycleId));
                },
                cycleData : function(RcsaFactory, $stateParams){
                    return RcsaFactory.cycleData($stateParams.rcsaCycleId);
                },
                assessmentOptions: function (rcsaAssessmentFactory) {
                    return rcsaAssessmentFactory.getAssessmentOptions();
                }
            },
            breadcrumb: {
              title: 'View Assessment In Cycle',
              path: ['app.home','app.editRcsaCycle','app.viewAssessmentFromCycle']
            }
        })
        .state('app.searchRcsaCycle', {
            url: '/rcsa/viewSearchCycles',
            templateUrl: 'views/viewSearchRcsa/viewSearchRcsaCycles.html',
            controller: 'ViewSearchRcsaCtrl',
            data: {
                authenticate: true
            },
            breadcrumb: {
              title: 'View Search Cycles',
              path: ['app.home','app.searchRcsaCycle']
            }
        })
        .state('app.addAttestor', {
            url: '/rcsa/addEditAttestor/:assessmentId',
            templateUrl: 'views/attestor/addAttestor.html',
            controller: 'attestorCtrl',
            data: {
                authenticate: true
            },
            resolve: {
                utilList : function(rcsaAssessmentFactory, $stateParams){
              	  return rcsaAssessmentFactory.utilList($stateParams.assessmentId);
                } 
             },
            breadcrumb: {
              title: 'Add / Edit Attester',
              path: ['app.home','app.editRcsaAssessment','app.addAttestor']
            }
        })
        .state('app.addRcsaChallenge', {
            url: '/rcsa/addRcsaChallenge/:assessmentId',
            templateUrl: 'views/challenge/addChallenge.html',
            controller: 'ChallengesCtrl',
            data: {
                authenticate: true
            },
            resolve: {
              originatGroupData: function($http){
                return $http.get('app/prcs/rest/cacheDropdown/RA_ASES_CHLNG_GRP');
              },
              outcomeResolutionData: function($http){
                return $http.get('app/prcs/rest/cacheDropdown/RA_CHLNG_OUTCOME');
              },
              challengThemesData: function($http){
                  return $http.get('app/prcs/rest/cacheDropdown/RA_CHLNG_THEME');
              },
              utilList : function(rcsaAssessmentFactory, $stateParams){
            	  return rcsaAssessmentFactory.utilList($stateParams.assessmentId);
              } 
            },
            breadcrumb: {
              title: 'Add Challenge',
              path: ['app.home','app.editRcsaAssessment','app.addRcsaChallenge']
          },
        })
        .state('app.editRcsaChallenge', {
            url: '/rcsa/editRcsaChallenge/:assessmentId/:challengeKey',
            templateUrl: 'views/challenge/addChallenge.html',
            controller: 'ChallengesCtrl',
            data: {
                authenticate: true
            },
            resolve: {
              originatGroupData: function($http){
                return $http.get('app/prcs/rest/cacheDropdown/RA_ASES_CHLNG_GRP');
              },
              outcomeResolutionData: function($http){
                return $http.get('app/prcs/rest/cacheDropdown/RA_CHLNG_OUTCOME');
              },
              challengThemesData: function($http){
                  return $http.get('app/prcs/rest/cacheDropdown/RA_CHLNG_THEME');
              },
              utilList : function(rcsaAssessmentFactory, $stateParams){
          	  return rcsaAssessmentFactory.utilList($stateParams.assessmentId);
              } 
            },
            breadcrumb: {
              title: 'Edit Challenge',
              path: ['app.home','app.editRcsaAssessment','app.editRcsaChallenge']
          }
        })
        .state('app.viewRcsaChallenge', {
            url: '/rcsa/viewRcsaChallenge/:assessmentId/:challengeKey',
            templateUrl: 'views/challenge/addChallenge.html',
            controller: 'ChallengesCtrl',
            data: {
                authenticate: true
            },
            resolve: {
              originatGroupData: function($http){
                return $http.get('app/prcs/rest/cacheDropdown/RA_ASES_CHLNG_GRP');
              },
              outcomeResolutionData: function($http){
                return $http.get('app/prcs/rest/cacheDropdown/RA_CHLNG_OUTCOME');
              },
              challengThemesData: function($http){
                  return $http.get('app/prcs/rest/cacheDropdown/RA_CHLNG_THEME');
              },
              utilList : function(rcsaAssessmentFactory, $stateParams){
              	  return rcsaAssessmentFactory.utilList($stateParams.assessmentId);
              }
            },
            breadcrumb: {
              title: 'View Challenge',
              path: ['app.home','app.editRcsaAssessment','app.viewRcsaChallenge']
          }
        })
        .state('app.viewEndToEndEpcf', {
            url: '/viewEndToEnd/epcf',
            templateUrl: 'views/viewEndToEnd/viewEndToEndEpcf.html',
            controller: 'ViewEndToEndCtrl',
            data: {
                authenticate: true
            },
            breadcrumb: {
              title: 'View End-to-End EPCF',
              path: ['app.home','app.viewEndToEndEpcf']
            }
        })
        .state('app.viewEndToEndErh', {
            url: '/viewEndToEnd/erh',
            templateUrl: 'views/viewEndToEnd/viewEndToEndErh.html',
            controller: 'ViewEndToEndErhCtrl',
            data: {
                authenticate: true
            },
            breadcrumb: {
              title: 'View End-to-End ERH',
              path: ['app.home','app.viewEndToEndErh']
            }
        })
        .state('app.prcUpload', {
            url: '/prcFileUpload/prc',
            templateUrl: 'views/upload/prcUpload.html',
            controller: 'PrcUploadCtrl',
            data: {
                authenticate: true
            },
            resolve: {
              origSourceData: function($http){
                return $http.get('app/prcs/rest/cacheDropdown/ORIG_SRC_SYS');
              },
              erhData: function($http){
                return $http.get('app/prcs/rest/cacheDropdown/ENTR_REP_HRCHY/INVENTORY_VIEWER');
             },
             designDataUrl: function($http){
            	 return $http.get('app/dataUpload/desginDataUploadurl');
             }
            },
            breadcrumb: {
              title: 'Upload Process Inventory/PRT',
              path: ['app.home','app.prcUpload']
            }
        })
        .state('app.ratingsUpload', {
            url: '/fileUpload/ratings',
            templateUrl: 'views/upload/ratingsUpload.html',
            controller: '',// create controller for upload
            data: {
                authenticate: true
            },
            breadcrumb: {
              title: 'View End-to-End ERH',
              path: ['app.home','app.viewEndToEndErh']
            }
        }).state('app.adminNotification', {
            url: '/admin/notification',
            templateUrl: 'views/admin/notification.html',
            controller: 'NotificationCtrl',
            data: {
                authenticate: true
            },
            breadcrumb: {
              title: 'Notification Administration',
              path: ['app.home','app.adminNotification']
            }
        }).state('app.prtQuestionnaireMaintenance', {
            url: '/admin/PRTQuestionnaire',
            templateUrl: 'views/admin/PRTQuestionnaireMaintenance.html',
            controller: 'QuestionnaireMaintenanceCtrl',
            data: {
                authenticate: true
            },
            breadcrumb: {
              title: 'PRT Questionnaire Maintenance',
              path: ['app.home','app.prtQuestionnaireMaintenance']
            }
        });

    // initialize get if not there
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
    }
    //disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
    // extra
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    
    $tooltipProvider.options({ 
      appendToBody: true 
    });

}).constant('appConfiguration', {
    xAuthTokenHeaderName: 'x-auth-token'
});
