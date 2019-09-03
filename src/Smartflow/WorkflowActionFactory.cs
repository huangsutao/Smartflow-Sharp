using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;

namespace Smartflow
{
    internal class WorkflowActionFactory
    {
        public static IList<IWorkflowAction> Actions
        {
            get { return WorkflowGlobalServiceProvider.QueryActions(); }
        }
    }
}
