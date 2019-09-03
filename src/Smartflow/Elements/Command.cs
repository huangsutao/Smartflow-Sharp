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
using System.Xml.Linq;
using System.Xml.Serialization;

using Smartflow.Dapper;
using Smartflow;

namespace Smartflow.Elements
{
    public class Command : Element, IRelationship
    {
        private string text = string.Empty;

        public string Text
        {
            get { return text; }
            set { text = value; }
        }
    
        public string RelationshipID
        {
            get;
            set;
        }

        internal override void Persistent()
        {
            string sql = "INSERT INTO T_Command(NID,ID,RelationshipID,Text,InstanceID) VALUES(@NID,@ID,@RelationshipID,@Text,@InstanceID)";
            Connection.Execute(sql, new
            {
                NID = Guid.NewGuid().ToString(),
                ID=ID,
                RelationshipID = RelationshipID,
                Text = Text,
                InstanceID = InstanceID
            });
        }

        internal override Element Parse(XElement element)
        {
            if (element.HasElements)
            {
                this.id = element
                    .Elements("id")
                    .FirstOrDefault().Value;

                this.text = element
                   .Elements("text")
                   .FirstOrDefault().Value;
            }

            return this;
        }
    }
}
