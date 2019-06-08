; (function () {

    function Audit(option) {

        this.settings = $.extend({}, option);

        var $this = this;
        $.each(['setCurrent', 'load', '_initEvent','loadAuditUser'], function (index, propertyName) {
            $this[propertyName]();
        });
    }

    //审核窗口
    Audit.prototype.openAuditWindow = function (callback) {
        var el = this;
        var $this = this.settings,
            index = util.create({
                title: '审批窗口',
                width: 600,
                height: 300,
                type: 1,
                content: $this.template,
                success: function () {

                    //绑定下拉框
                    el._bindSelect();

                    el._on();

                    callback && callback.call(this, index);
                }
            });
    }


    Audit.prototype._bindSelect = function () {
        //下拉框数据据绑定
        var $this = this.settings,
            select = $this.select;

        util.ajaxPost({
            url: select.url,
            data: { instanceID: $this.instanceID },
            success: function (serverData) {
                var dropTemplate = select.template;
                var htmlArray = [];
                $.each(serverData, function () {
                    var template = dropTemplate;

                    htmlArray.push(
                        template
                            .replace(/{{Destination}}/ig, this.Destination)
                            .replace(/{{NID}}/ig, this.NID)
                            .replace(/{{Name}}/ig, this.Name)
                    );
                });

                $(select.id).html(htmlArray.join(''));
            }
        });
    }

    //做动作
    Audit.prototype.doAction = function () {
        this.settings.iframeContent.saveForm(this.settings.instanceID);
    }

    //表单验证
    Audit.prototype.doValidation = function(){
        return this.settings.iframeContent.doValidation();
    }

    //表单验证
    Audit.prototype.getStructure = function () {
        return this.settings.iframeContent.getWorkflowId();
    }


    //加载当前审批信息
    Audit.prototype.loadAuditUser = function () {
        var template = "<span style=\"color: red;\">{{USERNAME}}({{EMPLOYEENAME}})</span>";

        //下拉框数据据绑定
        var settings = this.settings;
        if (util.isEmpty(settings.instanceID)) {
            util.ajaxPost({
                url: settings.auditUser,
                data: {
                    NID: settings.node.NID,
                    instanceID: settings.instanceID
                },
                success: function (serverData) {
                    var htmlArray = [];
                    $.each(serverData, function () {
                        var el = template;
                        htmlArray.push(
                            el.replace(/{{USERNAME}}/ig, this.USERNAME)
                                .replace(/{{EMPLOYEENAME}}/ig, this.EMPLOYEENAME)
                        );
                    });

                    $(settings.auditID).html('当前节点待办审批用户：' + htmlArray.join(''));
                }
            });
        }
    }


    //改变选项
    Audit.prototype.selectTab = function () {
        $("#tabs li:eq(1)").trigger('click');
    }

    //设置按钮状态
    Audit.prototype.setCurrent = function () {


        var $this = this,
            settings = $this.settings,
            node = settings.node;

        if (util.isEmpty(settings.instanceID)) {

            util.ajaxPost({
                url: node.url,
                async: false,
                data: {
                    instanceID: settings.instanceID
                },
                success: function (serverData) {
                    $this.settings.node.name = serverData.Name;
                    $this.settings.node.NID = serverData.NID;
                    $(node.id).val(serverData.Name);

                    if (serverData.Category.toLowerCase() == 'end') {
                        $(node.container).hide();
                    } else {
                        if (!serverData.HasAuth) {
                            $(node.id).addClass("layui-disabled");
                            $(node.id).attr("disabled", "disabled");
                        }
                    }
                }
            });
        }
    }

    /**
     * 加载审批记录
     */
    Audit.prototype.load = function () {

        var self = this,
            settings = self.settings,
            record = settings.record;

        if (util.isEmpty(settings.instanceID)) {
            util.ajaxPost({
                url: record.url,
                data: { instanceID: settings.instanceID },
                success: function (serverData) {
                    var recordTemplate = record.template;
                    var htmlArray = [];
                    $.each(serverData, function () {
                        var template = recordTemplate;
                        htmlArray.push(
                            template
                                .replace(/{{NODENAME}}/ig, this.NODENAME)
                                .replace(/{{MESSAGE}}/ig, this.MESSAGE)
                        );
                    });

                    $(record.id).html(htmlArray.join(''));
                }
            });
        }
    }


    Audit.prototype._initEvent = function () {
        $("#tabs li").click(function () {
            var $el = $(this),
                current_filter_selector = "div[relationship=" + $el.attr("relationship") + "]";

            if (!$el.hasClass("smartflow_tab_select")) {
                $el.addClass("smartflow_tab_select");
                $("div.smartflow_tab_content").filter(current_filter_selector).show();
            }

            $el.siblings().each(function () {
                if ($(this).hasClass("smartflow_tab_select")) {
                    $(this).removeClass("smartflow_tab_select");
                }
                var siblings_filter_selector = "div[relationship=" + $(this).attr("relationship") + "]";
                $("div.smartflow_tab_content").filter(siblings_filter_selector).hide();
            });
        });

        $("#tabs li:eq(0)").trigger('click');

        var $this = this;

        //审核按钮
        $("#btnAudit").click(function () {
            var buttonText = $(this).val(),
                methodName = buttonText === "开始" ? "start" : "openAuditWindow";

            if ($this.doValidation()) {
                $this[methodName]();
            } else {
                alert("请检查表单是否填写完整。");
            }
        });
    }


    Audit.prototype._on = function () {

        var $this = this;

        //审核窗口中确定按钮
        $("#btnOk")
            .unbind('click')
            .bind('click', function () {

                var from = $("#ddlOperate option:selected").val(),
                    message = $("#txtMessage").val(),
                    name = $this.settings.node.name;

                if (util.isEmpty(message)) {

                    $this.jump(from,
                        message,
                        function () {
                            util.close(function () {
                                if (name == '开始') {
                                    $this.doAction($this.settings.instanceID);
                                }

                                //加载审批记录
                                $.each(['load', 'selectTab', 'setCurrent','loadAuditUser'], function (index, propertyName) {
                                    $this[propertyName]();
                                });
                            });
                        });
                } else {
                    alert('请填写审批意见');
                }
            });
    }

    /**
     * 启动审批
     * */
    Audit.prototype.start = function () {
        var $this = this,
            structureID = $this.getStructure();
        util.ajaxPost({
            url: this.settings.url,
            data: { structureID: structureID},
            success: function (instanceID) {
                $this.settings.instanceID = instanceID;
                $this.openAuditWindow();
            }
        });
    }

    /**
     * 审核
     * @param {any} transition 选择路线
     * @param {any} message    审核消息
     * @param {any} callback   回调函数
     */
    Audit.prototype.jump = function (transition, message, callback) {
        var self = this,
            settings = this.settings;
        util.ajaxPost({
            url: settings.jump.url,
            traditional: true,
            data: {
                instanceID: settings.instanceID,
                transitionID: transition,
                url: settings.jump.pageUrl,
                message: message
            },
            success: function () {
                callback && callback.call(self, settings);
            }
        });
    }

    $.Audit = function (option) {
        new Audit(option);
    }

})();

