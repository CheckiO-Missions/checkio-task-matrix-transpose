requirejs(['ext_editor_io', 'jquery_190', 'raphael_210'],
    function (extIO, $, TableComponent) {
        function TransposedMatrixCanvas() {
            var zx = 40;
            var zy = 10;
            var cellSize = 30;
            var cellN = [];
            var fullSize = [];
            var maxSize;
            var delay = 1000;

            var colorDark = "#294270";
            var attrBracket = {"stroke": colorDark, "stroke-width": 3};
            var attrNumber = {"stroke": colorDark, "font-family": "Verdana", "font-size": cellSize * 0.6};
            var attrSup = {"stroke": colorDark, "font-family": "Verdana", "font-size": cellSize * 0.35, "opacity": 0};

            var paper;
            var numberSet;
            var letterT;
            var letterA;
            var leftBracket;
            var rightBracket;

            function createBracketPath(x0, y0, y1, left) {
                return Raphael.fullfill(
                    "M{XS},{y0}H{x0}V{Y1}H{XS}",
                    {
                        XS: x0 + (left ? 1 : -1) * cellSize / 6,
                        x0: x0,
                        y0: y0,
                        Y1: y1
                    }
                )
            }

            this.removeCanvas = function () {
                if (paper) {
                    paper.remove();
                }
            };

            this.createCanvas = function (dom, matrix, shortCanvas) {
                if (shortCanvas) {
                    zx = 10;
                }
                cellN = [matrix[0].length, matrix.length];

                maxSize = Math.max(cellN[0] * cellSize, cellN[1] * cellSize);
                fullSize = [zx * 2 + maxSize, zy * 2 + maxSize];
                paper = Raphael(dom, fullSize[0], fullSize[1], 0, 0);
                numberSet = paper.set();

                if (!shortCanvas) {
                    letterA = paper.text(zx / 2, zy + cellSize * cellN[1] / 2, "A").attr(attrNumber);
                    letterT = paper.text(zx / 2 + cellSize / 5, zy + cellSize * cellN[1] / 2 - cellSize / 6, "T").attr(attrSup);
                }
                leftBracket = paper.path(
                    createBracketPath(
                        zx,
                        zy,
                        zy + cellSize * cellN[1], true)
                ).attr(attrBracket);
                rightBracket = paper.path(
                    createBracketPath(
                        zx + cellN[0] * cellSize,
                        zy,
                        zy + cellSize * cellN[1], false)
                ).attr(attrBracket);
                for (var row = 0; row < matrix.length; row++) {
                    for (var col = 0; col < matrix[0].length; col++) {
                        numberSet.push(paper.text(
                            zx + cellSize * col + cellSize / 2,
                            zy + cellSize * row + cellSize / 2,
                            matrix[row][col]
                        ).attr(attrNumber));
                    }
                }
            };

            this.animateCanvas = function (matrix) {
                setTimeout(function () {
                    leftBracket.animate({"path": createBracketPath(zx, zy, zy + cellSize * cellN[0], true)}, delay);
                    rightBracket.animate({"path": createBracketPath(zx + cellN[1] * cellSize, zy, zy + cellSize * cellN[0], false)}, delay);
                    letterA.animate({"y": zy + cellSize * cellN[0] / 2}, delay);
                    letterT.animate({"y": zy + cellSize * cellN[0] / 2 - cellSize / 6, "opacity": 1}, delay);
                    for (var row = 0; row < matrix.length; row++) {
                        for (var col = 0; col < matrix[0].length; col++) {
                            var n = numberSet[row * cellN[0] + col];
                            n.animate(
                                {
                                    "x": zx + cellSize * row + cellSize / 2,
                                    "y": zy + cellSize * col + cellSize / 2
                                },
                                delay,
                                callback = function () {
                                    paper.setSize(zx * 2 + maxSize, zy * 2 + cellSize * cellN[0]);
                                }

                            );
                        }
                    }

                }, 200);

            };
        }

        var $tryit;
        var io = new extIO({
            animation: function($expl, data){
                var checkioInput = data.in;
                if (!checkioInput){
                    return;
                }

                var eCanvas = new TransposedMatrixCanvas();
                eCanvas.createCanvas($expl[0], checkioInput);
                eCanvas.animateCanvas(checkioInput);
            },
            animationTemplateName: 'animation',
            tryit: function(){
                var this_e = this;

                $tryit = $(this_e.extSetHtmlTryIt(this_e.getTemplate('tryit')));
                inCanvas = new TransposedMatrixCanvas();
                outCanvas = new TransposedMatrixCanvas();

                $tryit.find('form').submit(function (e) {
                    e.preventDefault();
                    var row = parseInt($tryit.find(".input-row").val());
                    var col = parseInt($tryit.find(".input-col").val());
                    if (!row || isNaN(row) || row < 1 || row > 5) {
                        row = 5;
                    }
                    if (!col || isNaN(col) || col < 1 || col > 5) {
                        col = 5;
                    }
                    $tryit.find(".input-row").val(row);
                    $tryit.find(".input-col").val(col);
                    var data = [];
                    for (var i = 0; i < row; i++) {
                        var temp = [];
                        for (var j = 0; j < col; j++) {
                            temp.push(Math.floor(Math.random() * 9) + 1);
                        }
                        data.push(temp);
                    }
                    inCanvas.removeCanvas();
                    $tryit.find("table tr:first").show();
                    inCanvas.createCanvas($tryit.find(".input-canvas")[0], data, true);
                    this_e.extSendToConsoleCheckiO(data);
                    e.stopPropagation();
                    return false;
                });

            },
            retConsole: function (this_e, ret) {
                if (this_e){
                    deret = JSON.parse(this_e);
                }
                var flagMatrix = true;
                if (Object.prototype.toString.call(deret) === '[object Array]') {

                    if (deret.length > 5) {
                        flagMatrix = false;
                    }
                    else {
                        out:for (var i = 0; i < deret.length; i++) {

                            if (Object.prototype.toString.call(deret[i]) !== '[object Array]') {
                                flagMatrix = false;
                                break;
                            }
                            if (deret[i].length > 5 || deret[i].length !== deret[0].length){
                                flagMatrix = false;
                                break;
                            }

                            for (var j = 0; j < deret[i].length; j++) {
                                if (typeof(deret[i][j]) !== "number" || parseInt(deret[i][j] !== parseFloat(deret[i][j]))) {
                                    flagMatrix = false;
                                    break out;
                                }
                                if (deret[i][j] > 9 || deret[i][j] < 0) {
                                    flagMatrix = false;
                                    break out;
                                }
                            }
                        }
                    }

                }
                else {
                    flagMatrix = false;
                }
                outCanvas.removeCanvas();
                if (flagMatrix) {
                    $tryit.find(".checkio-result-in").html("");
                    outCanvas.createCanvas($tryit.find(".output-canvas")[0], deret, true);
                }
                else {
                    $tryit.find(".checkio-result-in").html(ret);
                }

                $tryit.find('.checkio_result').html("Your result:<br>" + ret);
            },
            functions: {
                js: 'transposeMatrix',
                python: 'checkio'
            }
        });
        io.start();
    }
);
