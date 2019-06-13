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
using Smartflow.Enums;


namespace Smartflow.Elements
{
    public class ASTNode : Element
    {
        [XmlAttribute("name")]
        public virtual string Name
        {
            get;
            set;
        }

        /// <summary>
        /// 节点标识ID
        /// </summary>
        [XmlAttribute("id")]
        public  string ID
        {
            get;
            set;
        }

        [XmlElement(ElementName = "transition")]
        public virtual List<Transition> Transitions
        {
            get;
            set;
        }

        [XmlIgnore]
        public virtual WorkflowNodeCategory NodeType
        {
            get;
            set;
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
        }

        internal virtual List<Transition> QueryWorkflowNode(string relationshipID)
        {
            string query = "SELECT * FROM T_TRANSITION WHERE RelationshipID=@RelationshipID";
            return Connection.Query<Transition>(query, new { RelationshipID = relationshipID }).ToList();
        }
    }
}
