using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

using Smartflow.BussinessService.WorkflowService;
using Smartflow.BussinessService.Services;
using Smartflow.BussinessService.Models;
using Smartflow.Web.Mvc.Controllers;
using Smartflow.Web.Mvc.Code;

namespace Smartflow.Web.Controllers
{
    public class DefaultController : BaseController
    {
        private WorkflowDesignService workflowStructureService = new WorkflowDesignService();
        private PendingService pendingService = new PendingService();
        

        public ActionResult Main()
        {
            return View();
        }

        public ActionResult List()
        {
            return View(workflowStructureService.GetWorkflowStructureList());
        }

        public JsonResult Delete(string WFID)
        {
            workflowStructureService.Delete(WFID);
            return Json(true);
        }

        [HttpPost]
        public JsonResult GetPendingList()
        {
            return Json(pendingService.Query(mdl => mdl.ACTORID == UserInfo.IDENTIFICATION.ToString()));
        }

        public JsonResult GetPendingCount()
        {
            List<Pending> pendingList = pendingService.Query(pending =>
                pending.ACTORID == UserInfo.IDENTIFICATION.ToString());

            return Json(pendingList.Count);
        }

        [UnAuthorizationMethodFilter]
        public ActionResult Login()
        {
            return View();
        }
    }
}
