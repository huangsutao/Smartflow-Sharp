/********************************************************************
 License: https://github.com/chengderen/Smartflow/blob/master/LICENSE 
 Home page: https://www.smartflow-sharp.com
 ********************************************************************
 */
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml;
using System.Xml.Serialization;
using Smartflow.Elements;

namespace Smartflow.Elements
{
    public class Workflow
    {
        public Workflow()
        {
            this.Decisions = new List<Decision>();
            this.Nodes = new List<Node>();
        }

        /// <summary>
        /// 开始节点
        /// </summary>
        public Start Start
        {
            get;
            set;
        }

        /// <summary>
        /// 结束节点
        /// </summary>
        public End End
        {
            get;
            set;
        }

        /// <summary>
        /// 决策节点
        /// </summary>
        public List<Decision> Decisions
        {
            get;
            set;
        }

        /// <summary>
        /// 流程节点
        /// </summary>
        public List<Node> Nodes
        {
            get;
            set;
        }

        public IList<Element> GetElements()
        {
            List<Element> elements = new List<Element>();
            elements.Add(this.Start);
            elements.AddRange(this.Nodes);
            elements.AddRange(this.Decisions);
            elements.Add(this.End);
            return elements;
        }
    }
}
