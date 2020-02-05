define(["require", "exports", "dojo/dom-construct"], function (require, exports, dom_construct_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function visitConf(items, fn) {
        items.forEach(function (item, index) {
            fn(item, index);
        });
    }
    exports.visitConf = visitConf;
    function createCustomCorner(view) {
        var customRightCorner = dom_construct_1.default.create('div', {
            className: 'esri-ui-right esri-ui-corner'
        }, view.ui._innerContainer);
        view.ui._positionNameToContainerLookup.customRight = customRightCorner;
        view.ui._cornerNameToContainerLookup.customRight = customRightCorner;
    }
    exports.createCustomCorner = createCustomCorner;
});
