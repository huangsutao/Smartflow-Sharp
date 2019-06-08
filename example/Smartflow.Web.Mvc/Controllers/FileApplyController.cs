using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

using Smartflow.BussinessService.Models;
using Smartflow.BussinessService.WorkflowService;
using Smartflow.BussinessService.Services;
using Smartflow.Web.Mvc.Code;
using Smartflow.Web.Mvc.Controllers;

namespace Smartflow.Web.Controllers
{
    public class FileApplyController : BaseController
    {
        private BaseWorkflowService bwfs = BaseWorkflowService.Instance;
        private FileApplyService fileApplyService = new FileApplyService();
        private WorkflowDesignService designService = new WorkflowDesignService();


        [HttpPost]
        public JsonResult Save(FileApply model)
        {
            fileApplyService.Persistent(model);
            return Json(true);
        }

        public ActionResult FileApplyList()
        {
            return View(fileApplyService.Query());
        }

        public JsonResult Delete(long id)
        {
            fileApplyService.Delete(id);
            return Json(true);
        }

        public ActionResult FileApply(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                GenerateWFViewData(string.Empty);
                GenerateSecretViewData(string.Empty);
                return View();
            }
            else
            {
                FileApply mdl = fileApplyService.GetByInstanceID(id);
                GenerateSecretViewData(mdl.SECRETGRADE);
                GenerateWFViewData(mdl.STRUCTUREID);
                return View(mdl);
            }
        }

        public void GenerateSecretViewData(string secretGrade)
        {
            List<string> secrets = new List<string>() {
              "非密",
              "秘密",
              "机密"
            };

            List<SelectListItem> list = new List<SelectListItem>();
            foreach (string secret in secrets)
            {
                list.Add(new SelectListItem
                {
                    Text = secret,
                    Value = secret,
                    Selected = (secret == secretGrade)
                });
            }
            ViewData["SECRET"] = list;
        }

        public void GenerateWFViewData(string WFID)
        {
            List<WorkflowStructure> workflowXmlList = designService.GetWorkflowStructureList();

            List<SelectListItem> fileList = new List<SelectListItem>();
            foreach (WorkflowStructure item in workflowXmlList)
            {
                fileList.Add(new SelectListItem { Text = item.APPELLATION, Value = item.IDENTIFICATION, Selected = (item.IDENTIFICATION == WFID) });
            }
            ViewData["WFiles"] = fileList;
        }
    }
}
