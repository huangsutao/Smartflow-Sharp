using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Smartflow
{
    public interface IWorkflowCooperationStrategy
    {
        string Decide(IList<WorkflowProcess> records, string destination, Action<WorkflowProcess> action);
    }
}
