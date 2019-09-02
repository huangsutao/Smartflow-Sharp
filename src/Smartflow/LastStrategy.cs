using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Smartflow
{
    public class LastStrategy : IWorkflowCooperationStrategy
    {
        public string Decide(IList<WorkflowProcess> records, string destination, Action<WorkflowProcess> action)
        {
            foreach (WorkflowProcess workflowProcess in records)
            {
                workflowProcess.Destination = destination;
                action(workflowProcess);
            }

            return destination;
        }
    }
}
