using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Smartflow.Elements;

namespace Smartflow
{
    public class DefaultWorkflowCooperationService : IWorkflowCooperation
    {
        public bool Check(ASTNode node, IList<WorkflowProcess> records)
        {
            return true;
        }
    }
}
