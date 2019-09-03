using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml.Linq;

using Smartflow.Dapper;
using Smartflow;

namespace Smartflow.Elements
{
    public class Action : Element, IRelationship
    {
        public string RelationshipID
        {
            get;
            set;
        }

        internal override void Persistent()
        {
            string sql = "INSERT INTO T_ACTION(NID,ID,RelationshipID,Name,InstanceID) VALUES(@NID,@ID,@RelationshipID,@Name,@InstanceID)";
            DapperFactory.CreateWorkflowConnection().Execute(sql, new
            {
                NID = Guid.NewGuid().ToString(),
                ID = ID,
                RelationshipID = RelationshipID,
                Name = Name,
                InstanceID = InstanceID
            });
        }

        internal override Element Parse(XElement element)
        {
            this.name = element.Attribute("name").Value;
            this.id = element.Attribute("id").Value;
            return this;
        }
    }
}
