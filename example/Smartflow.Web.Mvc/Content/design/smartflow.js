/********************************************************************
 *License:   https://github.com/chengderen/Smartflow/blob/master/LICENSE 
 *Home page: https://www.smartflow-sharp.com
 *Version:   3.0
 ********************************************************************
 */
(function ($) {

    var config = {
        rootStart: '<workflow>',
        rootEnd: '</workflow>',
        start: '<',
        end: '>',
        lQuotation: '"',
        rQuotation: '"',
        beforeClose: '</',
        afterClose: '/>',
        equal: '=',
        space: ' ',
        group: 'group',
        form: 'form',
        from: 'from',
        actor: 'actor',
        transition: 'transition',
        br: 'br',
        id: 'id',
        name: 'name',
        to: 'destination',
        expression: 'expression',
        marker: 'marker',
        layout: 'layout',
        action:'action'
    };

    ///检测为空
    function checkNull(value) {
        return (!(value == '' || value == undefined));
    }

    function Draw(option) {
        this.draw = SVG(option.container);
        this.drawOption = $.extend({}, option);

        this.source = undefined;

        this._shared = undefined;
        this._decision = undefined;
        this._init();
    }

    /*
     *静态存储变量
     */
    Draw._proto_Cc = {};
    Draw._proto_NC = {};
    Draw._proto_LC = {};
    Draw._proto_RC = [];

    /**
     * 静态处理方法 
     * @param {any} elements
     */
    Draw.remove = function (elements) {
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            if (element) {
                var l = SVG.get(element.id),
                    instance = Draw._proto_LC[element.id];

                l.remove();
                instance.brush.remove();
                Draw.removeById(element.id);
                delete Draw._proto_LC[element.id];
            }
        }
    }
    Draw.removeById = function (id) {
        for (var i = 0, len = Draw._proto_RC.length; i < len; i++) {
            if (Draw._proto_RC[i].id == id) {
                Draw._proto_RC.remove(i);
                break;
            }
        }
    }
    Draw.findById = function (elementId, propertyName) {
        var elements = [];
        $.each(Draw._proto_RC, function () {
            var self = this;
            if (propertyName) {
                if (this[propertyName] === elementId) {
                    elements.push(this);
                }
            } else {
                $.each(["to", "from"], function () {
                    if (self[this] === elementId) {
                        elements.push(self);
                    }
                });
            }
        });
        return elements;
    }
    Draw.duplicateCheck = function (from, to) {
        var result = false;
        for (var i = 0, len = Draw._proto_RC.length; i < len; i++) {
            var r = Draw._proto_RC[i];
            if (r.from === from && r.to === to) {
                result = true;
                break;
            }
        }
        return result;
    }
    Draw.getEvent = function (evt) {

        var n = evt.target;
        if (n.nodeName === 'svg') {
            return null;
        }
        else {
            return (evt.target.correspondingUseElement || evt.target);
        }
    }
    Draw.parse = function (xml) {
        return new XML(xml).root;
    }


    Draw.create = function (category) {
        var strategy = {
            node: function () {
                return new Node();
            },
            start: function () {
                return new Start();
            },
            end: function () {
                return new End();
            },
            decision: function () {
                return new Decision();
            }
        };
        return strategy[category]();
    }

   

    Draw.prototype._init = function () {
        var self = this,
            dw = self.draw;

        self.draw.mouseup(function (e) {
            self.draw.off('mousemove');
        });

        self._initEvent();
        self._decision = dw.group()
            .add(dw.path("M0 0 l20 0 v0 100 l-10 -15 l-10 15z").fill("#f06"));

        dw.defs().add(self._decision);

    }
    Draw.prototype._initEvent = function () {
        var self = this;
        self.draw.each(function () {
            switch (this.type) {
                case "rect":
                case "use":
                case "circle":
                    this.off('mousedown');
                    break;
                default:
                    break;
            }
        });
    }


    /**
     * 获取标准clientX轴
     * @param {any} evt
     */
    Draw.getClientX = function (evt) {
        return evt.clientX - 30;
    }

    /**
     * 私有方法，拖拉(移动图形)
     * @param {any} evt
     * @param {any} o
     */
    Draw.prototype._drag = function (evt, o) {
        var self = this,
            nx = Draw._proto_NC[self.id()];
        evt.preventDefault();
        nx.disX = evt.clientX - self.x() - nx.cx;
        nx.disY = evt.clientY - self.y() - nx.cy;
        o.draw.on('mousemove', function (d) {
            d.preventDefault();
            nx.move(self, d);
        });
    }

    Draw.prototype._start = function (node, evt) {

        var nodeName = node.nodeName,
            nodeId = node.id;

        if (nodeName == 'rect' || nodeName == 'use') {
            var instance = Draw._proto_NC[nodeId];
            var result = instance.bound(Draw.getClientX(evt), evt.clientY);
            if (result) {

                this._shared = new Line();
                this._shared.drawInstance = this;
                var x = result.x;
                var y = result.y;
                this._shared.x1 = x;
                this._shared.y1 = y;
                this._shared.x2 = x;
                this._shared.y2 = y;
                this._shared.draw();
                this.source = {
                    id: nodeId
                };

                return true;
            }
        }

        return false;
    }

    Draw.prototype._join = function (evt) {
        if (this._shared) {
            this._shared.x2 = Draw.getClientX(evt);
            this._shared.y2 = (this._shared.y1 > evt.clientY) ? evt.clientY + 5 : evt.clientY - 5;
            this._shared.move();
        }
    }
    Draw.prototype._end = function (node, evt) {
        var self = this,
            nodeId = node.id;
        var to = SVG.get(nodeId),
            from = SVG.get(self.source.id),
            instance = self._shared,
            l = SVG.get(instance.$id);

        self.source.to = nodeId;
        instance.move(evt);

        var last = instance.last();
        var first = instance.first();

        Draw._proto_RC.push({
            id: instance.$id,
            from: self.source.id,
            to: nodeId,
            ox2: last.x - to.x(),
            oy2: last.y - to.y(),
            ox1: first.x - from.x(),
            oy1: first.y - from.y()
        });
    }

    Draw.prototype.join = function () {
        //线连接
        var self = this;
        this._initEvent();
        this.draw.off('mousedown').on('mousedown', function (evt) {
            var node = Draw.getEvent(evt);
            if (node != null) {
                if (self._start.call(self, node, evt)) {
                    self.draw.on('mousemove', function (e) {
                        self._join.call(self, e);
                    });
                }
            }
        });

        this.draw.on('mouseup', function (evt) {
            var node = Draw.getEvent(evt),
                check = (node != null);
            if (check) {

                var nodeName = node.nodeName,
                    nodeId = node.id;


                if ((nodeName == 'rect' || nodeName == 'use') && self.source) {

                    var nt = Draw._proto_NC[nodeId],
                        nf = Draw._proto_NC[self.source.id];

                    var x = Draw.getClientX(evt),
                        y = evt.clientY;

                    check = (
                        nodeId !== self.source.id
                        && !nt.check(nf)
                        && !Draw.duplicateCheck(self.source.id, nodeId)
                        && nt.bound(x, y)
                    );
                    if (check) {
                        self._end.call(self, node, evt);
                    }
                }
            }

            if (!check) {
                if (self._shared) {
                    self._shared.remove();
                }
            }

            self._shared = undefined;
            self.source = undefined;
        });
    }

    Draw.prototype.select = function () {
        //选择元素
        this._initEvent();
        this.draw.off('mousedown');
        var self = this;
        self.draw.each(function () {
            var el = this;
            switch (el.type) {
                case "rect":
                case "use":
                case "circle":
                    el.mousedown(function (evt) {
                        self._drag.call(this, evt, self);
                    });
                    break;
                default:
                    break;
            }
        });
    }

    Draw.prototype.create = function (category, after) {
        var instance = Draw.create(category);
        instance.drawInstance = this;
        instance.x = Math.floor(Math.random() * 200 + 1);
        instance.y = Math.floor(Math.random() * 200 + 1);
        if (!after) {
            instance.draw();
        }
        return instance;
    }

    /**
     * 数据导出
     * */
    Draw.prototype.export = function () {
        var unique = 29,
            nodeCollection = [],
            pathCollection = [],
            validateCollection = [],
            build = util.builder();

        $.each(Draw._proto_NC, function () {
            var self = this;
            if (!self.validate()) {
                validateCollection.push(false);
            }
        });

        if (validateCollection.length > 0 || (Draw._proto_RC.length === 0)) {
            alert("流程图不符合流程定义规则");
            return;
        }

        function generatorId() {
            unique++;
            return unique;
        }

        for (var propertyName in Draw._proto_NC) {
            Draw._proto_NC[propertyName].id = generatorId();
        }

        build.append(config.rootStart);
        $.each(Draw._proto_NC, function () {
            if (this.category !== 'marker') {
                build.append(this.export());
            }
        });

        build.append(config.rootEnd);

        return encodeURI(build.toString());
    }

    /**
     * 数据导入
     * */
    Draw.prototype.import = function (structure, disable, executeNodeID, process) {
        var dwInstance = this,
            data = Draw.parse(structure).workflow;

        var record = process || [];

        function findUID(destination) {
            var id;
            for (var i = 0, len = data.length; i < len; i++) {
                var node = data[i];
                if (destination == node.id) {
                    id = node.$id;
                    break;
                }
            }
            return id;
        }

        $.each(data, function () {
            var node = this;
            node.category = node.category.toLowerCase();

            var instance = dwInstance.create(node.category, true);
            $.extend(instance, node, util.parseNode(node.layout));
            instance.disable = (disable || false);
            instance.draw(executeNodeID);
            node.$id = instance.$id;
        });

        $.each(data, function () {
            var self = this;

            self.transition = (self.transition || []);
            $.each(self.transition, function () {
                var transition = new Line();
                transition.drawInstance = dwInstance;

                var markerArray = (this.marker || []);
                if (!!this.marker) {
                    delete this.marker;
                }

                $.extend(transition, this);

                transition.disable = (disable || false);
                transition.draw(this.layout);

                var destinationId = findUID(transition.destination),
                    destination = SVG.get(destinationId),
                    from = SVG.get(self.$id);

                var last = transition.last(),
                    first = transition.first();

                $.each(markerArray, function () {
                    var marker = new Marker(parseFloat(this.x), parseFloat(this.y), transition);
                    marker.length = this.length;
                    marker.drawInstance = transition.drawInstance;
                    marker.draw();
                    transition.markerArray.push(marker);
                });

                Draw._proto_RC.push({
                    id: transition.$id,
                    from: self.$id,
                    to: destinationId,
                    ox2: last.x - destination.x(),
                    oy2: last.y - destination.y(),
                    ox1: first.x - from.x(),
                    oy1: first.y - from.y()
                });
            });
        });
    }

    function Element(name, category) {
        //节点ID
        this.$id = undefined;
        //标识ID
        this.id = undefined;
        //文本画笔
        this.brush = undefined;
        //节点中文名称
        this.name = name;
        //节点类别（LINE、NODE、START、END,DECISION）
        this.category = category;
        //禁用事件
        this.disable = false;
        //背景颜色
        this.bgColor = '#f06';
        this.bgCurrentColor = 'green';
        this.drawInstance = undefined;
    }

    Element.prototype = {
        constructor: Element,
        draw: function () {
            if (!this.disable) {
                var el = SVG.get(this.$id);
                this.bindEvent.call(el, this);
            }
        },
        bindEvent: function (el) {
            this.dblclick(function (evt) {
                evt.preventDefault();
                var node = Draw._proto_NC[this.id()];
                node.edit.call(this, evt, el);
                return false;
            });
        }
    }

    function Shape(name, category) {
        Shape.base.Constructor.call(this, name, category);
        this.form = undefined;
        this.group = [];
        this.action= [];
        this.actor= [];
        /*边界高度*/
        this.tickness = 20;
    }

    Shape.extend(Element, {
        constructor: Shape,
        check: function (nf) {
            return ((nf.category === 'end' || this.category === 'start')
                || (nf.category === 'start' && this.category === 'end'));
        },
        edit: function (evt, el) {
            if (evt.ctrlKey && evt.altKey) {
                var id = this.id(),
                    node = Draw._proto_NC[id],
                    rect = SVG.get(id),
                    elements = Draw.findById(id);

                Draw.remove(elements);

                rect.remove();
                node.brush.remove();
                delete Draw._proto_NC[id];
            } else {
                var nx = Draw._proto_NC[this.id()];
                el.drawInstance.drawOption['dblClick']
                    && el.drawInstance.
                        drawOption['dblClick'].call(this, nx);
            }
        },
        move: function () {
            Line.move.call(this, this);
        },
        getTransitions: function () {
            var elements = Draw.findById(this.$id, config.from),
                lineCollection = [];
            $.each(elements, function () {
                lineCollection.push(Draw._proto_LC[this.id]);
            });
            return lineCollection;
        }
    });

    Shape.prototype.export = function () {
        var
            self = this,
            build = util.builder();

        build.append(config.start)
            .append(self.category)
            .append(config.space)
            .append("id")
            .append(config.equal)
            .append(config.lQuotation)
            .append(self[config.id])
            .append(config.rQuotation)
            .append(config.space)
            .append(config.name)
            .append(config.equal)
            .append(config.lQuotation)
            .append(self[config.name])
            .append(config.rQuotation)
            .append(config.space)
            .append(config.layout)
            .append(config.equal)
            .append(config.lQuotation)
            .append(self.x + ' ' + self.disX + ' ' + self.y + ' ' + self.disY)
            .append(config.rQuotation)
            .append(config.space)
            .append('category')
            .append(config.equal)
            .append(config.lQuotation)
            .append(self.category)
            .append(config.rQuotation)
            .append(config.end);

        $.each(self.group, function () {
            build.append(config.start)
                .append(config.group);
            eachAttributs(build, this);
            build.append(config.afterClose);
        });


        $.each(self.action, function () {
            build.append(config.start)
                .append(config.action);
            eachAttributs(build, this);
            build.append(config.afterClose);
        });

        if (self.exportDecision) {
            self.exportDecision(build);
        }

        var elements = Draw.findById(self.$id, config.from);
        $.each(elements, function () {
            if (this.from === self.$id) {
                var
                    L = Draw._proto_LC[this.id],
                    N = Draw._proto_NC[this.to];

                build.append(config.start)
                    .append(config.transition)
                    .append(config.space)
                    .append(config.name)
                    .append(config.equal)
                    .append(config.lQuotation)
                    .append(L.name)
                    .append(config.rQuotation)
                    .append(config.space)
                    .append(config.to)
                    .append(config.equal)
                    .append(config.lQuotation)
                    .append(N.id)
                    .append(config.rQuotation)
                    .append(config.space)
                    .append(config.layout)
                    .append(config.equal)
                    .append(config.lQuotation)
                    .append(L.getPoints().join(" "))
                    .append(config.rQuotation)
                    .append(config.end);

                if (self.category === 'decision') {

                    build.append(config.start)
                        .append(config.expression)
                        .append(config.end)
                        .append("<![CDATA[")
                        .append(L.expression)
                        .append("]]>")
                        .append(config.beforeClose)
                        .append(config.expression)
                        .append(config.end);
                }

                $.each(L.markerArray, function () {
                    var marker = this;

                    build.append(config.start)
                        .append(config.marker)
                        .append(config.space)
                        .append("x")
                        .append(config.equal)
                        .append(config.lQuotation)
                        .append(marker.x)
                        .append(config.rQuotation)
                        .append(config.space)
                        .append("y")
                        .append(config.equal)
                        .append(config.lQuotation)
                        .append(marker.y)
                        .append(config.rQuotation)
                        .append(config.space)
                        .append("length")
                        .append(config.equal)
                        .append(config.lQuotation)
                        .append(marker.length)
                        .append(config.rQuotation)
                        .append(config.afterClose)

                });

                build.append(config.beforeClose)
                    .append(config.transition)
                    .append(config.end);
            }
        });

        $.each(self.actor, function () {

            if (checkNull(this.id) && checkNull(this.name)) {
                build.append(config.start)
                    .append(config.actor);
                eachAttributs(build, this);
                build.append(config.afterClose);
            }
        });

        build.append(config.beforeClose)
            .append(self.category)
            .append(config.end);


        function eachAttributs(build, reference) {
            $.each(['id', 'name'], function (i, p) {
                build.append(config.space)
                    .append(config[p])
                    .append(config.equal)
                    .append(config.lQuotation)
                    .append(reference[p])
                    .append(config.rQuotation);
            });
        }

        return build.toString();
    }

    function Marker(x, y, line) {
        this.x = x;
        this.y = y;
        this.r = 10;
        this.cx = 40;
        this.cy = 10;
        this.disX = 0;
        this.disY = 0;
        this.border = 3;
        //线段长度
        this.length = 0;
        this.line = line;
        Marker.base.Constructor.call(this, "标记位", "marker");
    }

    Marker.extend(Shape, {
        draw: function () {
            var self = this,
                dw = self.drawInstance.draw,
                circle = dw.circle(self.r)
                    .fill(self.bgColor);

            circle.move(self.x, self.y);
            self.$id = circle.id();

            Draw._proto_NC[self.$id] = self;
            return Shape.base.Parent.prototype.draw.call(this);
        },
        move: function (element, evt) {
            var self = this;
            self.x = evt.clientX - self.disX - self.cx;
            self.y = evt.clientY - self.disY - self.cy;
            element.move(self.x, self.y);
            self.line.setPointArray();
        },
        bindEvent: function (el) {
            //绑定事件
            this.mousedown(function (evt) {
                el.drawInstance._drag.call(this, evt, el.drawInstance);
            });
        },
        validate: function () {
            return true;
        },
        bound: function (mX, mY) {
            var self = this;
            return {
                x: self.x + self.r,
                y: self.y + self.r
            };
        },
        math: function (sx, sy) {

            var x = this.x,
                y = this.y,
                zx = sx,
                zy = y;
            var a = Math.ceil(Math.abs(x - sx)),
                b = Math.ceil(Math.abs(sy - zy));
            return Math.ceil(Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2)));
        }
    });

    function Line() {
        this.x1 = 0;
        this.y1 = 0;
        this.x2 = 0;
        this.y2 = 0;
        this.border = 3;
        this.expression = '';
        this.points = [];
        Line.base.Constructor.call(this, "line", "line");
        this.markerArray = [];
    }

    Line.extend(Element, {
        constructor: Line,
        draw: function (points) {
            var self = this,
                dw = self.drawInstance;

            var L = (!!points) ? dw.draw.polyline(points) :
                dw.draw.polyline([[self.x1, self.y1], [self.x2, self.y2]]);

            L.fill("none").stroke({
                width: self.border,
                color: self.bgColor
            });

            L.marker('end', 10, 10, function (add) {
                add.path('M0,0 L0,6 L6,3 z').fill("#f00");
                this.attr({
                    refX: 5,
                    refY: 2.9,
                    orient: 'auto',
                    stroke: 'none',
                    markerUNits: 'strokeWidth'
                });
            });

            self.$id = L.id();
            Draw._proto_LC[self.$id] = this;
            return Line.base.Parent.prototype.draw.call(self);
        },
        bindEvent: function () {
            this.off('dblclick').on('dblclick', function (evt) {
                evt.preventDefault();
                var instance = Draw._proto_LC[this.id()];
                if (evt.ctrlKey && evt.altKey) {
                    Draw.removeById(instance.$id);
                    this.off('dblclick');
                    instance.remove();
                } else if (evt.ctrlKey && evt.shiftKey) {

                    var marker = new Marker(Draw.getClientX(evt), evt.clientY, instance);
                    marker.drawInstance = instance.drawInstance;
                    marker.draw();

                    var first = instance.first();
                    marker.length = marker.math(first.x, first.y);
                    instance.markerArray.push(marker);
                    instance.setPointArray();

                } else {
                    var nodeName = prompt("请输入路线名称", instance.name);
                    if (nodeName) {
                        instance.name = nodeName;
                    }
                }
                return false;
            });
        },
        move: function (evt) {
            var self = this,
                dw = self.drawInstance,
                instance = SVG.get(self.$id);
            if (dw.source.to && evt) {
                var nl = Draw._proto_NC[dw.source.to];
                var position = nl.bound(Draw.getClientX(evt), evt.clientY);
                if (position) {
                    self.x2 = position.x;
                    self.y2 = position.y;
                }
            }
            instance.plot([[self.x1, self.y1], [self.x2, self.y2]]);
        },
        remove: function () {
            var self = this,
                line = SVG.get(self.$id),
                instance = Draw._proto_LC[self.$id],
                marker = line.attr('marker-end'),
                arrow = /#[a-zA-Z0-9]+/.exec(marker)[0];

            $.each([arrow, self.$id], function (index, propertyName) {
                if (propertyName) {
                    SVG.get(propertyName).remove();
                }
            });

            $.each(self.markerArray, function () {
                SVG.get(this.$id).remove();
                delete Draw._proto_NC[this.$id];
            });

            delete Draw._proto_LC[self.$id];
        },
        first: function () {
            var pointArray = this.getPoints()
            var point = pointArray[0];
            var xy = point.split(",");
            return {
                x: parseInt(xy[0]),
                y: parseInt(xy[1])
            };
        },
        last: function () {
            var pointArray = this.getPoints();
            var point = pointArray[pointArray.length - 1];
            var xy = point.split(",");

            return {
                x: parseInt(xy[0]),
                y: parseInt(xy[1])
            };
        },
        setFirst: function () {
            var pointArray = this.getPoints();
            pointArray.shift();
            pointArray.unshift([this.x1, this.y1].join(','));
            this.plot(pointArray);
        },
        setLast: function () {
            var pointArray = this.getPoints();
            pointArray.pop();
            pointArray.push([this.x2, this.y2].join(','));
            this.plot(pointArray);
        },
        getPoints: function () {
            var self = this,
                L = SVG.get(self.$id),
                points = L.attr("points");

            return points.split(" ");
        },
        setPointArray: function () {
            var $this = this,
                pointArray = [],
                first = $this.first(),
                last = $this.last();

            pointArray.push([first.x, first.y].join(','));
            $this.sort();
            $.each($this.markerArray, function () {
                pointArray.push([this.x + this.r / 2,
                this.y + this.r / 2].join(','));
            });
            pointArray.push([last.x, last.y].join(','));
            $this.plot(pointArray);
        },
        plot: function (pointArray) {
            var el = SVG.get(this.$id);
            el.plot(pointArray.join(" "));
            Line.update(this);
        },
        sort: function () {
            var $this = this,
                len = $this.markerArray.length - 1;
            for (var i = 0; i < len; i++) {
                for (var j = 0; j < len - i; j++) {
                    var b = $this.markerArray[j],
                        a = $this.markerArray[j + 1];
                    if (b.length > a.length) {
                        var tempObject = b;
                        $this.markerArray[j] = a;
                        $this.markerArray[j + 1] = tempObject;
                    }
                }
            }
        }
    });

    Line.move = function (current) {

        var toElements = Draw.findById(current.$id, "to"),
            fromElements = Draw.findById(current.$id, "from");
        $.each(toElements, function () {
            var el = SVG.get(this.id),
                instance = Draw._proto_LC[this.id];

            if (el && instance) {
                instance.x2 = current.x + this.ox2;
                instance.y2 = current.y + this.oy2;
                instance.setLast();
            }
        });

        $.each(fromElements, function () {
            var el = SVG.get(this.id),
                instance = Draw._proto_LC[this.id];
            if (el && instance) {
                instance.x1 = current.x + this.ox1;
                instance.y1 = current.y + this.oy1;
                instance.setFirst();
            }
        });
    }

    Line.update = function (current) {
        if (util.ie) {
            var draw = document.getElementById(current.drawInstance.drawOption.container),
                svg = draw.firstElementChild,
                el = document.getElementById(current.$id);
            svg.removeChild(el);
            var cloneNode = el.cloneNode();
            svg.appendChild(cloneNode);

            var instance = Draw._proto_LC[current.$id];
            instance.bindEvent.call(SVG.get(current.$id), this);
        }
    }

    /**
     * 流程中节点类定义
     * 继承Shape形状
     * @param {any} name
     * @param {any} category
     */
    function Node() {
        this.w = 180;
        this.h = 40;
        this.x = 10;
        this.y = 10;
        this.cx = 40;
        this.cy = 10;
        this.disX = 0;
        this.disY = 0;
        Node.base.Constructor.call(this, "node", "node");
        this.name = "节点";
    }

    Node.extend(Shape, {
        draw: function (b) {
            var n = this,
                dw = n.drawInstance,
                color = (b == n.id && b && n.id) ?
                    n.bgCurrentColor : n.bgColor,

                rect = dw.draw.rect(n.w, n.h)
                    .attr({ fill: color, x: n.x, y: n.y });

            n.brush = dw.draw.text(n.name);
            n.brush.attr({
                x: n.x + rect.width() / 2,
                y: n.y + rect.height() / 2 + n.vertical()
            });
            n.$id = rect.id();
            Draw._proto_NC[n.$id] = n;
            return Node.base.Parent.prototype.draw.call(this);
        },
        bound: function (moveX, moveY) {
            var x = this.x,
                y = this.y,
                w = this.w,
                h = this.h,
                tickness = this.tickness,
                xt = x + w,
                yt = y + h;

            var direction = {
                bottom: function (moveX, moveY) {
                    var center = {
                        x: x + w / 2,
                        y: yt
                    };
                    return (x + tickness <= moveX
                        && xt - tickness >= moveX
                        && moveY >= yt - tickness
                        && moveY <= yt) ? center : false;
                },
                top: function (moveX, moveY) {

                    var center = {
                        x: x + w / 2,
                        y: y
                    };
                    return (x + tickness <= moveX && xt - tickness >= moveX
                        && moveY >= y
                        && moveY <= y + tickness) ? center : false;

                },
                left: function (moveX, moveY) {
                    var center = {
                        x: x,
                        y: y + h / 2
                    };

                    return (
                        x <= moveX
                        && x + tickness >= moveX
                        && moveY >= y
                        && moveY <= yt
                    ) ? center : false;

                },
                right: function (moveX, moveY) {

                    var center = {
                        x: xt,
                        y: y + h / 2
                    };

                    return (
                        xt - tickness <= moveX
                        && xt >= moveX
                        && moveY >= y
                        && moveY <= yt
                    ) ? center : false;
                }
            }

            for (var propertName in direction) {
                var _check = direction[propertName](moveX, moveY);
                if (_check) {
                    return _check;
                }
            }

            return false;
        },
        move: function (element, d) {
            var self = this;
            self.x = d.clientX - self.disX - self.cx;
            self.y = d.clientY - self.disY - self.cy;

            element.attr({
                x: self.x,
                y: self.y
            });

            if (self.brush && this.category === 'node') {
                self.brush.attr({
                    x: (element.x() + (element.width() / 2)),
                    y: element.y() + (element.height() / 2) + self.vertical()
                });
            }

            Node.base.Parent.prototype.move.call(this);
        },
        validate: function () {
            return (Draw.findById(this.$id, 'to').length > 0
                && Draw.findById(this.$id, 'from').length > 0);
        },
        vertical: function () {
            return util.ie ? 6 : 0;
        }
    });

    /**
     * 开始和结束图形的基类定义
     * 继承Shape形状
     * @param {any} name
     * @param {any} category
     */
    function Circle(name, category) {
        this.x = 10;
        this.y = 10;
        this.cx = 40;
        this.cy = 10;
        this.disX = 0;
        this.disY = 0;
        Circle.base.Constructor.call(this, name, category);
    }

    Circle.extend(Shape, {
        draw: function () {
            return Circle.base.Parent.prototype.draw.call(this);
        },
        move: function (element, d) {
            var self = this;
            self.x = d.clientX - self.disX - self.cx;
            self.y = d.clientY - self.disY - self.cy;
            element.move(self.x, self.y);
            if (self.brush) {
                self.brush.attr({
                    x: (element.x() + (element.width() / 2)),
                    y: element.y() + (element.height() / 2)
                });
            }
            Circle.base.Parent.prototype.move.call(self);
        },
        validate: function () {
            return (Draw.findById(this.$id, 'to').length > 0
                && Draw.findById(this.$id, 'from').length > 0);
        },
        bound: function (mX, mY) {
            var r = 30,
                cx = this.x + r,
                cy = this.y,
                z = r * 2;
            var tickness = this.tickness;

            var direction = {
                bottom: {
                    x1: cx - r,
                    y1: cy + r,
                    x2: cx - r,
                    y2: cy + r - tickness,
                    x3: cx + z - r,
                    y3: cy + r - tickness,
                    x4: cx - r + z,
                    y4: cy + r,
                    check: function (moveX, moveY) {

                        /*检测边界*/
                        var center = {
                            x: cx,
                            y: cy + r
                        };

                        return (this.x1 <= moveX &&
                            this.x3 >= moveX &&
                            this.y1 >= moveY &&
                            this.y2 <= moveY) ? center : false;
                    }

                },
                top: {
                    x1: cx - r,
                    y1: cy - r,
                    x2: cx - r,
                    y2: cy - r + tickness,
                    x3: cx + z - r,
                    y3: cy - r,
                    x4: cx + z - r,
                    y4: cy - r + tickness,
                    check: function (moveX, moveY) {

                        /*检测边界*/
                        var center = {
                            x: cx,
                            y: cy - r
                        };

                        /*检测边界*/
                        return (this.x1 <= moveX &&
                            this.x3 >= moveX &&
                            this.y1 <= moveY &&
                            this.y2 >= moveY) ? center : false;
                    }
                },
                left: {
                    x1: cx - r,
                    y1: cy - r + tickness,
                    x2: cx - r,
                    y2: cy + r - tickness,
                    x3: cx - r + tickness,
                    y3: cy - r + tickness,
                    x4: cx - r + tickness,
                    y4: cy + r - tickness,
                    check: function (moveX, moveY) {

                        /*检测边界*/
                        var center = {
                            x: cx - r,
                            y: cy
                        };

                        /*检测边界*/
                        return (this.x1 <= moveX &&
                            this.x3 >= moveX &&
                            this.y1 <= moveY &&
                            this.y2 >= moveY) ? center : false;

                        //上下上下
                    }
                },
                right: {
                    x1: cx + r,
                    y1: cy - r + tickness,
                    x2: cx + r,
                    y2: cy + r - tickness,
                    x3: cx + r - tickness,
                    y3: cy - r + tickness,
                    x4: cx + r - tickness,
                    y4: cy + r - tickness,
                    check: function (moveX, moveY) {

                        /*检测边界*/
                        var center = {
                            x: cx + r,
                            y: cy
                        };

                        /*检测边界*/
                        return (this.x1 >= moveX &&
                            this.x3 <= moveX &&
                            this.y1 <= moveY &&
                            this.y2 >= moveY) ? center : false;
                    }
                }
            }
            for (var propertName in direction) {
                var _o = direction[propertName],
                    check = _o.check(mX, mY);
                if (check) {
                    return check;
                }
            }
            return false;
        }
    });

    function Decision() {
        Decision.base.Constructor.call(this);
        this.name = '分支节点';
        this.category = 'decision';
        this.command = undefined;
        this.x = 10;
        this.y = 10;
        this.cx = 40;
        this.cy = 10;
        this.disX = 0;
        this.disY = 0;
        this.w = 20;
        this.h = 100;

    }

    Decision.extend(Shape, {
        draw: function () {
            var dw = this.drawInstance.draw;
            var el = dw.use(this.drawInstance._decision)
                .move(this.x, this.y);

            this.$id = el.id();
            Draw._proto_NC[this.$id] = this;
            Decision.base.Parent.prototype.draw.call(this);
        },
        setExpression: function (expressions) {
            $.each(expressions, function () {
                Draw._proto_LC[this.id].expression = this.expression;
            });
        },
        move: function (element, d) {
            var self = this;
            self.x = d.clientX - self.disX - self.cx;
            self.y = d.clientY - self.disY - self.cy;
            element.attr({ x: self.x, y: self.y });
            Decision.base.Parent.prototype.move.call(this);
        },
        validate: function () {
            return (Draw.findById(this.$id, 'from').length > 1
                && Draw.findById(this.$id, 'to').length > 0);
        },
        bound: function (mX, mY) {

            var n = SVG.get(this.$id);

            var x = n.x(),
                y = n.y(),
                w = this.w,
                h = this.h,
                tickness = this.tickness,
                xt = x + w,
                yt = y + h;

            var direction = {
                bottom: function (moveX, moveY) {
                    var center = {
                        x: 10 + n.x(),
                        y: n.y() + 90
                    };
                    return (x <= moveX && xt >= moveX
                        && moveY >= yt - tickness
                        && moveY <= yt) ? center : false;
                },
                top: function (moveX, moveY) {

                    var center = {
                        y: n.y(),
                        x: 10 + n.x()
                    };

                    return (x <= moveX && xt >= moveX
                        && moveY >= y
                        && moveY <= y + tickness) ? center : false;
                },
                left: function (moveX, moveY) {
                    return false;
                },
                right: function (moveX, moveY) {
                    return false;
                }
            }

            for (var propertName in direction) {
                var _check = direction[propertName](mX, mY);
                if (_check) {
                    return _check;
                }
            }
            return false;
        },
        exportDecision: function (build) {
            var self = this;
            if (self.command) {

                build.append(config.start)
                    .append('command')
                    .append(config.end);

                $.each(self.command, function (propertyName, value) {
                    build.append(config.start)
                        .append(propertyName)
                        .append(config.end)
                        .append("<![CDATA[")
                        .append(value)
                        .append("]]>")
                        //.append(value)
                        .append(config.beforeClose)
                        .append(propertyName)
                        .append(config.end);
                });

                build.append(config.beforeClose)
                    .append('command')
                    .append(config.end);
            }
        }
    });

    function Start() {
        Start.base.Constructor.call(this, "开始", "start");
    }

    Start.extend(Circle, {
        draw: function () {
            var dw = this.drawInstance.draw;
            var path = dw.path("M0,0 a30 30 0 1 0 0 -0.1").
                fill("#eee").
                stroke({
                    width: 1,
                    color: "#ccc"
                });

            var g = dw.group()
                .add(path)
                .add(dw.path("M10,0 a20 20 0 1 0 0 -0.1").fill("green"));

            dw.defs().add(g);
            var start = dw
                .use(g)
                .move(this.x, this.y);


            this.$id = start.id();
            Draw._proto_NC[this.$id] = this;
            Start.base.Parent.prototype.draw.call(this);
        },
        bindEvent: function (n) {
            Start.base.Parent.prototype.bindEvent.call(this, n);
            this.off('dblclick');
        },
        validate: function () {
            return (Draw.findById(this.$id, 'from').length > 0
                && Draw.findById(this.$id, 'to').length == 0);
        }
    });

    function End() {
        End.base.Constructor.call(this);
        this.category = "end";
        this.name = "结束";
    }

    End.extend(Circle, {
        constructor: End,
        draw: function () {
            var dw = this.drawInstance.draw,
                path = dw.path("M0,0 a30 30 0 1 0 0 -0.1")
                    .stroke({ width: 1, color: "#ccc" })
                    .fill("#eee");

            var group = dw.group()
                .add(path)
                .add(dw.path("M10,0 a20 20 0 1 0 0 -0.1")
                    .fill("red"));

            dw.defs().add(group);
            var end = dw.use(group).move(this.x, this.y);

            this.$id = end.id();
            Draw._proto_NC[this.$id] = this;
            End.base.Parent.prototype.draw.call(this);
        },
        bindEvent: function (n) {
            End.base.Parent.prototype.bindEvent.call(this, n);
            //this.off('dblclick');
        },
        validate: function () {
            return (Draw.findById(this.$id, 'from').length == 0
                && Draw.findById(this.$id, 'to').length > 0);
        }
    });


    function XML(xml) {
        this.xml = xml;
        this.support = (window.ActiveXObject);
        this.docXml = undefined;
        this.root = {};
        this.init();
    }

    XML.config = {
        group: [],
        acotr: [],
        action:[],
        transition: [],
        marker: []
    }

    XML.contains = function (name) {
        var result = false;
        $.each(['command', 'transition'], function (i, value) {
            if (value == name) {
                result = true;
            }
        });
        return result;
    }

    XML.getAttributes = function (attrs) {
        if (!attrs) return {};
        var O = {};
        var len = attrs.length;
        for (var i = 0; i < len; i++) {
            var attr = attrs[i];
            O[attr.name] = attr.value;
        }
        return O;
    }

    XML.convert = function (nodes) {
        var O = {};
        $.each(nodes, function () {
            if (!O[this.nodeName] && this.nodeName !== "marker") {
                O[this.nodeName] = XML.getValue(this);
            } else {
                if (O[this.nodeName]) {
                    O[this.nodeName].push(XML.marker(this));
                } else {
                    O[this.nodeName] = [XML.marker(this)];
                }
            }
        });
        return O;
    }

    XML.marker = function (node) {
        return XML.getAttributes(node.attributes);
    }

    XML.getValue = function (node) {
        return (node.textContent || node.text || node.value);
    }

    XML.single = function (process, node, contains) {
        var attr = XML.getAttributes(node.attributes),
            name = node.nodeName,
            innerObject = $.extend(attr,
                (contains) ? XML.convert(node.childNodes) : {
                    name: XML.getValue(node)
                });

        process[name] = XML.config[name] ? [innerObject] : innerObject;
    }

    XML.multiple = function (process, node, contains) {

        var attr = XML.getAttributes(node.attributes),
            name = node.nodeName,
            innerArray = [];

        var newObject = contains ?
            $.extend(attr, XML.convert(node.childNodes)) :
            $.extend(attr, { name: XML.getValue(node) });

        if ($.isArray(process[name])) {
            process[name].push(newObject);
        } else {
            $.each([newObject, process[name]], function () {
                innerArray.push(this);
            });
            process[name] = innerArray;
        }
    }

    XML.prototype.init = function () {

        if (this.support) {
            this.docXml = new ActiveXObject("Microsoft.XMLDOM");
            this.docXml.async = false;
            this.docXml.loadXML(this.xml);
        } else {
            this.docXml = new DOMParser()
                .parseFromString(this.xml, "text/xml");
        }
        var el = this.docXml.firstChild;
        this.root[el.nodeName] = el.childNodes.length > 0 ? [] : {};
        this.parse(this.root[el.nodeName], el.childNodes);
    }

    XML.prototype.parse = function (process, nodes) {
        var $this = this;
        $.each(nodes, function () {
            var node = this,
                attr = XML.getAttributes(node.attributes),
                name = node.nodeName;

            if ($.isArray(process)) {
                var result = XML.getAttributes(node.attributes);
                process.push(result);

                var elementCount = (node.childElementCount || node.childNodes.length);

                if (elementCount > 0) {
                    $this.parse(result, node.childNodes);
                }
            } else {

                XML[
                    process[name] ?
                        "multiple" :
                        "single"
                ](process, node, XML.contains(name));
            }
        });
    }

    $.fn.SMF = function (option) {
        var id = $(this).attr("id");
        Draw._proto_Cc[id] = new Draw(option);
    }

    $.SMF = {
        get: function (id) {
            return Draw._proto_Cc[id];
        }
    }

})(jQuery);

