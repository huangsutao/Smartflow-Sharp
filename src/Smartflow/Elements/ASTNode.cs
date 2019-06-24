/********************************************************************
 License: https://github.com/chengderen/Smartflow/blob/master/LICENSE 
 Home page: https://www.smartflow-sharp.com
 ********************************************************************
 */
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml.Serialization;
using System.Data;

using Smartflow.Dapper;
using Smartflow;
using System.Xml.Linq;
using Smartflow.Internals;

namespace Smartflow.Elements
{
    public abstract class ASTNode : Element
    {
        protected List<Transition> transitions = new List<Transition>();
        protected WorkflowNodeCategory category = WorkflowNodeCategory.Node;

        public List<Transition> Transitions
        {
            get { return transitions; }
            set { transitions = value; }
        }

        public WorkflowNodeCategory NodeType
        {
            get { return category; }
            set { category = value; }
        }

        internal override void Persistent()
        {
            NID = Guid.NewGuid().ToString();
            string sql = "INSERT INTO T_NODE(NID,ID,Name,NodeType,InstanceID) VALUES(@NID,@ID,@Name,@NodeType,@InstanceID)";
            Connection.ExecuteScalar<long>(sql, new
            {
                NID = NID,
                ID = ID,
                Name = Name,
                NodeType = NodeType.ToString(),
                InstanceID = InstanceID
            });

            if (Transitions != null)
            {
                foreach (Transition transition in Transitions)
                {
                    transition.RelationshipID = this.NID;
                    transition.Origin = this.ID;
                    transition.InstanceID = InstanceID;
                    transition.Persistent();
                }
            }
        }

        internal virtual List<Transition> QueryWorkflowNode(string relationshipID)
        {
            string query = "SELECT * FROM T_TRANSITION WHERE RelationshipID=@RelationshipID";
            return Connection.Query<Transition>(query, new { RelationshipID = relationshipID }).ToList();
        }


        public ASTNode GetNode(string ID)
        {
            string query = "SELECT * FROM T_NODE WHERE ID=@ID AND InstanceID=@InstanceID";
            return Connection.Query<Node>(query, new
            {
                ID = ID,
                InstanceID = InstanceID
            }).FirstOrDefault();
        }

        protected void ParseXml(XElement element)
        {
            this.name = element.Attribute("name").Value;
            this.id = element.Attribute("id").Value;
            string category = element.Attribute("category").Value;
            this.category = Utils.Convert(category);
        }
    }
}