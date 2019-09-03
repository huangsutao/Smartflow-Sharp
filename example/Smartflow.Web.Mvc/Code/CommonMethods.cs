using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using Smartflow.BussinessService.Models;
using Smartflow.BussinessService.Services;
using Smartflow.BussinessService.WorkflowService;

namespace Smartflow.Web.Mvc.Code
{
    public class CommonMethods
    {
        public static bool CheckAuth(string nodeID, string instanceID, User userInfo)
        {
            return (new PendingService().Query(pending => pending.ACTORID == userInfo.IDENTIFICATION.ToString()
                && pending.NODEID == nodeID
                && pending.INSTANCEID == instanceID).FirstOrDefault() != null);
        }
    }
}