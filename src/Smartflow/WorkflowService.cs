/********************************************************************
 License: https://github.com/chengderen/Smartflow/blob/master/LICENSE 
 Home page: https://www.smartflow-sharp.com
 ********************************************************************
 */
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;

using Smartflow.Dapper;
using Smartflow.Elements;
using Smartflow.Enums;
using Smartflow.Internals;

namespace Smartflow
{
    public partial class WorkflowService :WorkflowInfrastructure, IWorkflow
    {
        public string Start(string resourceXml)
        {
            ResolutionContext context = new ResolutionContext(new Automatic());
            Workflow workflow = context.Parse(resourceXml);
            List<Element> elements = new List<Element>();
            elements.Add(workflow.StartNode);
            elements.AddRange(workflow.ChildNode);
            elements.AddRange(workflow.ChildDecisionNode);
            elements.Add(workflow.EndNode);

            string instaceID = CreateWorkflowInstance(workflow.StartNode.ID,resourceXml);
            foreach (Element element in elements)
            {
                element.InstanceID = instaceID;
                element.Persistent();
            }
            return instaceID;
        }

        protected string CreateWorkflowInstance(string NID, string resource)
        {
            return WorkflowInstance.CreateWorkflowInstance(NID, resource);
        }
    }
}
