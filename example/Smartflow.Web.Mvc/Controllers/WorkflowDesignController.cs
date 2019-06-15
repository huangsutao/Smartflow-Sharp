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
using Newtonsoft.Json;
using Smartflow.BussinessService.WorkflowService;

namespace Smartflow.Web.Mvc.Controllers
{
    public class WorkflowDesignController : BaseController
    {
        private WorkflowDesignService designService = new WorkflowDesignService();
        private ActorService roleService = new ActorService();

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
            WorkflowInstance instance = WorkflowInstance.GetInstance(instanceID);
            return Json(new
            {
                structure = instance.Resource,
                id = instance.Current.ID
            });
        }


        public ActionResult WorkflowDesignSettings()
        {
            return View();
        }

        public JsonResult GetRole(string roleIds, string searchKey)
        {
            return JsonWrapper(roleService.GetRole(roleIds, searchKey));
        }

        public JsonResult GetConfigs()
        {
            return JsonWrapper(WorkflowConfig.GetSettings());
        }
    }
}
