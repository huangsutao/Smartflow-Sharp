using Smartflow.Elements;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Smartflow
{
    public interface IWorkflowCooperation
    {
        Boolean Check(ASTNode node, IList<WorkflowProcess> records);
    }
}
