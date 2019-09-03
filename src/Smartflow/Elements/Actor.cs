/********************************************************************
 License: https://github.com/chengderen/Smartflow/blob/master/LICENSE 
 Home page: https://www.smartflow-sharp.com
 ********************************************************************
 */
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using Smartflow.Dapper;
using Smartflow;
using System.Xml.Serialization;
using System.Xml.Linq;

namespace Smartflow.Elements
{
    public class Actor : Element, IRelationship
    {
        public string RelationshipID
        {
            get;
            set;
        }

        internal override void Persistent()
        {
            string sql = "INSERT INTO T_ACTOR(NID,ID,RelationshipID,Name,InstanceID) VALUES(@NID,@ID,@RelationshipID,@Name,@InstanceID)";
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
