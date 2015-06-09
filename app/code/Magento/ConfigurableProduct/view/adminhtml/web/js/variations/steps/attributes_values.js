/**
 * Copyright © 2015 Magento. All rights reserved.
 * See COPYING.txt for license details.
 */
define([
    'uiComponent',
    'jquery',
    'ko',
    'underscore',
    'Magento_Ui/js/lib/collapsible'
], function (Component, $, ko, _, Collapsible) {
    'use strict';

    //connect items with observableArrays
    ko.bindingHandlers.sortableList = {
        init: function(element, valueAccessor) {
            var list = valueAccessor();
            $(element).sortable({
                axis: 'y',
                handle: '[data-role="draggable"]',
                tolerance: 'pointer',
                update: function(event, ui) {
                    var item = ko.contextFor(ui.item[0]).$data;
                    var position = ko.utils.arrayIndexOf(ui.item.parent().children(), ui.item[0]);
                    if (ko.contextFor(ui.item[0]).$index() != position) {
                        if (position >= 0) {
                            list.remove(item);
                            list.splice(position, 0, item);
                        }
                        ui.item.remove();
                    }
                }
            });
        }
    };

    var viewModel = Collapsible.extend({
        initialize: function () {
            this._super();
            return this;
        },
        attributes: ko.observableArray([]),
        createOption: function (attribute) {
            attribute.options.push({value:0, label:''});
        },
        saveOption: function (option) {
            this.options.remove(option);
            //TODO: improved generation uniqueid
            var value = _.uniqueId() + this.id;
            this.options.push({value:value, label:option.label});
            this.chosenOptions.push(value);
        },
        removeOption: function (option) {
            this.options.remove(option);
        },
        removeAttribute: function (attribute) {
            viewModel.prototype.attributes.remove(attribute);
        },
        createAttribute: function (attribute, index) {
            attribute.chosenOptions = ko.observableArray([]);
            attribute.options = ko.observableArray(attribute.options);
            attribute.opened = ko.observable(index < 3);
            attribute.collapsible = ko.observable(true);
            return attribute;
        },
        saveAttribute: function (attribute) {
            this.attributes.map(function(attribute) {
                attribute.chosen = [];
                attribute.chosenOptions.each(function(key) {
                    attribute.chosen.push(_.where(attribute.options(), {value:key}));
                });
            });
        },
        selectAllAttributes: function (attribute) {
            this.chosenOptions(_.pluck(attribute.options(), 'value'));
        },
        getCollapsibleSymbol: function (attribute) {
            return attribute.opened() ? '-' : '+';
        },
        render: function(wizard) {
            $.ajax({
                type: "POST",
                url: this.options_url,
                data: {attributes: wizard.data.attributes},
                showLoader: true
            }).done(function(attributes){
                viewModel.prototype.attributes(_.map(attributes, viewModel.prototype.createAttribute, this));
            });
        },
        force: function(wizard) {
            viewModel.prototype.saveAttribute(wizard);

            wizard.data.attributesValues = ko.toJS(this.attributes);
        },
        back: function(wizard) {
        }
    });
    return viewModel;
});
