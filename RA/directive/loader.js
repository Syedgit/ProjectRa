/**
 * @ngdoc module
 * @name orcit.loader
 * @description angular module for loader tools
 */
angular.module('orcit.loader', [])
/**
 * @ngdoc value
 * @name orcitLoaderValues
 * @module orcit.loader
 * @description shared values used for the orcit.loader service and directive
 */
    .value('orcitLoaderValues', (function(){
        'use strict';

        // Builds an svg spinner element
        var spinner = function (size) {
            size = size || 128;
            return [
                '<svg class="orcit-loader-spinner" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"',
                'width="', size, '" height="', size, '"',
                'viewBox="0 0 128 128" enable-background="new 0 0 128 128" xml:space="preserve">',
                '<g id="_x31_6x16_Spinner.psd" display="none">',
                '<defs>',
                '<rect id="SVGID_1_" width="128" height="128"/>',
                '</defs>',
                '<clipPath id="SVGID_2_" display="inline">',
                '<use xlink:href="#SVGID_1_"  overflow="visible"/>',
                '</clipPath>',
                '<g display="inline" clip-path="url(#SVGID_2_)">',
                '<image overflow="visible" width="16" height="16" id="Layer_1_1_" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAFiAAABYgFfJ9BTAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAWVJREFUeNqM098rQ3EYx/FzdhghbcWW/GiKxKK2SKTcrP0PuFP+ABf+AP+Cf8OVe5dquMEVlgsZkhiFIys/3t/6HH2ds+GpV+1s5zzPs+f5HseJRsz6XMQmPOef0YMNZHW9ghslaFbCoUbVTHxgFmu6bkUN70qawrP9gGdVbsMtrrCMYwwghx2M4RRlddMF31MXq1jCo27Oq5ttXffjBbvoxhxGcOaqgwwWMKUK60rwZnUaU+JhVHGkbn/EJBbrzCaIrCp/h+mggDQ+NawSLhokaMc44nrWb9IwUkpQ+2PnprNOtChBpNNeTOjHepHRPZE1mn1PY0brLGuI4cirgOniwXTsqlpR6zG7P9H/fMK5iiR1AktaaU7z2vKsYQaHJKl1VtCHUVyrsq8CFZ3IuyBBVV+Y6c7jFXsYRAL76FCySx24ezP48BQTmvCBthIT0+GhEqd/extdDdQeWsHaSjy85i8BBgAjbUmTDlLqrAAAAABJRU5ErkJggg==" transform="matrix(8 0 0 8 0 0)">',
                '</image>',
                '</g>',
                '</g>',
                '<line fill="none" stroke="#363636" stroke-width="12" stroke-linecap="round" stroke-miterlimit="10" x1="64.001" y1="8.125" x2="64.001" y2="27.762"/>',
                '<line fill="none" stroke="#484848" stroke-width="12" stroke-linecap="round" stroke-miterlimit="10" x1="36.062" y1="15.611" x2="45.88" y2="32.618"/>',
                '<line fill="none" stroke="#5A5A5A" stroke-width="12" stroke-linecap="round" stroke-miterlimit="10" x1="15.611" y1="36.062" x2="32.618" y2="45.882"/>',
                '<line fill="none" stroke="#6C6C6C" stroke-width="12" stroke-linecap="round" stroke-miterlimit="10" x1="8.126" y1="64" x2="27.764" y2="64"/>',
                '<line fill="none" stroke="#7E7E7E" stroke-width="12" stroke-linecap="round" stroke-miterlimit="10" x1="15.612" y1="91.938" x2="32.619" y2="82.117"/>',
                '<line fill="none" stroke="#909090" stroke-width="12" stroke-linecap="round" stroke-miterlimit="10" x1="36.064" y1="112.389" x2="45.883" y2="95.381"/>',
                '<line fill="none" stroke="#A2A2A2" stroke-width="12" stroke-linecap="round" stroke-miterlimit="10" x1="64.001" y1="119.873" x2="64.001" y2="100.237"/>',
                '<line fill="none" stroke="#B4B4B4" stroke-width="12" stroke-linecap="round" stroke-miterlimit="10" x1="91.939" y1="112.387" x2="82.121" y2="95.381"/>',
                '<line fill="none" stroke="#C6C6C6" stroke-width="12" stroke-linecap="round" stroke-miterlimit="10" x1="112.391" y1="91.935" x2="95.386" y2="82.116"/>',
                '<line fill="none" stroke="#000000" stroke-width="12" stroke-linecap="round" stroke-miterlimit="10" x1="119.875" y1="63.997" x2="100.241" y2="63.998"/>',
                '<line fill="none" stroke="#121212" stroke-width="12" stroke-linecap="round" stroke-miterlimit="10" x1="112.389" y1="36.06" x2="95.384" y2="45.877"/>',
                '<line fill="none" stroke="#242424" stroke-width="12" stroke-linecap="round" stroke-miterlimit="10" x1="91.937" y1="15.609" x2="82.118" y2="32.614"/>',
                '</svg>'
            ].join('');
        };

        // Takes data, and returns a promise-chainable function
        var dataAsFunction = function (input) {
            var output;

            if (typeof input === 'function') {
                // If we already have a function, we're good to return it as-is
                output = input;
            } else if (Array.isArray(input) && typeof input[0] === 'function') {
                // If we have an array and the first index is a function, treat it as a function and argument list
                output = function () {
                    var arr = input.slice(0); // Clones input into arr
                    return arr.shift().apply(this, arr); // Calls the first index, passing the rest as arguments
                };
            } else if (typeof input === 'undefined') {
                // If we have undefined input, return a function that returns an empty array
                output = function () { return []; };
            } else {
                // Otherwise we have actual data, and should just wrap it in a function
                output = function () { return input; };
            }

            return output;
        };

        return {
            spinner: spinner,
            dataAsFunction: dataAsFunction
        };
    })())
/**
 * @ngdoc factory
 * @name OrcitLoader
 * @module orcit.loader
 * @description angular service for overlaying the entire page with a spinner when loading data
 */
    .factory('OrcitLoader', function (orcitLoaderValues) {
        'use strict';

        var state = 0,
            body = angular.element(document.body),
            spinner = angular.element(orcitLoaderValues.spinner('6em')),
            overlay = angular.element('<div class="orcit-loader-overlay"></div>').append(spinner),
            addOverlay = function(){
                body.append(overlay);
            },
            removeOverlay = function(){
                overlay.remove();
            },
            incrementLoader = function(){
                state++;
                showOrHideLoaderByState();
            },
            decrementLoader = function(){
                state--;
                showOrHideLoaderByState();
            },
            showOrHideLoaderByState = function(){
                (state) ? addOverlay() : removeOverlay();
            },
            load = function (promise) {
                if (typeof promise.then !== 'function') {
                    throw new Error('Must provide a then-able promise as first argument');
                }
                incrementLoader();
                promise.then(decrementLoader, decrementLoader);
                return promise;
            };

        return {
            show: addOverlay,
            hide: removeOverlay,
            increment: incrementLoader,
            decrement: decrementLoader,
            load: load
        };
    })
/**
 * @ngdoc directive
 * @name orcitLoader
 * @module orcit.loader
 * @description angular directive for wrapping content behind a spinner when loading data
 */
    .directive('orcitLoader', function () {
        'use strict';

        return {
            controller: function ($scope, $element, $attrs, $q, $transclude, orcitLoaderValues) {
                var state = 0,
                    spinner = angular.element(orcitLoaderValues.spinner)(),
                    overlay = angular.element('<div class="orcit-loader-overlay"></div>').append(spinner),
                    transcludeScope = $scope.$parent.$new(),
                    defaultError = function (error) {
                        console.log('Error loading data: ', error);
                    },
                    defaultSuccess = function (data) {
                        console.log('Data loaded: ', data);
                    },
                    addOverlay = function () {
                        $element.find('.orcit-loader-wrapper').append(overlay);
                    },
                    removeOverlay = function () {
                        overlay.remove();
                    },
                    incrementLoader = function () {
                        state++;
                        showOrHideLoaderByState();
                    },
                    decrementLoader = function () {
                        state--;
                        showOrHideLoaderByState();
                    },
                    showOrHideLoaderByState = function () {
                        (state) ? addOverlay() : removeOverlay();
                    },
                    loadData = function (data) {
                        var getData = orcitLoaderValues.dataAsFunction(data);

                        $q.when()
                            .then(incrementLoader)
                            .then(getData)
                            .then($scope.loader.prepare || function (input) { return input; })
                            .then(setScopeData)
                            .then($scope.loader.success || defaultSuccess)
                            .catch($scope.loader.error || defaultError)
                            .finally(decrementLoader);
                    },
                    setScopeData = function (data) {
                        transcludeScope.data = data;
                        return data;
                    };

                    $scope.$watch('size', function (value) {
                        value = (value) ? value : '4.5em';
                        spinner.attr('height', value);
                        spinner.attr('width', value);
                    });

                    // Manual transclusion allows us to provide a manually completed scope,
                    // making modifying the transcluded scope easier.
                    $transclude(transcludeScope, function(clone, scope) {
                        $element.append(clone);
                    });

                    $scope.loader = $scope.loader || {};
                    $scope.loader.load = loadData;
                    $scope.loader.show = addOverlay;
                    $scope.loader.hide = removeOverlay;
                    $scope.loader.increment = incrementLoader;
                    $scope.loader.decrement = decrementLoader;
            },
            scope: {
                loader: '=orcitScope',
                size: '@orcitSize'
            },
            transclude: true,
            template: '<div class="orcit-loader-wrapper"></div>'
        };
    });
