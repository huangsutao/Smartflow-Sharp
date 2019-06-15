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
using Smartflow;

namespace Smartflow.Elements
{
    [Serializable]
    public abstract class Element : WorkflowInfrastructure
    {
        protected string name = string.Empty;
        protected string id = string.Empty;

        public string Name
        {
            get { return name; }
            set { name = value; }
        }

        /// <summary>
        /// 节点标识ID
        /// </summary>
        public string ID
        {
            get { return id; }
            set { id = value; }
        }

        /// <summary>
        /// 唯一标识
        /// </summary>
        public string NID
        {
            get;
            set;
        }

        public string InstanceID
        {
            get;
            set;
        }

        internal abstract void Persistent();

        internal abstract Element Parse(XElement element);
    }
}
