using Smartflow.Elements;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Smartflow
{
    public abstract class AbstractWorkflowCooperation
    {
        public abstract Boolean Check(ASTNode node, IList<WorkflowProcess> records);

        public virtual IWorkflowCooperationStrategy SelectStrategy()
        {
            return new DemocraticStrategy();
        }
    }
}
