define(["require", "exports", "esri/widgets/Search", "esri/widgets/Expand"], function (require, exports, Search_1, Expand_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Search = /** @class */ (function () {
        function Search(view, position, index) {
            this.search = null;
            this.search = new Expand_1.default({
                view: view,
                group: 'top-right',
                expandTooltip: '搜索',
                content: new Search_1.default({
                    view: view,
                    sources: []
                })
            });
            view.ui.add(this.search, position);
        }
        return Search;
    }());
    exports.default = Search;
});
