define(["require", "exports", "esri/widgets/Home"], function (require, exports, Home_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Home = /** @class */ (function () {
        function Home(view, position, index) {
            this.home = null;
            this.home = new Home_1.default({
                view: view
            });
            view.ui.add(this.home, position, index);
        }
        return Home;
    }());
    exports.default = Home;
});
