using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Smartflow
{
    public class DemocraticStrategy : IWorkflowCooperationStrategy
    {
        protected string GetDestination(IList<WorkflowProcess> records, string selectDestination)
        {
            IList<string> destination = new List<string>();
            foreach (WorkflowProcess workflowProcess in records)
            {
                destination.Add(workflowProcess.Destination);
            }

            destination.Add(selectDestination);

            var data = from d in destination
                       group d by d into g
                       orderby g.Count() descending
                       select g.Key;

            return data.FirstOrDefault();

        }

        public string Decide(IList<WorkflowProcess> records, string destination,Action<WorkflowProcess> action, Func<string, string> callback)
        {
            string groupKey = GetDestination(records, destination);
            if (!String.IsNullOrEmpty(groupKey))
            {
                foreach (WorkflowProcess record in records)
                {
                    record.Destination = groupKey;
                    action(record);
                }
            }
            return callback(groupKey ?? destination);
        }
    }
}
