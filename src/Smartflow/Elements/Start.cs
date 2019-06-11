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
    [XmlInclude(typeof(List<Transition>))]
    public class Start : Node
    {
        [XmlIgnore]
        public override string Name
        {
            get { return "开始"; }
        }

        public override WorkflowNodeCategory NodeType
        {
            get
            {
                return WorkflowNodeCategory.Start;
            }
        }
    }
}
