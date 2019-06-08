; (function () {

    var currentIndex;

    window.util = {
        ajaxPost: function (option) {
            var defaultSettings = {
                type: 'post',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json'
            };
            $.ajax($.extend(defaultSettings, option));
        },
        openProcessImage: function (url) {
            this.create({
                content: url,
                title: '流程查看',
                width: 960,
                height: 560
            })
        },
        open: function (url, w, h) {
            var x = window.screen.availHeight;
            var y = window.screen.availWidth;
            var centerTop = (x - h) / 2;
            var centerLeft = (y - w) / 2;
            window.open(url, "", "width=" + w + ",height=" + h + ",top=" + centerTop + ",left=" + centerLeft);
        },
        create: function (option) {
            var defaultSettings = {
                type: 2,
                title: false,
                closeBtn: 1,
                shade: [0.5],
                shadeClose: false,
                area: [option.width + 'px', option.height + 'px'],
                offset: 'auto',
            };

            //iframe窗
            currentIndex = layer.open($.extend(defaultSettings, option));
        },
        close: function (callback) {
            //iframe窗
            if (currentIndex) {

                callback && callback.call(window);

                layer.close(currentIndex);
            }
        },
        isEmpty: function (value) {
            return (value == '') ? false : true;
        },
        refreshPage: function () {
            /*刷新界面 */
            var url = window.location.href;
            if (url.indexOf("?") > -1) {
                url = url.substring(0, url.lastIndexOf("?"));
            }
            window.location.href = url + '?t=' + new Date().getTime();
        }
    };

})();