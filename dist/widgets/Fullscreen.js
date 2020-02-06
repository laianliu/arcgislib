var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "esri/widgets/Fullscreen"], function (require, exports, Fullscreen_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Fullscreen_1 = __importDefault(Fullscreen_1);
    var Fullscreen = /** @class */ (function () {
        function Fullscreen(view, position, index) {
            this.fullscreen = null;
            this.fullscreen = new Fullscreen_1.default({
                view: view
            });
            view.ui.add({
                component: this.fullscreen,
                position: position,
                index: index
            });
        }
        return Fullscreen;
    }());
    exports.default = Fullscreen;
});
