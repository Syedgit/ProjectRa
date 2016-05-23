angular.module('orcit.multiselectTreeview', [
    'kendo.directives',
    'ui.bootstrap'
]).directive('orcitMultiselectTreeview', function (OrcitMultiselectTreeview) {
    'use strict';

    return {
        restrict: 'E',
        require: 'ngModel',
        scope: {
            closeOnSelect: '=oCloseOnSelect',
            id: '@',
            dataTextField: '=oDataTextField',
            dataValueField: '=oDataValueField',
            disableChildren: '=oDisableChildren',
            disableParents: '=oDisableParents',
            disableTopLevel: '=oDisableTopLevel',
            kendoTreeView: '=?oKendoTreeView',
            maxSelectable: '=oMaxSelectable',
            menuHeight: '=oMenuHeight',
            placeholder: '@',
            selectChildren: '=oSelectChildren',
            tags: '=ngModel',
            treeData: '=oTreeData'
        },
        template: [
            '<div class="orcitMultiselectTreeview" ng-class="{\'orcitMultiselectTreeview--disabled\': isDisabled}">',
            '    <div class="orcitMultiselectTreeviewTagList" ng-click="open()" ng-if="tags.length">',
            '        <div ng-repeat="tag in tags track by tag[options.dataValueField]" class="orcitMultiselectTreeviewTagItem">',
            '            {{tag[options.dataTextField]}}',
            '            <span ng-click="removeItem(tag)" class="orcitMultiselectTreeviewTagRemove">&times;</span>',
            '        </div>',
            '    </div>',
            '    <input type="text" id="{{id}}" class="form-control orcitMultiselectTreeviewInput" ng-keydown="suppressInput($event)" placeholder="{{placeholder}}" ng-click="open()" ng-focus="open()" ng-show="!tags.length" ng-disabled="isDisabled" />',
            '    <div class="orcitMultiselectTreeviewDropdown" ng-if="dropdownInitialized">',
            '        <div ng-class="{orcitMultiselectTreeviewDropdownInner: true, orcitMultiselectTreeviewDropdownInnerOpen: isOpen}" ng-style="{maxHeight: isOpen ? (menuHeight || 350) : 0}">',
            '            <div kendo-tree-view="$parent.kendoTreeView"',
            '                k-data-source="treeDataSource"',
            '                k-options="treeOptions"',
            '                k-on-select="onSelect(kendoEvent)"',
            '                class="orcitMultiselectTreeviewTree"></div>',
            '        </div>',
            '    </div>',
            '</div>'
        ].join(''),
        link: {
            pre: function (scope, elem, attrs, ngModelCtrl) {
                // console.info('Orcit Multiselect Treeview Directive pre-link');

                // if (!Array.isArray(scope.tags)) {
                //     throw new Error('Invalid ngModel, must be array: ' + JSON.stringify(scope.ngModel));
                // }

                // Defaults
                scope.options = {
                    dataTextField: scope.dataTextField || 'text',
                    dataValueField: scope.dataValueField || 'id'
                };

                // ng-required
                ngModelCtrl.$isEmpty = function (value) {
                    return !value || !value.length;
                };

                // ng-disabled
                attrs.$observe('disabled', function () {
                    scope.isDisabled = attrs.disabled;
                });

                // id attribute is moved to input element so `for` attribute works correctly
                var deregister = scope.$watch(function () {
                    return elem.attr('id');
                }, function () {
                    var id = elem.attr('id');
                    if (id) {
                        elem.attr('id', null);
                        scope.id = id;
                        deregister();
                    }
                });

                // Prevent typing in the fake input field
                elem.find('.orcitMultiselectTreeviewInput').on('change', function () {
                    $(this).val('');
                });
                scope.suppressInput = function (e) {
                    e.preventDefault();
                };

                // Fix IE page jump on click
                // http://www.telerik.com/forums/kendo-ui-treeview-page-jump-in-internet-explorer#25YYp8ozb0KKqYffd90RkA
                scope.$watch('kendoTreeView', function () {
                    if (scope.kendoTreeView) {
                        scope.kendoTreeView.wrapper.off('focus keydown');
                        scope.kendoTreeView.focus = function () {};
                    }
                });

                scope.treeOptions = {
                    template: '<orcit-multiselect-treeview-item item="dataItem" />'
                };
                function setDataSource() {
                    scope.treeDataSource = new kendo.data.HierarchicalDataSource({
                        data: scope.treeData,
                        schema: {
                            model: {
                                id: scope.options.dataValueField,
                                children: 'items',
                                hasChildren: function (item) {
                                    return Boolean(item.items && item.items.length);
                                }
                            }
                        }
                    });

                    // Force Kendo UI widget to update data source if already existing
                    // This should not be necessary but it works
                    if (scope.kendoTreeView) {
                        scope.kendoTreeView.setDataSource(scope.treeDataSource);
                    }
                }
                scope.$watch('treeData', setDataSource);
                setDataSource();

                function removeTag(removedTag) {
                    scope.tags = scope.tags.filter(function (existingTag) {
                        if (String(removedTag[scope.options.dataValueField]) === String(existingTag[scope.options.dataValueField])) {
                            return false;
                        }
                        return true;
                    });
                }

                scope.removeItem = function (removedTag) {
                    if (attrs.disabled) {
                        return;
                    }

                    removeTag(removedTag);
                };

                scope.$watch('tags', function (newValue, oldValue) {
                    // Check if arrays are equal
                    var newTagIds = newValue.map(function (tag) {
                        return tag[scope.options.dataValueField];
                    });
                    var oldTagIds = oldValue.map(function (tag) {
                        return tag[scope.options.dataValueField];
                    });
                    var dirty = false;
                    for (var i = 0; i < newTagIds.length; i += 1) {
                        if (oldTagIds.map(String).indexOf(String(newTagIds[i])) === -1) {
                            dirty = true;
                        }
                    }
                    for (var j = 0; j < oldTagIds.length; j += 1) {
                        if (newTagIds.map(String).indexOf(String(oldTagIds[j])) === -1) {
                            dirty = true;
                        }
                    }

                    // Dirty if arrays are not equal
                    if (dirty) {
                        ngModelCtrl.$setDirty();

                        scope.$broadcast('renderSelection');

                        if (scope.closeOnSelect || scope.maxSelectable && scope.maxSelectable <= scope.tags.length) {
                            closeDropdown();
                        }
                    }
                });

                /**
                 * The Kendo UI TreeView adds tons of extraneous data to items
                 * and removes necessary data from each node (i.e. children) so
                 * search the entire source tree data for the clean version of
                 * the desired node.
                 */
                function findTag(tagId, currentLevelTreeData) {
                    for (var i = 0; i < currentLevelTreeData.length; i += 1) {
                        if (String(currentLevelTreeData[i][scope.options.dataValueField]) === String(tagId)) {
                            return currentLevelTreeData[i];
                        }
                        if (currentLevelTreeData[i].items) {
                            var tag = findTag(tagId, currentLevelTreeData[i].items);
                            if (tag) {
                                return tag;
                            }
                        }
                    }
                }

                /**
                 * Any key that does not contain a primitive data type can be
                 * stripped out when adding the tag to the model binding.
                 */
                function flattenTag(tag) {
                    var flattenedTag = {};
                    for (var key in tag) {
                        if (Object.prototype.hasOwnProperty.call(tag, key)) {
                            if (typeof tag[key] !== 'object') {
                                flattenedTag[key] = tag[key];
                            }
                        }
                    }
                    return flattenedTag;
                }

                function getRejectedChildTagIds(currentTagIds, parentTag, stack) {
                    if (parentTag.items) {
                        for (var i = 0; i < parentTag.items.length; i += 1) {
                            var foundTagIndex = currentTagIds.map(String).indexOf(String(parentTag.items[i][scope.options.dataValueField]));
                            if (foundTagIndex !== -1) {
                                stack = stack.concat(currentTagIds[foundTagIndex]);
                            }
                            stack = getRejectedChildTagIds(currentTagIds, parentTag.items[i], stack);
                        }
                    }
                    return stack;
                }

                function toggleItem(tagId) {
                    var tag = findTag(tagId, scope.treeData);

                    // Check if tag can be removed
                    for (var i = 0; i < scope.tags.length; i += 1) {
                        if (String(scope.tags[i][scope.options.dataValueField]) === String(tag[scope.options.dataValueField])) {
                            removeTag(scope.tags[i]);
                            return;
                        }
                    }

                    // Check if children should be toggled instead
                    if (scope.selectChildren && tag.items) {
                        for (var j = 0; j < tag.items.length; j += 1) {
                            toggleItem(tag.items[j][scope.options.dataValueField]);
                        }
                        return;
                    }

                    // Check if item is disabled
                    if (OrcitMultiselectTreeview.isItemDisabled(tag, scope)) {
                        return;
                    }

                    // Remove any tags that are children of this tag
                    if (scope.disableChildren) {
                        var currentTagIds = scope.tags.map(function (currentTag) {
                            return currentTag[scope.options.dataValueField];
                        });
                        var rejectedChildTagIds = getRejectedChildTagIds(currentTagIds, tag, []);
                        scope.tags = scope.tags.filter(function (currentTag) {
                            return rejectedChildTagIds.map(String).indexOf(String(currentTag[scope.options.dataValueField])) === -1;
                        });
                    }

                    // Add tag
                    scope.tags = scope.tags.concat([flattenTag(tag)]);
                }

                scope.onSelect = function (e) {
                    e.preventDefault();
                    var kendoIsolateElem = $(e.node.children[0]).find('orcit-multiselect-treeview-item').get(0);
                    var kendoIsolateScope = angular.element(kendoIsolateElem).scope();
                    var kendoTagData = kendoIsolateScope.dataItem;
                    var tagId = kendoTagData[scope.options.dataValueField];

                    toggleItem(tagId);
                };

                scope.open = function() {
                    if (attrs.disabled) {
                        return;
                    }

                    scope.dropdownInitialized = true;
                    scope.isOpen = true;
                };

                function closeDropdown() {
                    if (scope.isOpen) {
                        scope.isOpen = false;
                        ngModelCtrl.$setTouched();
                    }
                }

                // Close when user clicks outside the component
                function documentClicked(e) {
                    if (!$(e.target).closest(elem).length) {
                        closeDropdown();
                        scope.$apply();
                    }
                }
                window.document.addEventListener('click', documentClicked, false);
                scope.$on('$destroy', function () {
                    window.document.removeEventListener('click', documentClicked, false);
                });

                // Close when user hits escape key
                elem.on('keydown keypress', function (event) {
                    var escapeKey = 27;
                    if (event.which === escapeKey) {
                        scope.isOpen = false;
                        scope.$apply();
                    }
                });
            }
        }
    };
}).directive('orcitMultiselectTreeviewItem', function (OrcitMultiselectTreeview, orcitMultiselectTreeviewValues) {
    'use strict';

    return {
        restrict: 'E',
        scope: {
            item: '='
        },
        template: [
            '<div class="orcitMultiselectTreeviewItem">{{::item[$parent.$parent.$parent.options.dataTextField]}}</div>'
        ].join(''),
        link: {
            pre: function (scope, elem) {
                // console.info('Orcit Multiselect Treeview Item Directive pre-link');

                var treeItemElem = elem.closest('.k-in');
                function renderSelected() {
                    treeItemElem.removeClass('orcitMultiselectTreeviewIndeterminate orcitMultiselectTreeviewDisabled');
                    treeItemElem.addClass('orcitMultiselectTreeviewSelected');
                }
                function renderDisabled() {
                    treeItemElem.removeClass('orcitMultiselectTreeviewSelected orcitMultiselectTreeviewIndeterminate');
                    treeItemElem.addClass('orcitMultiselectTreeviewDisabled');
                }
                function renderIndeterminate() {
                    treeItemElem.removeClass('orcitMultiselectTreeviewSelected orcitMultiselectTreeviewDisabled');
                    treeItemElem.addClass('orcitMultiselectTreeviewIndeterminate');
                }
                function renderDeselected() {
                    treeItemElem.removeClass('orcitMultiselectTreeviewSelected orcitMultiselectTreeviewIndeterminate orcitMultiselectTreeviewDisabled');
                }

                function isItemSelected(item) {
                    var checked = false;

                    var tags = scope.$parent.$parent.$parent.tags;
                    for (var i = 0; i < tags.length; i += 1) {
                        if (String(tags[i][scope.$parent.$parent.$parent.options.dataValueField]) === String(item[scope.$parent.$parent.$parent.options.dataValueField])) {
                            checked = true;
                            break;
                        }
                    }

                    return checked;
                }

                function isItemDisabled(item) {
                    return OrcitMultiselectTreeview.isItemDisabled(item, scope.$parent.$parent.$parent);
                }

                function isChildItemSelected(item) {
                    var childItems = item.items;

                    if (!childItems) {
                        return false;
                    }

                    for (var i = 0; i < childItems.length; i += 1) {
                        var childItem = childItems[i];
                        if (isItemSelected(childItem)) {
                            return true;
                        }
                        if (isChildItemSelected(childItem)) {
                            return true;
                        }
                    }

                    return false;
                }

                function renderSelection() {
                    var checked = false;
                    var disabled = false;
                    var indeterminate = false;

                    var item = scope.item._childrenOptions.data;

                    checked = isItemSelected(item);

                    if (!checked) {
                        var disabledReason = isItemDisabled(item);
                        var skippedDisabledReasons = [
                            orcitMultiselectTreeviewValues.DISABLED_REASON_DISABLE_PARENTS,
                            orcitMultiselectTreeviewValues.DISABLED_REASON_DISABLE_TOP_LEVEL
                        ];
                        if (disabledReason && skippedDisabledReasons.indexOf(disabledReason) === -1) {
                            disabled = true;
                        } else if (isChildItemSelected(item)) {
                            indeterminate = true;
                        }
                    }

                    if (checked) {
                        renderSelected();
                    } else if (disabled) {
                        renderDisabled();
                    } else if (indeterminate) {
                        renderIndeterminate();
                    } else {
                        renderDeselected();
                    }
                }
                scope.$on('renderSelection', renderSelection);
                renderSelection();
            }
        }
    };
}).factory('OrcitMultiselectTreeview', function (orcitMultiselectTreeviewValues) {
    'use strict';

    function findItemParentIds(itemId, items, stack, scope) {
        for (var i = 0; i < items.length; i += 1) {
            // If item was found return the parents
            if (String(items[i][scope.options.dataValueField]) === String(itemId)) {
                return stack;
            }
            if (items[i].items) {
                var result = findItemParentIds(itemId, items[i].items, stack.concat(items[i][scope.options.dataValueField]), scope);
                if (result) {
                    return result;
                }
            }
        }
    }

    function getParentItemIds(item, scope) {
        var treeData = scope.treeData;
        var itemId = item[scope.options.dataValueField];
        var parentIds = findItemParentIds(itemId, treeData, [], scope);
        return parentIds;
    }

    return {
        isItemDisabled: function (item, scope) {
            var tags = scope.tags;
            var treeData = scope.treeData;

            // Check if maximum number of items have been selected
            var maxSelectable = scope.maxSelectable;
            if (maxSelectable && tags.length >= maxSelectable) {
                return orcitMultiselectTreeviewValues.DISABLED_REASON_MAX_SELECTABLE;
            }

            // Check if item is top level disabled
            if (scope.disableTopLevel) {
                for (var i = 0; i < treeData.length; i += 1) {
                    if (String(treeData[i][scope.options.dataValueField]) === String(item[scope.options.dataValueField])) {
                        return orcitMultiselectTreeviewValues.DISABLED_REASON_DISABLE_TOP_LEVEL;
                    }
                }
            }

            // Check if item is children disabled
            if (scope.disableChildren) {
                var parentIds = getParentItemIds(item, scope);
                for (var j = 0; j < tags.length; j += 1) {
                    if (parentIds.map(String).indexOf(String(tags[j][scope.options.dataValueField])) !== -1) {
                        return orcitMultiselectTreeviewValues.DISABLED_REASON_DISABLE_CHILDREN;
                    }
                }
            }

            // Check if item is parent disabled
            if (scope.disableParents && item.items) {
                return orcitMultiselectTreeviewValues.DISABLED_REASON_DISABLE_PARENTS;
            }

            return false;
        }
    };
}).value('orcitMultiselectTreeviewValues', {
    DISABLED_REASON_DISABLE_CHILDREN: 'DISABLED_REASON_DISABLE_CHILDREN',
    DISABLED_REASON_DISABLE_PARENTS: 'DISABLED_REASON_DISABLE_PARENTS',
    DISABLED_REASON_DISABLE_TOP_LEVEL: 'DISABLED_REASON_DISABLE_TOP_LEVEL',
    DISABLED_REASON_MAX_SELECTABLE: 'DISABLED_REASON_MAX_SELECTABLE'
});
