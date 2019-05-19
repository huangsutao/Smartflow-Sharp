$(function () {
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
    $("#menu div.menu_title:eq(0)").trigger('click');
    $("#tabs li").on('click', function () {
        var self = $(this);
        if (!self.hasClass("smartflow_tab_select")) {
            self.addClass("smartflow_tab_select");
            var tab = self.attr("tab");

            $("div.smartflow_tab_content").filter("div[tab=" + tab + "]").show();

        }
        self.siblings().each(function () {
            if ($(this).hasClass("smartflow_tab_select")) {
                $(this).removeClass("smartflow_tab_select");
            }

            $("div.smartflow_tab_content").filter("div[tab=" + $(this).attr("tab") + "]").hide();
        });
    });


    $(".menu_sub_items li span").click(function () {
        var url = $(this).attr("url"),
            text = $(this).text();

        $("#ifrmContent").attr("src", url);

    });

});