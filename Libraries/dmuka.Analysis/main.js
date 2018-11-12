if (window["dmuka"] === undefined) {
    window["dmuka"] = {};
}

dmuka.Analysis = function (parameters) {
    const xmlns = "http://www.w3.org/2000/svg";

    //#region Constructor
    var me = {
        private: {
            variable: {
                data: parameters.data === undefined || parameters.data === null ? [] : parameters.data,
                mainSvgDOM: null,
                centerLineXDOM: null,
                centerLineYDOM: null,
                labelsXDOM: null,
                labelsYDOM: null,
                minX: parameters.minX,
                maxX: parameters.maxX,
                minY: parameters.minY,
                maxY: parameters.maxY,
                diffX: parameters.maxX - parameters.minX,
                diffY: parameters.maxY - parameters.minY
            },
            function: {
                updateLabelsX: function () {
                    var formatFunction =
                        parameters.labelsXFormat === undefined || parameters.labelsXFormat === null ?
                            function (value) { return value; } :
                            parameters.labelsXFormat;
                    var step = parameters.labelsXStep === undefined || parameters.labelsXStep === null ? 10 : parameters.labelsXStep;
                    for (let index = 0; index < step; index++) {
                        const stepValue = me.private.variable.minX + (index * (me.private.variable.diffX / step));

                        var stepLabelDOM = document.createElement("div");
                        stepLabelDOM.classList.add("dmuka-analysis-label-x-item");
                        stepLabelDOM.style.left = (index * (100 / step)) + "%";
                        stepLabelDOM.innerText = formatFunction(stepValue);
                        me.private.variable.labelsXDOM.appendChild(stepLabelDOM);
                    }
                },
                updateLabelsY: function () {
                    var formatFunction =
                        parameters.labelsYFormat === undefined || parameters.labelsYFormat === null ?
                            function (value) { return value; } :
                            parameters.labelsYFormat;
                    var step = parameters.labelsYStep === undefined || parameters.labelsYStep === null ? 10 : parameters.labelsYStep;
                    for (let index = 0; index < step; index++) {
                        const stepValue = me.private.variable.maxY - (index * (me.private.variable.diffY / step));

                        var stepLabelDOM = document.createElement("div");
                        stepLabelDOM.classList.add("dmuka-analysis-label-y-item");
                        stepLabelDOM.style.top = (index * (100 / step)) + "%";
                        stepLabelDOM.innerText = formatFunction(stepValue);
                        me.private.variable.labelsYDOM.appendChild(stepLabelDOM);
                    }
                },
                init: function () {
                    me.private.variable.mainSvgDOM = document.createElementNS(xmlns, "svg");
                    me.private.variable.mainSvgDOM.classList.add("dmuka-analysis");
                    me.private.variable.mainSvgDOM.style.width = parameters.width;
                    me.private.variable.mainSvgDOM.style.height = parameters.height;
                    parameters.element.appendChild(me.private.variable.mainSvgDOM);

                    if (parameters.centerLineX === true) {
                        me.private.variable.centerLineXDOM = document.createElement("div");
                        me.private.variable.centerLineXDOM.classList.add("dmuka-analysis-zero-line-x");
                        parameters.element.appendChild(me.private.variable.centerLineXDOM);
                    }

                    if (parameters.centerLineY === true) {
                        me.private.variable.centerLineYDOM = document.createElement("div");
                        me.private.variable.centerLineYDOM.classList.add("dmuka-analysis-zero-line-y");
                        parameters.element.appendChild(me.private.variable.centerLineYDOM);
                    }

                    if (parameters.labelsX === true) {
                        me.private.variable.labelsXDOM = document.createElement("div");
                        me.private.variable.labelsXDOM.classList.add("dmuka-analysis-label-x");
                        parameters.element.appendChild(me.private.variable.labelsXDOM);

                        me.private.function.updateLabelsX();
                    }

                    if (parameters.labelsY === true) {
                        me.private.variable.labelsYDOM = document.createElement("div");
                        me.private.variable.labelsYDOM.classList.add("dmuka-analysis-label-y");
                        parameters.element.appendChild(me.private.variable.labelsYDOM);

                        me.private.function.updateLabelsY();
                    }

                    me.public.update();
                },
                createLine: function (index, pos1, pos2) {
                    var line = document.createElementNS(xmlns, "line");

                    line.setAttribute("x1", pos1.calculatedX + "%");
                    line.setAttribute("y1", pos1.calculatedY + "%");
                    line.setAttribute("x2", pos2.calculatedX + "%");
                    line.setAttribute("y2", pos2.calculatedY + "%");

                    line.classList.add("dmuka-analysis-line");
                    line.classList.add("dmuka-analysis-line--" + index);

                    return line;
                },
                calcPercent: function (item) {
                    for (var prop in item) {
                        var propOfItem = item[prop];

                        propOfItem.calculatedX = (propOfItem.x - me.private.variable.minX) / (me.private.variable.diffX / 100);
                        propOfItem.calculatedY = (me.private.variable.maxY - propOfItem.y) / (me.private.variable.diffY / 100);
                    }
                    return item;
                }
            },
            event: {}
        },
        public: {
            get minX() {
                return me.private.variable.minX;
            },
            set minX(value) {
                me.private.variable.minX = value;
                me.private.variable.diffX = me.private.variable.maxX - me.private.variable.minX;
            },
            get maxX() {
                return me.private.variable.maxX;
            },
            set maxX(value) {
                me.private.variable.maxX = value;
                me.private.variable.diffX = me.private.variable.maxX - me.private.variable.minX;
            },
            get minY() {
                return me.private.variable.minY;
            },
            set minY(value) {
                me.private.variable.minY = value;
                me.private.variable.diffY = me.private.variable.maxY - me.private.variable.minY;
            },
            get maxY() {
                return me.private.variable.maxY;
            },
            set maxY(value) {
                me.private.variable.maxY = value;
                me.private.variable.diffY = me.private.variable.maxY - me.private.variable.minY;
            },
            get data() {
                return me.private.variable.data;
            },
            get element() {
                return parameters.element;
            },
            get update() {
                return function () {
                    if (parameters.labelsX === true) {
                        me.private.variable.labelsXDOM.innerHTML = "";

                        me.private.function.updateLabelsX();
                    }

                    if (parameters.labelsY === true) {
                        me.private.variable.labelsYDOM.innerHTML = "";

                        me.private.function.updateLabelsY();
                    }

                    me.private.variable.mainSvgDOM.innerHTML = "";
                    if (me.private.variable.data.length === 0) {
                        return;
                    }

                    var beforeItem = me.private.function.calcPercent(me.private.variable.data[0]);
                    for (let index = 0; index < me.private.variable.data.length; index++) {
                        const item = me.private.function.calcPercent(me.private.variable.data[index]);

                        for (var prop in item) {
                            var propOfItem = item[prop];
                            var propOfBeforeItem = beforeItem[prop];

                            me.private.variable.mainSvgDOM.appendChild(
                                me.private.function.createLine(
                                    prop,
                                    propOfBeforeItem,
                                    propOfItem
                                ));
                        }

                        beforeItem = item;
                    }
                };
            }
        },
        get call() {
            return function () {
                var argumentFnc = arguments[0];
                var argumentParameters = [];
                for (let index = 1; index < arguments.length.length; index++) {
                    argumentParameters.push(arguments.length[index]);
                }

                argumentFnc.apply(this_, argumentParameters);
            };
        }
    };
    this.analysis = me.public;
    //#endregion

    //#region Methods
    me.private.function.init();
    //#endregion
};