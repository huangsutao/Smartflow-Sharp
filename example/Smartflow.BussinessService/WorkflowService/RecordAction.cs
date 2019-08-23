using Smartflow.BussinessService.Models;
using Smartflow.BussinessService.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Smartflow.BussinessService.WorkflowService
{
    public class RecordAction : IWorkflowAction
    {
        private RecordService recordService = new RecordService();

        public void ActionExecute(WorkflowContext context)
        {

        }

        public void ActionExecuted(ExecutingContext executeContext)
        {
            if (executeContext.Instance.Current.NodeType != WorkflowNodeCategory.Decision)
            {
                //写入审批记录
                WriteRecord(executeContext);
            }
        }

        /// <summary>
        /// 写入审批记录
        /// </summary>
        /// <param name="executeContext"></param>
        public void WriteRecord(ExecutingContext executeContext)
        {
            //写入审批记录
            recordService.Insert(new Record()
            {
                INSTANCEID = executeContext.Instance.InstanceID,
                NODENAME = executeContext.From.Name,
                MESSAGE = executeContext.Data.Message
            });
        }
    }
}