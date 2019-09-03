/********************************************************************
 License: https://github.com/chengderen/Smartflow/blob/master/LICENSE 
 Home page: https://www.smartflow-sharp.com
 ********************************************************************
 */
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml.Linq;
using System.Xml.Serialization;

using Smartflow.Dapper;
using Smartflow;


namespace Smartflow.Elements
{
    public class Transition : Element, IRelationship
    {
        private string destination = string.Empty;
        private string expression = string.Empty;
       
        public string RelationshipID
        {
            get;
            set;
        }

        public string Origin
        {
            get;
            set;
        }
     
     
        public string Destination
        {
            get { return destination; }
            set { destination = value; }
        }

     
        public string Expression
        {
            get { return expression; }
            set { expression = value; }
        }

        internal override void Persistent()
        {
            string sql = "INSERT INTO T_TRANSITION(NID,RelationshipID,Name,Destination,Origin,InstanceID,Expression) VALUES(@NID,@RelationshipID,@Name,@Destination,@Origin,@InstanceID,@Expression)";
            Connection.Execute(sql, new
            {
                NID = Guid.NewGuid().ToString(),
                RelationshipID = RelationshipID,
                Name = Name,
                Destination = Destination,
                Origin = Origin,
                InstanceID = InstanceID,
                Expression = Expression
            });
        }

        internal override Element Parse(XElement element)
        {
            this.name = element.Attribute("name").Value;
            this.destination = element.Attribute("destination").Value;
            if (element.HasElements)
            {
                XElement expression = element.Elements("expression").FirstOrDefault();
                if (expression != null)
                {
                    this.expression =expression.Value;
                }
            }
            return this;
        }
    }
}
