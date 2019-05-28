/********************************************************************
 *License: https://github.com/chengderen/Smartflow/blob/master/LICENSE 
 *Home page: https://www.smartflow-sharp.com
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
        to: 'destination'
    };

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

    Draw.checkOrientation = function (instance) {
        return instance.attr('y1') < instance.attr('y2') ? 'down' : 'up';
    }

    Draw.prototype._init = function () {
        var self = this,
            dw = self.draw;

        self.draw.mouseup(function (e) {
            self.draw.off('mousemove');
        });

        self._initEvent();
        self._decision = dw.group()
            .add(dw.path("M0 0,l20 0,v0 100,l-10 -15,l-10 15z").fill("#f06"));

        dw.defs().add(self._decision);

    }

    Draw.prototype._initEvent = function () {
        var self = this;
        self.draw.each(function () {
            switch (this.type) {
                case "rect":
                case "use":
                    this.off('mousedown');
                    break;
                default:
                    break;
            }
        });
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
            var y = evt.clientY - instance.cy,
                x = evt.clientX - instance.cx;

            this._shared = new Line();
            this._shared.drawInstance = this;

            this._shared.x1 = x;
            this._shared.y1 = y;
            this._shared.x2 = x;
            this._shared.y2 = y;
            this._shared.draw();
            this.source = {
                id: nodeId,
                x: x,
                y: y
            };
        }
    }

    Draw.prototype._join = function (evt) {
        if (this._shared) {
            //连线
            this._shared.x2 = evt.clientX - 40;
            this._shared.y2 = (this._shared.y1 > evt.clientY) ? evt.clientY + 15 : evt.clientY - 15;
            this._shared.move();
        }
    }
    Draw.prototype._end = function (node,check) {
        var self = this;
        nodeName = node.nodeName,
            nodeId = node.id;
        var toRect = SVG.get(nodeId),
            fromRect = SVG.get(self.source.id),
            nt = Draw._proto_NC[nodeId],
            nf = Draw._proto_NC[self.source.id],
            instance = self._shared,
            l = SVG.get(instance.id),
            r = SVG.get(self.source.id);

        this.source.to = nodeId;
        instance.move();

        if (check) {
            Draw._proto_RC.push({
                id: instance.id,
                from: this.source.id,
                to: nodeId,
                ox2: l.attr("x2") - toRect.x(),
                oy2: l.attr("y2") - toRect.y(),
                ox1: l.attr("x1") - fromRect.x(),
                oy1: l.attr("y1") - fromRect.y()
            });
        }
    }

    Draw.prototype.join = function () {
        //线连接
        var self = this;
        this._initEvent();
        this.draw.off('mousedown').on('mousedown', function (evt) {
            var node = Draw.getEvent(evt);
            if (node) {
                self._start.call(self, node, evt);
                self.draw.on('mousemove', function (e) {
                    self._join.call(self, e);
                });
            }
        });
        this.draw.on('mouseup', function (evt) {
            var node = Draw.getEvent(evt),
                checkResult = (node);

            if (checkResult) {
                nodeName = node.nodeName,
                    nodeId = node.id;
                checkResult = ((nodeName == 'rect' || nodeName == 'use') && self.source);

                if (checkResult) {
                    var nt = Draw._proto_NC[nodeId],
                        nf = Draw._proto_NC[self.source.id];

                    checkResult = (
                        nodeId !== self.source.id
                        && !nt.check(nf)
                        && !Draw.duplicateCheck(self.source.id, nodeId));

                    self._end.call(self, node, checkResult);
                }
            }

            if (!checkResult) {
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
        var convertType;
        switch (category) {
            case "node":
                convertType = new Node();
                break;
            case "start":
                convertType = new Start();
                break;
            case "end":
                convertType = new End();
                break;
            case "decision":
                convertType = new Decision();
                break;
            default:
                break;
        }
        convertType.drawInstance = this;
        convertType.x = Math.floor(Math.random() * 200 + 1);
        convertType.y = Math.floor(Math.random() * 200 + 1);
        if (!after) {
            convertType.draw();
        }
        return convertType;
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
            Draw._proto_NC[propertyName].unique = generatorId();
        }

        build.append(config.rootStart);
        $.each(Draw._proto_NC, function () {
            var self = this;
            build.append(self.export());
        });

        build.append(config.rootEnd);

        return  escape(build.toString());
    }

    /**
     * 数据导入
     * */
    Draw.prototype.import = function (data, disable, currentNodeId, process) {
        var dwInstance = this;

        var record = process || [],
            findUID = function (destination) {
                var id;
                for (var i = 0, len = data.length; i < len; i++) {
                    var node = data[i];
                    if (destination == node.unique) {
                        id = node.id;
                        break;
                    }
                }
                return id;
            };
        $.each(data, function () {
            var node = this;
            node.category = (node.category.toLowerCase() == 'normal' ? 'node' : node.category.toLowerCase());
            var instance = dwInstance.create(node.category, true);
            $.extend(instance, node, util.parseNode(node.layout));
            instance.disable = (disable || false);
            instance.draw(currentNodeId);
            node.id = instance.id;
        });

        $.each(data, function () {
            var self = this;
            $.each(self.transitions, function () {
                var transition = new Line();
                transition.drawInstance = dwInstance;

                $.extend(transition, this, util.parseLine(this.layout));
                transition.disable = (disable || false);
                transition.draw();

                var destinationId = findUID(transition.destination),
                    destination = SVG.get(destinationId),
                    from = SVG.get(self.id),
                    line = SVG.get(transition.id);

                Draw._proto_RC.push({
                    id: transition.id,
                    from: self.id,
                    to: destinationId,
                    ox2: line.attr("x2") - destination.x(),
                    oy2: line.attr("y2") - destination.y(),
                    ox1: line.attr("x1") - from.x(),
                    oy1: line.attr("y1") - from.y()
                });
            });
        });
    }

    function Element(name, category) {
        //节点ID
        this.id = undefined;
        //文本画笔
        this.brush = undefined;
        //节点中文名称
        this.name = name;
        //节点类别（LINE、NODE、START、END,DECISION）
        this.category = category;
        this.unique = undefined;
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
                this.bindEvent.apply(SVG.get(this.id), [this]);
            }
        },
        bindEvent: function (el) {
            //绑定事件
            this.mousedown(function (evt) {
                el.drawInstance._drag.call(this, evt, el.drawInstance);
            });

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
        this.actors = [];
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
            var elements = Draw.findById(this.id, config.from),
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
            .append(self['unique'])
            .append(config.rQuotation)
            .append(config.space)
            .append(config.name)
            .append(config.equal)
            .append(config.lQuotation)
            .append(self[config.name])
            .append(config.rQuotation)
            .append(config.space)
            .append('layout')
            .append(config.equal)
            .append(config.lQuotation)
            .append(self.x + ' ' + self.disX + ' ' + self.y + ' ' + self.disY)
            .append(config.rQuotation)
            .append(config.end);

        $.each(self.group, function () {
            build.append(config.start)
                .append(config.group);
            eachAttributs(build, this);
            build.append(config.afterClose);
        });

        if (self.form) {
            var formElement = self.form;
            build.append(config.start)
                .append(config.form)
                .append(config.space)
                .append(config.name)
                .append(config.equal)
                .append(config.lQuotation)
                .append(formElement[config.name])
                .append(config.rQuotation)
                .append(config.end)
                .append("<![CDATA[")
                .append(formElement.text)
                .append("]]>")
                .append(config.beforeClose)
                .append(config.form)
                .append(config.end);
        }

        if (self.exportDecision) {
            self.exportDecision(build);
        }

        var elements = Draw.findById(self.id, config.from);
        $.each(elements, function () {
            if (this.from === self.id) {
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
                    .append(N.unique)
                    .append(config.rQuotation)
                    .append(config.space)
                    .append('layout')
                    .append(config.equal)
                    .append(config.lQuotation)
                    .append(L.x1 + ' ' + L.y1 + ' ' + L.x2 + ' ' + L.y2)
                    .append(config.rQuotation)
                    .append(config.end);

                if (self.category === 'decision') {

                    build.append("<![CDATA[")
                        .append(L.expression)
                        .append("]]>");
                }

                build.append(config.beforeClose)
                    .append(config.transition)
                    .append(config.end);
            }
        });

        $.each(self.actors, function () {
            build.append(config.start)
                .append(config.actor);
            eachAttributs(build, this);
            build.append(config.afterClose);
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

    function Line() {
        this.x1 = 0;
        this.y1 = 0;
        this.x2 = 0;
        this.y2 = 0;
        this.border = 3;
        this.orientation = 'down';
        this.expression = '';
        this.textPath = undefined;
        Line.base.Constructor.call(this, "line", "line");
    }

    Line.extend(Element, {
        constructor: Line,
        draw: function () {
            var self = this,
                dw = self.drawInstance,
                l = dw.draw.line(self.x1, self.y1, self.x2, self.y2);
            l.stroke({ width: self.border, color: self.bgColor });
            self.brush = dw.draw.text(self.name);

            l.marker('end', 10, 10, function (add) {
                add.path('M0,0 L0,6 L6,3 z').fill("#f00");
                this.attr({ refX: 5, refY: 2.9, orient: 'auto', stroke: 'none', markerUNits: 'strokeWidth' });
            });

            self.brush.attr({
                x: (self.x2 - self.x1) / 2 + self.x1,
                y: (self.y2 - self.y1) / 2 + self.y1
            });
            self.id = l.id();
            Draw._proto_LC[self.id] = this;
            return Line.base.Parent.prototype.draw.call(self);
        },
        bindEvent: function (l) {
            this.off('dblclick').on('dblclick', function (evt) {
                evt.preventDefault();
                var instance = Draw._proto_LC[this.id()];
                if (evt.ctrlKey && evt.altKey) {
                    Draw.removeById(instance.id);

                    this.off('dblclick');
                    instance.remove();
                } else {
                    var nodeName = prompt("请输入路线名称", instance.name);
                    if (nodeName) {
                        instance.name = nodeName;
                        instance.brush.text(instance.name);
                    }
                }
                return false;
            });
        },
        move: function () {

            var self = this,
                dw = self.drawInstance,
                instance = SVG.get(self.id),
                orientation = Draw.checkOrientation(instance),
                position;

            if (orientation == 'down') {
                if (!dw.source.to) {
                    var nl = Draw._proto_NC[dw.source.id];
                    if (nl.down) {
                        position = nl.down();
                        this.x1 = position.x;
                        this.y1 = position.y;
                    }
                }
                else {
                    var nl = Draw._proto_NC[dw.source.to];
                    if (nl.endDown) {
                        position = nl.endDown();
                        this.x2 = position.x;
                        this.y2 = position.y;
                    }
                }
            } else {
                if (!dw.source.to) {
                    var nl = Draw._proto_NC[dw.source.id];
                    if (nl.up) {
                        position = nl.up();
                        this.x1 = position.x;
                        this.y1 = position.y;
                    }
                }
                else {
                    var nl = Draw._proto_NC[dw.source.to];
                    if (nl.endUp) {
                        position = nl.endUp();
                        this.x2 = position.x;
                        this.y2 = position.y;
                    }
                }
            }

            instance.attr({
                x1: this.x1,
                y1: this.y1,
                x2: this.x2,
                y2: this.y2
            });

            this.brush.attr({
                x: (this.x2 - this.x1) / 2 + this.x1,
                y: (this.y2 - this.y1) / 2 + this.y1
            });

            Line.update(this);
        },
        remove: function () {
            var self = this,
                line = SVG.get(self.id),
                instance = Draw._proto_LC[self.id],
                marker = line.attr('marker-end'),
                arrow = /#[a-zA-Z0-9]+/.exec(marker)[0];

            $.each([arrow, self.id, instance.brush.id()], function (index, propertyName) {
                if (propertyName) {
                    SVG.get(propertyName).remove();
                }
            });

            delete Draw._proto_LC[self.id];
        }
    });

    Line.move = function (current) {

        var toElements = Draw.findById(current.id, "to"),
            fromElements = Draw.findById(current.id, "from");
        $.each(toElements, function () {
            var lineElement = SVG.get(this.id),
                instance = Draw._proto_LC[this.id];

            if (lineElement && instance) {
                instance.x2 = current.x + this.ox2;
                instance.y2 = current.y + this.oy2;
                lineElement.attr({ x2: instance.x2, y2: instance.y2 });
                instance.brush.attr({
                    x: (instance.x2 - instance.x1) / 2 + instance.x1,
                    y: (instance.y2 - instance.y1) / 2 + instance.y1
                });

                Line.update(instance);
            }
        });

        $.each(fromElements, function () {
            var lineElement = SVG.get(this.id),
                instance = Draw._proto_LC[this.id];
            if (lineElement && instance) {
                instance.x1 = current.x + this.ox1;
                instance.y1 = current.y + this.oy1;
                lineElement.attr({ x1: instance.x1, y1: instance.y1 });
                instance.brush.attr({
                    x: (instance.x2 - instance.x1) / 2 + instance.x1,
                    y: (instance.y2 - instance.y1) / 2 + instance.y1
                });

                Line.update(instance);
            }
        });
    }

    Line.update = function (current) {
        if (util.ie) {
            var draw = document.getElementById(current.drawInstance.drawOption.container),
                svg = draw.firstElementChild,
                el = document.getElementById(current.id);
            svg.removeChild(el);
            var cloneNode = el.cloneNode();
            svg.appendChild(cloneNode);

            var instance = Draw._proto_LC[current.id];
            instance.bindEvent.call(SVG.get(current.id), this);
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
                color = (b == n.unique && b && n.unique) ? n.bgCurrentColor : n.bgColor,
                rect = n.drawInstance.draw.rect(n.w, n.h).attr({ fill: color, x: n.x, y: n.y });

            if (this.category === 'node') {
                n.brush = n.drawInstance.draw.text(n.name);
                n.brush.attr({ x: n.x + rect.width() / 2, y: n.y + rect.height() / 2 + n.vertical() });
            }

            n.id = rect.id();
            Draw._proto_NC[n.id] = n;
            return Node.base.Parent.prototype.draw.call(this);
        },
        move: function (element, d) {
            var self = this;
            self.x = d.clientX - self.disX - self.cx;
            self.y = d.clientY - self.disY - self.cy;
            element.attr({ x: self.x, y: self.y });

            if (self.brush && this.category === 'node') {
                self.brush.attr({
                    x: (element.x() + (element.width() / 2)),
                    y: element.y() + (element.height() / 2) + self.vertical()
                });
            }
            Node.base.Parent.prototype.move.call(this);
        },
        validate: function () {
            return (Draw.findById(this.id, 'to').length > 0
                && Draw.findById(this.id, 'from').length > 0);
        },
        vertical: function () {
            return util.ie ? 6 : 0;
        },
        down: function () {
            var n = SVG.get(this.id);
            return {
                y: n.height() + n.y(),
                x: n.width() / 2 + n.x()
            };
        },
        endDown: function () {
            var n = SVG.get(this.id);
            return {
                y: n.y(),
                x: n.width() / 2 + n.x()
            };
        },
        endUp: function () {
            var n = SVG.get(this.id);
            return {
                y: n.y() + n.height(),
                x: n.width() / 2 + n.x() + 20
            };
        },
        up: function () {
            var n = SVG.get(this.id);
            return {
                y: n.y(),
                x: n.width() / 2 + n.x() + 20
            };
        }
    });

    /**
     * 开始和结束图形的基类定义
     * 继承Shape形状
     * @param {any} name
     * @param {any} category
     */
    function Circle(name, category) {
        //this.w = 180;
        //this.h = 40;
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
            return (Draw.findById(this.id, 'to').length > 0
                && Draw.findById(this.id, 'from').length > 0);
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
    }

    Decision.extend(Shape, {
        draw: function () {
            var dw = this.drawInstance.draw;
            var el = dw.use(this.drawInstance._decision)
                .move(this.x, this.y);

            this.id = el.id();
            Draw._proto_NC[this.id] = this;
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
            return (Draw.findById(this.id, 'from').length > 1
                && Draw.findById(this.id, 'to').length > 0);
        },
        down: function () {
            var n = SVG.get(this.id);
            return {
                x: 10 + n.x(),
                y: n.y() + 90
            };
        },
        up: function () {
            var n = SVG.get(this.id);
            return {
                x: 10 + n.x(),
                y: n.y()
            };
        },
        endDown: function () {
            var n = SVG.get(this.id);
            return {
                y: n.y(),
                x: 10 + n.x()
            };
        },
        endUp: function () {
            var n = SVG.get(this.id);
            return {
                y: n.y() + 90,
                x: 10 + n.x()
            };
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


            this.id = start.id();
            Draw._proto_NC[this.id] = this;
            Start.base.Parent.prototype.draw.call(this);
        },
        bindEvent: function (n) {
            Start.base.Parent.prototype.bindEvent.call(this, n);
            this.off('dblclick');
        },
        validate: function () {
            return (Draw.findById(this.id, 'from').length > 0
                && Draw.findById(this.id, 'to').length == 0);
        },
        down: function () {
            var n = SVG.get(this.id);
            return {
                x: n.x() + 30,
                y: n.y() + 30
            };
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

            this.id = end.id();
            Draw._proto_NC[this.id] = this;
            End.base.Parent.prototype.draw.call(this);
        },
        bindEvent: function (n) {
            End.base.Parent.prototype.bindEvent.call(this, n);
            this.off('dblclick');
        },
        validate: function () {
            return (Draw.findById(this.id, 'from').length == 0
                && Draw.findById(this.id, 'to').length > 0);
        },
        endDown: function () {
            var n = SVG.get(this.id);
            return {
                x: n.x() + 30,
                y: n.y() - 30
            };
        }
    });

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
