/********************************************************************
 License: https://github.com/chengderen/Smartflow/blob/master/LICENSE 
 Home page: https://www.smartflow-sharp.com
 ********************************************************************
 */
(function () {
    var
        cmdSelector = '#txtCommand',
        optionSelector = '#ddlDataSource option:selected',
        ruleSelector = '#ddlDataSource',
        config = {};

    function initOption(option) {
        config = $.extend(config, option);
    }

    function setSettingsToNode(nx) {
        var roleArray = [],
            expressions = [],
            name = $("#txtNodeName").val();
        if (nx.category.toLowerCase() === 'decision') {
            $("#expression  textarea").each(function () {
                var input = $(this);
                expressions.push({
                    id: input.attr("id"),
                    expression: input.val()
                        .replace(/\r\n/g, ' ')
                        .replace(/\n/g, ' ')
                        .replace(/\s/g, ' ')
                });
            });

            var cmdText = $(cmdSelector).val()
                .replace(/\r\n/g, ' ')
                .replace(/\n/g, ' ')
                .replace(/\s/g, ' ');

            var sourceID = $(optionSelector).val();
            if (cmdText != '' && cmdText) {
                nx.command = {
                    id: sourceID,
                    text: cmdText
                };
            }

            nx.setExpression(expressions);

        } else {

            var transfer = layui.transfer,
                rightData = transfer.getData('rightGroup'); 

            $(rightData).each(function () {
                var self = this;
                roleArray.push({
                    id: self.value,
                    name: self.title
                });
            });
            nx.group = roleArray;

            var actorArray = [];
            //获取
            var checkbox = getCheckbox();
            $.each(checkbox.all, function () {
                var self = $(this);
                actorArray.push({
                    id: self.attr('actorID'),
                    name: self.attr('actor')
                });
            });
            nx.actor = actorArray;
        }

        if (name && nx.brush) {
            nx.name = name;
            nx.brush.text(nx.name);
        }
    }

    function setNodeToSettings(nx) {
        $("#txtNodeName").val(nx.name);
        if (nx.category.toLowerCase() === 'decision') {
            var LC = nx.getTransitions();
            if (LC.length > 0) {
                var template = document.getElementById("common_expression").innerHTML,
                    elementArray = [];

                $.each(LC, function (i) {
                    elementArray.push(template
                        .replace(/{{name}}/, this.name)
                        .replace(/{{expression}}/, this.expression)
                        .replace(/{{id}}/, this.$id)
                    );
                });

                $("#expression").html(elementArray.join(''));
            }
            loadSelect(nx.command);
        } else {
            loadGroup(nx.group);
            loadActor(nx.actor);
        }

        var nodeName = nx.category.toLocaleLowerCase();
        var el = layui.element;
        var tabs= {
            node: ['workflow-rule', 'workflow-form'],
            decision: ['workflow-role', 'workflow-form', 'workflow-actor'],
            start: ['workflow-rule', 'workflow-role', 'workflow-info', 'workflow-actor']
        }
        $.each(tabs[nodeName], function (index,propertyName) {
            el.tabDelete('tabs', propertyName);
        });
    }

    function loadActor(actors) {

        initRightActor(actors);
        initLeftActor(actors);
    }

    function initRightActor(actors) {

        var table = layui.table;
        var form = layui.form;
        var template = document.getElementById("common_user").innerHTML;

        //init 
        $(actors).each(function () {
            $("#assign_to_actor").append(template
                .replace(/{{name}}/ig, this.name)
                .replace(/{{value}}/, this.id)
            );
        });
        form.render('checkbox', 'assign_to_actor');

        //start right
        form.on('checkbox(chkAll)', function (data) {
            var checkStatus = $(this).prop('checked');
            $("#selectItems .select-item").each(function (index, el) {
                $(this).prop('checked', checkStatus);
            });
            form.render('checkbox');
            doLeftCheckStatus();
        });

        form.on('checkbox(custTransferCheck)', function (data) {
            var checkbox = getCheckbox(),
                total = $("#selectItems .select-item").length;

            if (checkbox.select.length == total) {
                $("#selectAll").prop('checked', true);
            } else {
                $("#selectAll").prop('checked', false);
            }
            form.render('checkbox', "selectAll");
            doLeftCheckStatus();
        });

        function doLeftCheckStatus() {
            var checkbox = getCheckbox(),
                total = $("#selectItems .select-item").length;
            if (checkbox.select.length == 0) {
                var isClass = $('#to_left').hasClass('layui-btn-disabled');
                if (!isClass) {
                    $('#to_left').addClass('layui-btn-disabled');
                    $('#to_left').prop('disabled', 'disabled');
                }
            } else {
                var isClass = $('#to_left').hasClass('layui-btn-disabled');
                if (isClass) {
                    $('#to_left').removeClass('layui-btn-disabled');
                    $('#to_right').removeProp('disabled');
                }
            }
        }

        $('#to_left').click(function () {

            var checkbox = getCheckbox();
            var userIDs = [];

            $(checkbox.select).each(function () {
                $(this).parent().remove();
            });

            $(checkbox.unSelect).each(function () {
                userIDs.push($(this).attr('actorID'));
            });

            $(this).addClass('layui-btn-disabled');

            $("#selectAll").prop('checked', false);
            form.render('checkbox', "selectAll");
            form.render('checkbox', 'assign_to_actor');


            table.reload('users', {
                where: {
                    actorIDs: userIDs.join(',')
                }
            });
        });
        //end right
    }

    function getCheckbox() {
        var select = [], unselect = [],all=[];
        $("#selectItems .select-item").each(function (index, el) {
            var checkStatus = $(this).prop('checked');
            all.push(this);
            if (checkStatus) {
                select.push(this);
            } else {
                unselect.push(this);
            }
        });
        return {
            select: select,
            unSelect: unselect,
            all: all
        };
    }

    function initLeftActor(actors) {

        var table = layui.table;
        var form = layui.form;

        var whereArray = [];
        $.each(actors, function () {
            whereArray.push(this.id);
        });

        //start left
        //展示已知数据
        table.render({
            elem: '#assign_actor'
            , id: 'users'
            , toolbar: '#tools'
            , defaultToolbar: false
            , url: config.actorUrl
            , page: {
                layout: ['prev', 'page', 'next']
                , groups: 5
            }
            , where: {
                actorIDs: whereArray.join(',')
            }
            , height: 340
            , width: 340
            , request: {
                pageName: 'pageIndex'
                , limitName: 'pageSize'
            }
            , response: {
                statusName: 'code'
                , statusCode: 0
                , msgName: 'msg'
                , countName: 'total'
                , dataName: 'rows'
            }
            , method: 'post'
            , cellMinWidth: 80
            , cols: [[
                { type: 'checkbox', fixed: 'left' },
                { field: 'Name', title: '用户名', width: 113, sort: false },
                { field: 'Data', title: '组织机构', width: 140, sort: false, templet: '<div>{{d.Data.OrgName}}</div>' }
            ]]
            , skin: 'line'
            , limit: 5
            , done: function () {
                doRightCheckStatus();
            }
        });

        function doRightCheckStatus() {
            var selectRow = table.checkStatus('users');
            if (selectRow.data.length == 0) {
                var isClass = $('#to_right').hasClass('layui-btn-disabled');
                if (!isClass) {
                    $('#to_right').addClass('layui-btn-disabled');
                    $('#to_right').prop('disabled', 'disabled');
                }
            } else {
                var isClass = $('#to_right').hasClass('layui-btn-disabled');
                if (isClass) {
                    $('#to_right').removeClass('layui-btn-disabled');
                    $('#to_right').removeProp('disabled');
                }
            }
        }

        table.on('checkbox(users)', function () {
            doRightCheckStatus();
        });
        $('#to_right').click(function () {
            var selectRow = table.checkStatus('users'),
                template = document.getElementById("common_user").innerHTML;

          
            $(selectRow.data).each(function () {
                $("#assign_to_actor").append(template
                    .replace(/{{name}}/ig, this.Name)
                    .replace(/{{value}}/, this.ID)
                );
            });

            form.render('checkbox', 'assign_to_actor');
            renderer();
        });
        function renderer(searchKey) {
            var checkbox = getCheckbox();
            var userIDs = [];
            $.each(checkbox.all, function () {
                userIDs.push($(this).attr('actorID'));
            });
            table.reload('users', {
                where: {
                    actorIDs: userIDs.join(','),
                    searchKey: (searchKey || '')
                }
            });
        }

        table.on('toolbar(users)', function (e) {
            var source= e.event; 
            if (source === 'query') {
                var value = $("#txtSearchKey").val();
                renderer(value);
            }
        });
    }

    function loadGroup(group) {

        var ajaxSettings = { url: config.roleUrl };
        ajaxSettings.data = ajaxSettings.data || {};

        ajaxSettings.success = function (serverData) {

            var leftDataSource = [], rightDataSource = [];

            $.each(serverData, function () {
                leftDataSource.push({
                    value: this.ID,
                    title: this.Name,
                    disabled: '',
                    checked: ''
                })
            });
            $.each(group, function () {
                rightDataSource.push(this.id);
            });

            var transfer = layui.transfer;

            //基础效果
            transfer.render({
                elem: '#transfer'
                , title: ['待选择', '已选择']
                , data: leftDataSource
                , value: rightDataSource
                , height: 325
                , width: 250
                , id: 'rightGroup'
            })
        };
        ajaxService(ajaxSettings);
    }
    function loadSelect(command) {
        ajaxService({
            url: config.configUrl,
            success: function (serverData) {

                $.each(serverData, function (index, item) {
                    var data = JSON.stringify(this),
                        option = new Option(this.NAME, this.ID);
                    option.setAttribute("data", escape(data));
                    $(ruleSelector).append(option);
                });

                if (command) {
                    $(cmdSelector).val(command.text);
                    $(ruleSelector).val(command.id);
                }


                layui.form.render("select");

            }
        });
    }

    function ajaxService(settings) {
        var defaultSettings = $.extend({
            dataType: 'json',
            type: 'post',
            cache: false
        }, settings);
        $.ajax(defaultSettings);
    }

    window.SMF = {
        init: initOption,
        setNodeToSettings: setNodeToSettings,
        setSettingsToNode: setSettingsToNode
    };

})();