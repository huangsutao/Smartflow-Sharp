/********************************************************************
 License: https://github.com/chengderen/Smartflow/blob/master/LICENSE 
 Home page: https://www.smartflow-sharp.com
 ********************************************************************
 */
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Data;
using System.Web.Script.Serialization;

using Smartflow;
using Smartflow.Elements;
using Smartflow.BussinessService.WorkflowService;

namespace Smartflow.Web.Mvc.Controllers
{
    public class WorkflowDesignController : BaseController
    {
        private WorkflowDesignService designService = new WorkflowDesignService();
        private AbstractBridgeService bridgeService = new BaseBridgeService();

        public ActionResult Design(string id)
        {
            ViewBag.WFID = id;
            return View();
        }

        public JsonResult GetWorkflowStructure(string WFID)
        {
            WorkflowStructure workflowStructure = designService.GetWorkflowStructure(WFID);
            return Json(new
            {
                appellation = workflowStructure.APPELLATION,
                structure = workflowStructure.STRUCTUREXML
            });
        }

        [HttpPost]
        public JsonResult Save(WorkflowStructure model)
        {
            model.STRUCTUREXML = Uri.UnescapeDataString(model.STRUCTUREXML);
            if (String.IsNullOrEmpty(model.IDENTIFICATION))
            {
                model.IDENTIFICATION = Guid.NewGuid().ToString();
                designService.Persistent(model);
            }
            else
            {
                designService.Update(model);
            }
            return Json(true, JsonRequestBehavior.AllowGet);
        }

        public ActionResult WorkflowImage(string instanceID)
        {
            ViewBag.instanceID = instanceID;
            return View();
        }

        [HttpPost]
        public JsonResult GetProcess(string instanceID)
        {
            return Json(bridgeService.GetJumpProcess(instanceID));
        }

        public ActionResult WorkflowDesignSettings()
        {
            return View();
        }

        public JsonResult GetRole()
        {
            return Json(bridgeService.GetGroup());
        }

        public JsonResult GetActors(int pageIndex, int pageSize, string actorIDs, string searchKey)
        {
            int total;
            var result = bridgeService.GetActors(pageIndex, pageSize, out total, actorIDs, searchKey);
            return Json(new
            {
                code = 0,
                total = total,
                rows = result
            });
        }

        public JsonResult GetConfigs()
        {
            return Json(bridgeService.GetSettings());
        }

        public JsonResult QueryAction()
        {
            IList<dynamic> types = new List<dynamic>();
            foreach (IWorkflowAction action in WorkflowGlobalServiceProvider.QueryActions())
            {
                Type type = action.GetType();
                types.Add(new {
                    id= type.FullName,
                    name= type.Name
                });
            }
            return Json(types);
        }
    }
}
