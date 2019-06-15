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
using Smartflow.Internals;

namespace Smartflow
{
    public  class WorkflowService :WorkflowInfrastructure, IWorkflow
    {
        public string Start(string resourceXml)
        {
            Workflow workflow = XMLServiceFactory.Create(resourceXml);
            IList<Element> elements = workflow.GetElements();
            string instaceID = CreateWorkflowInstance(workflow.Start.ID,resourceXml);
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

        public void Processing(IPersistent persistent)
        {
            persistent.Persistent();
        }
    }
}
