; (function () {

    function Main(option) {

        this.settings = $.extend({}, option);

        this._initEvent();

        this.show();
    }

    Main.prototype.show = function () {

        var $this = this,
            settings = $this.settings;

        //iframe窗
        util.create({
            id: 'common_pending',
            type: 1,
            title: "待办事项",
            width: 400,
            height: 400,
            offset: 'rb',
            aim: 2,
            content: settings.tableTemplate,
            shade: false,
            success: function () {
                $.each(['_render', '_on'], function (i, propertyName) {
                    $this[propertyName]();
                });
            }
        });
    }

    Main.prototype._render = function () {
        var $this = this,
            settings = $this.settings;

        util.ajaxPost({
            url: settings.url,
            success: function (serverData) {

                var htmlArray = [];
                $.each(serverData, function () {
                    var template = settings.rowTemplate;

                    htmlArray.push(
                        template
                            .replace(/{{url}}/ig, this.APPELLATION)
                            .replace(/{{instanceID}}/ig, this.INSTANCEID)
                    );
                });

                $(settings.selector).html(htmlArray.join(''));
            }
        });

    }

    Main.prototype._on = function () {

        var $this = this,
            settings = $this.settings;

        $(settings.id).on('click', 'tbody tr td', function () {
            var instanceID = $(this).attr("instanceID"),
                url = settings.audit + '?url=' + $(this).attr('url') + "&instanceID=" + instanceID;

            util.create({
                content: url,
                title: false,
                width: 960,
                height: 560
            });
        });
    }

    Main.prototype._initEvent = function () {

        var $this = this;

        $(".menu_title").click(function () {
            var element = $(this).parent().children('ul').first();
            if (element.is(":hidden")) {
                element.show('fast');
            } else {
                element.hide('slow');
            }

            $(this).parent().siblings().each(function () {
                var ele = $(this).find("ul.menu_sub_items");
                if (!ele.is(":hidden")) {
                    ele.hide('slow');
                }
            });
        });

        //默认展开节点
        $("#menu div.menu_title:eq(0)").trigger('click');

        $(".menu_sub_items li span").click(function () {
            var url = $(this).attr("url"),
                text = $(this).text();

            $($this.settings.iframeContent).attr("src", url);
        });

        //下拉框
        $("#smartflow_drop_items li").click(function () {
            var command = $(this).attr("command");
            switch (command) {
                case "exit":
                    window.top.location.href = $this.settings.login;
                    break;
                case "message":
                    $this.show();
                    break;
                default:
                    break;
            }
        });
    }

    $.Main = function (option) {
        return new Main(option);
    }

})();
