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

using Smartflow.Dapper;
using Smartflow.Enums;


namespace Smartflow.Elements
{
    [XmlInclude(typeof(Node))]
    public class Transition : Element, IRelationship
    {
     
        [XmlAttribute("name")]
        public virtual string Name
        {
            get;
            set;
        }

     
        [XmlAttribute("layout")]
        public virtual string Layout
        {
            get;
            set;
        }

      
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

       
        [XmlAttribute("destination")]
        public string Destination
        {
            get;
            set;
        }

       
        [XmlText(typeof(string))]
        public string Expression
        {
            get;
            set;
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
    }
}
