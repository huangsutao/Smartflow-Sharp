using Smartflow.BussinessService.Models;
using Smartflow.BussinessService.Services;
using Smartflow.BussinessService.WorkflowService;
using Smartflow.Elements;
using Smartflow.Web.Mvc.Code;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Smartflow.Web.Mvc.Controllers
{
    public class AuditController : BaseController
    {
        private RecordService workflowRecordService = new RecordService();
        private BaseWorkflowService bwfs = BaseWorkflowService.Instance;
        private WorkflowDesignService designService = new WorkflowDesignService();

        /// <summary>
        /// 审核框架
        /// </summary>
        /// <param name="url">请求url</param>
        /// <param name="instanceID">实例</param>
        /// <returns></returns>
        public ActionResult AuditFrame(string url, string instanceID)
        {
            ViewBag.renderUrl = (!String.IsNullOrEmpty(instanceID))? string.Format("{0}/{1}", url,instanceID) :url;
            ViewBag.url = url;
            ViewBag.instanceID = instanceID;
            if (!String.IsNullOrEmpty(instanceID))
            {
                var executeNode = bwfs.GetCurrentPrevNode(instanceID);
                var current = bwfs.GetCurrent(instanceID);
                ViewBag.ButtonName = current.Name;
                ViewBag.JumpAuth = current.Name == "开始" ? true : CommonMethods.CheckAuth(current.NID, instanceID, UserInfo);
            }
            else
            {
                ViewBag.JumpAuth = true;
                ViewBag.ButtonName = "开始";
            }
            return View();
        }

        public JsonResult Start(string structureID)
        {
            return Json(bwfs.Start(structureID));
        }

        [HttpPost]
        public JsonResult GetTransitions(string instanceID)
        {
            WorkflowInstance instance = WorkflowInstance.GetInstance(instanceID);
            return Json(instance.Current.GetTransitions());
        }

        [HttpPost]
        public JsonResult GetCurrent(string instanceID)
        {
            var executeNode = bwfs.GetCurrentPrevNode(instanceID);
            var current = bwfs.GetCurrent(instanceID);
            return Json(new
            {
                NID=current.NID,
                Name = current.Name,
                Category=current.NodeType.ToString(),
                HasAuth = (current.Name == "开始" ? true :
                              CommonMethods.CheckAuth(current.NID, instanceID, UserInfo))
            });
        }

        [HttpPost]
        public JsonResult GetRecords(string instanceID)
        {
            return Json(workflowRecordService
                .Query(record => record.INSTANCEID == instanceID));
        }

        /// <summary>
        /// 流程跳转处理接口(请不要直接定义匿名类传递)
        /// </summary>
        /// <param name="instanceID">流程实例ID</param>
        /// <param name="transitionID">跳转路线ID</param>
        /// <param name="message">审批消息</param>
        /// <param name="action">审批动作（原路退回、跳转）</param>
        /// <returns>是否成功</returns>
        public JsonResult Jump(string instanceID, string transitionID, string url, string message)
        {
            dynamic data = new ExpandoObject();
            data.Message = message;
            data.Url = url;
            data.UserInfo = UserInfo;
            bwfs.Jump(instanceID, transitionID, UserInfo.IDENTIFICATION.ToString(), UserInfo.EMPLOYEENAME, data);
            return Json(true);
        }

        [HttpPost]
        public JsonResult GetAuditUser(string NID,string instanceID)
        {
           return Json(new UserService()
                          .GetPendingUserList(NID,instanceID));
        }
    }
}
