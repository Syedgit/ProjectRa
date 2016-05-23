// TODO: This directive has implemented for Upload inventory to see the progress of uploading files
angular.module('progressStepbar', []).directive('progressStepbar', function () {
    'use strict';
    return {
        restrict: 'E',
        scope:{
        	currentStep:'@',
        	stepbarText:'='
        },
        templateUrl:'views/upload/progressStepbar.html',
        link:function(scope){
        	var agnActiveflag = function(flag){
        		angular.forEach(scope.stepbarText, function (item) {
                    if(flag === item.id){
                    	scope.currentFlag = flag;
                    }                    	
                });//forEach ends
        	};
        	
        	agnActiveflag(scope.currentStep);
        	scope.$watch('currentStep',function(newVal){
        		console.log('scopeval',newVal);
        		agnActiveflag(newVal);
        	});
        	
        }
        
    };
});
// TODO: rename this directive/module to something better than 'myMaxlength' please.
angular.module('myMaxlength', []).directive('myMaxlength', function () {
    'use strict';
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            attrs.$set('ngTrim', 'false');
            var maxlength = parseInt(attrs.myMaxlength, 10);
            ctrl.$parsers.push(function (value) {
                if (value.length > maxlength) {
                    value = value.substr(0, maxlength);
                    ctrl.$setViewValue(value);
                    ctrl.$render();
                }
                return value;

            });

        }
    };
});

angular.module('disablePageElements', []).directive('disablePageElements', function ($compile, $rootScope, $timeout) {
    'use strict';
    return {
    	restrict: 'A',
    	replace: true,
    	priority: 700,
    	link : function (scope, element, attrs) {                    
	        var disableElements = function(inputs){        	
				angular.forEach(inputs, function(el){
					el = angular.element(el);
					var className = angular.element(el).attr('class');
					if(angular.isUndefined(className) || !angular.isUndefined(className) && className.indexOf('ignoreDisable') === -1){
						var prevVal = el.attr('ng-disabled');
						prevVal = prevVal? prevVal +  ' || true': 'true';				
						el.attr('ng-disabled', prevVal);						
						$compile(el)(scope);
					}					
				});
	        };
	        
	        var disableButtons = function(inputs){          
                angular.forEach(inputs, function(el){
                       el = angular.element(el);
                       var className = angular.element(el).attr('class');
                       if(angular.isUndefined(className) || !angular.isUndefined(className) && className.indexOf('ignoreDisable') === -1){
                              var prevVal = el.attr('ng-disabled');
                              prevVal = prevVal? prevVal +  ' || true': 'true';                           
                              el.attr('ng-disabled', prevVal);
                              
                              var classPrevVal = el.attr('class');
//                              if(classPrevVal.indexOf('disableSaveCls') === -1){
//                            	  classPrevVal = classPrevVal ? classPrevVal +  ' btn btn-primary disableSaveCls': ' btn btn-primary disableSaveCls';
//                              }
                              el.attr('class', classPrevVal);
                              
                              $compile(el)(scope);
                       }                                 
                });
	        };
        	        
	        var disableOrcitMultiSelect = function(inputs){
	        	angular.forEach(inputs, function(el){
	        		el = angular.element(el);
	        		var prevVal = el.attr('ng-disabled');
					prevVal = prevVal? prevVal +  ' || true': 'true';				
					el.attr('ng-disabled', prevVal);
					$compile(el)(scope);
	        	});	        	
	        };
	        	        
	        var disableAnchors = function(inputs){        	
				angular.forEach(inputs, function(el){
					el = angular.element(el);
					var className = el.attr('class');
					var tableHeader = el.parent().attr('role');
					var noHeader = angular.isUndefined(tableHeader) || ( !angular.isUndefined(tableHeader) &&  tableHeader.indexOf('columnheader') === -1 ) ;
					var noigNoreDisableClass = angular.isUndefined(className) || (!angular.isUndefined(className) && className.indexOf('k-minus') === -1	&& className.indexOf('k-plus') === -1 && className.indexOf('ignoreDisable') === -1);
					
					if(noHeader && noigNoreDisableClass){
						/*var prevVal = null;
						if(el.attr('ng-show')){
							prevVal = el.attr('ng-show');
							prevVal = prevVal? prevVal +  ' && false': 'false';
							el.attr('ng-show', prevVal);							
						}
						else{
							prevVal = el.attr('ng-hide');
							prevVal = prevVal? prevVal +  ' || true': 'true';
							el.attr('ng-hide','true');
						}	*/	
						el.attr('ng-if', 'false');
						$compile(el)(scope);
					}					
				});
	        };
                
	        var kendoListener = function(){
	        	attrs.$observe('disablePageElements', function (value) {
	        		$timeout(function(){
			        	if(value !== ''){
			        		disableAnchors(element.find('tbody').find('a'));
			        		disableElements(element.find('input'));
		        			disableElements(element.find('textarea'));
		        			disableElements(element.find('select'));
		        			disableElements(element.find('radio'));
		        			disableElements(element.find('checkbox'));
		        			disableButtons(element.find('button'));			        		
			        	}
	        		},0);
		        });
	        };
	        	        
	        var ngViewListener = function(){
	        	scope.$on('$viewContentLoaded', function () {
	        		$timeout(function(){	        			
        				scope.alignCtrlToprcswin = true;
	        			disableElements(element.find('input'));
	        			disableElements(element.find('textarea'));
	        			disableElements(element.find('select'));
	        			disableElements(element.find('radio'));
	        			disableElements(element.find('checkbox'));
	        			disableButtons(element.find('button'));
	        			disableOrcitMultiSelect(element.find('orcit-multiselect-treeview'));	        			
	        		},0);	        				        	
		        });
	        };
	        
	        var disableInnerElements = function(){
	        	disableElements(element.find('input'));
    			disableElements(element.find('textarea'));
    			disableElements(element.find('select'));
    			disableElements(element.find('radio'));
    			disableElements(element.find('checkbox'));
    			disableButtons(element.find('button'));
    			disableOrcitMultiSelect(element.find('orcit-multiselect-treeview'));
	        };
                        
	        var disablePRCelements = function(){
	        	if(!angular.isUndefined(scope.prcLockDownFlag) && scope.prcLockDownFlag){	        		
           			ngViewListener();
        			kendoListener(); 
        			disableInnerElements();
	        	}	        	
	        };
	        
	        var disableChallenges = function(){        	
	        	if(!angular.isUndefined(scope.prcChallengesLockDownFlag) && scope.prcChallengesLockDownFlag){	        		
           			ngViewListener();
        			kendoListener(); 
        			disableInnerElements();
	        	}	        	
	        };
	        
	        if(attrs.disablelevel === 'PRC'){	        
	        	disablePRCelements();	
	        }
	        else if(attrs.disablelevel === 'challenges'){
	        	disableChallenges();
	        }	        
    	}
    };
});


//kendo validator for multi tree view
kendo.ui.Validator.prototype.validateInput = function (input) {
	'use strict';
    input = $(input);

    var that = this,
        template = that._errorTemplate,
        result = that._checkValidity(input),
        valid = result.valid,
        className = '.k-invalid-msg',
        fieldName = (input.attr('name') || ''),
        lbl = input.parent().find('span' + className).hide(),
        messageText;

    input.removeAttr('aria-invalid');

    if (!valid) {
        messageText = that._extractMessage(input, result.key);
        that._errors[fieldName] = messageText;
        var messageLabel = $(template({
            message: messageText
        }));

        that._decorateMessageContainer(messageLabel, fieldName);

        if (!lbl.replaceWith(messageLabel).length) {
            messageLabel.insertAfter(input);
        }
        messageLabel.show();

        input.attr('aria-invalid', true);
    }
    input.toggleClass('k-invalid', !valid);

    return valid;
};