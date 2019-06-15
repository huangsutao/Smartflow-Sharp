/*
 License: https://github.com/chengderen/Smartflow/blob/master/LICENSE 
 Home page: https://github.com/chengderen/Smartflow
*/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using Smartflow.Elements;
using Smartflow;

namespace Smartflow.BussinessService.WorkflowService
{
    public class BaseWorkflowEngine : WorkflowEngine
    {
        private readonly static BaseWorkflowEngine singleton = new BaseWorkflowEngine();

        protected BaseWorkflowEngine()
            : base()
        {
        }

        public static WorkflowEngine CreateWorkflowEngine()
        {
            return singleton;
        }
    }
}
