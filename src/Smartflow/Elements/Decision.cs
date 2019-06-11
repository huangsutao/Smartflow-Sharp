/********************************************************************
 License: https://github.com/chengderen/Smartflow/blob/master/LICENSE 
 Home page: https://www.smartflow-sharp.com
 ********************************************************************
 */
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using Smartflow.Enums;
using System.Xml.Serialization;
using System.Data;
using Smartflow.Dapper;
namespace Smartflow.Elements
{
    [XmlInclude(typeof(Command))]
    [XmlInclude(typeof(List<Transition>))]
    public class Decision : Node
    {
   
        public override WorkflowNodeCategory NodeType
        {
            get { return WorkflowNodeCategory.Decision; }
        }

   
        [XmlElement("command")]
        public Command Command
        {
            get;
            set;
        }
  

        internal override void Persistent()
        {
            base.Persistent();

            if (Command != null)
            {
                Command.InstanceID = InstanceID;
                Command.RelationshipID = NID;
                Command.Persistent();
            }
        }
    }
}
