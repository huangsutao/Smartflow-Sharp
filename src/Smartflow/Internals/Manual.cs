﻿/********************************************************************
 License: https://github.com/chengderen/Smartflow/blob/master/LICENSE 
 Home page: https://www.smartflow-sharp.com
 Github : https://github.com/chengderen/Smartflow-Sharp
 ********************************************************************
 */
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml.Linq;

using Smartflow;
using Smartflow.Elements;

namespace Smartflow.Internals
{
    internal class Manual : IResolution
    {
        private static readonly String WORKFLOW_XML_ROOT_NODE= "workflow";

        /// <summary>
        /// 解析xml
        /// </summary>
        /// <param name="resourceXml"></param>
        /// <returns></returns>
        public Workflow Parse(string resourceXml)
        {
            String root = Manual.WORKFLOW_XML_ROOT_NODE;
            XDocument doc = XDocument.Parse(resourceXml);
            List<ASTNode> nodes = new List<ASTNode>();

            doc.Element(root)
                .Elements()
                .ToList()
                .ForEach(element => {
                    string nodeName = element.Name.LocalName;
                    if (ElementContainer.Contains(nodeName)){
                        Element typeMapper = ElementContainer.Resolve(nodeName);
                        nodes.Add(typeMapper.Parse(element) as ASTNode);
                    }
                });


            Workflow instance = new Workflow();
            instance.Start = nodes
                .Where(e =>e.NodeType == WorkflowNodeCategory.Start)
                .Cast<Start>()
                .FirstOrDefault();

            instance.End= nodes
                .Where(e => e.NodeType == WorkflowNodeCategory.End)
                .Cast<End>()
                .FirstOrDefault();

            nodes.Where(e => e.NodeType == WorkflowNodeCategory.Decision)
                .ToList()
                .ForEach(n => instance.Decisions.Add(n as Decision));

            nodes.Where(e => e.NodeType == WorkflowNodeCategory.Node)
                 .ToList()
                 .ForEach(n => instance.Nodes.Add(n as Node));

            return instance;
        }
    }
}
