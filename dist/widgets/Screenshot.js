define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Screenshot = /** @class */ (function () {
        function Screenshot(view, position, index) {
            ;
            (this.screenshot = 'null'),
                (this.view = view),
                (this.setMaskPosition = function (area) {
                    if (area) {
                        // maskDiv.classList.remove("hide");
                        maskDiv.style.left = area.x + 'px';
                        maskDiv.style.top = area.y + 'px';
                        maskDiv.style.width = area.width + 'px';
                        maskDiv.style.height = area.height + 'px';
                    }
                    else {
                        // maskDiv.classList.add("hide");
                    }
                });
        }
        Screenshot.prototype.createScreenshot = function (maskDiv) {
            var area = null;
            var me = this;
            me.view.container.classList.add('screenshotCursor');
            var dragHandler = me.view.on('drag', function (event) {
                event.stopPropagation();
                if (event.action !== 'end') {
                    var xmin = clamp(Math.min(event.origin.x, event.x), 0, me.view.width);
                    var xmax = clamp(Math.max(event.origin.x, event.x), 0, me.view.width);
                    var ymin = clamp(Math.min(event.origin.y, event.y), 0, me.view.height);
                    var ymax = clamp(Math.max(event.origin.y, event.y), 0, me.view.height);
                    area = {
                        x: xmin,
                        y: ymin,
                        width: xmax - xmin,
                        height: ymax - ymin
                    };
                    me.setMaskPosition(area);
                }
                else {
                    dragHandler.remove();
                    me.view
                        .takeScreenshot({ area: area, format: 'png' })
                        .then(function (screenshot) {
                        console.log(screenshot);
                        me.view.container.classList.remove('screenshotCursor');
                        me.setMaskPosition(null);
                    });
                }
            });
            function clamp(value, from, to) {
                return value < from ? from : value > to ? to : value;
            }
        };
        return Screenshot;
    }());
    exports.default = Screenshot;
});
