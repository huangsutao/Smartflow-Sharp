using Smartflow.BussinessService.WorkflowService;
using Smartflow.Web.Mvc.Code;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Routing;

namespace Smartflow.Web.Mvc
{
    // 注意: 有关启用 IIS6 或 IIS7 经典模式的说明，
    // 请访问 http://go.microsoft.com/?LinkId=9394801
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            //注册全局的动作 即每跳转一个节点，都会执行动作。
            WorkflowGlobalServiceProvider.RegisterGlobalService(new WorkflowAction());

            //注册局部动作 即只在跳转到特定的节点中执行的动作（目前还在实现中，现在只实现了一部份）
            WorkflowGlobalServiceProvider.RegisterPartService(new DefaultAction());
            WorkflowGlobalServiceProvider.RegisterPartService(new TestAction());

            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
        }
    }
}