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
    public class End : Node
    {
        [XmlIgnore]
        public override string Name
        {
            get { return "结束"; }
        }

        [XmlIgnore]
        public override List<Transition> Transitions
        {
            get;
            set;
        }

      
        public override WorkflowNodeCategory NodeType
        {
            get { return WorkflowNodeCategory.End; }
        }
    }
}
