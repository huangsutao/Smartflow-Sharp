using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Smartflow
{
    public class FirstStrategy : IWorkflowCooperationStrategy
    {
        public string Decide(IList<WorkflowProcess> records, string destination, Action<WorkflowProcess> action, Func<string, string> callback)
        {
            var record = records.OrderBy(e => e.CreateDateTime).FirstOrDefault();

            if (record != null)
            {
                foreach (WorkflowProcess workflowProcess in records)
                {
                    workflowProcess.Destination = record.Destination;
                    action(workflowProcess);
                }
            }

            return callback(record==null? destination : record.Destination);
        }
    }
}
