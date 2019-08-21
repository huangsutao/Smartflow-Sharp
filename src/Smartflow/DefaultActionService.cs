using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Smartflow
{
    public class DefaultActionService : IResolve
    {
        protected IList<IWorkflowAction> Actions
        {
            get { return WorkflowActionFactory.Actions; }
        }

        public IWorkflowAction Scan(string name)
        {
            return WorkflowActionFactory
                      .Actions
                      .FirstOrDefault(entry => entry.GetType().FullName == name);
        }
    }
}
