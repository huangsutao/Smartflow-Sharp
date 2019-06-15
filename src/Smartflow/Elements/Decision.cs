/********************************************************************
 License: https://github.com/chengderen/Smartflow/blob/master/LICENSE 
 Home page: https://www.smartflow-sharp.com
 ********************************************************************
 */
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using Smartflow;
using System.Xml.Serialization;
using System.Data;
using Smartflow.Dapper;
using System.Xml.Linq;
using Smartflow.Internals;

namespace Smartflow.Elements
{
    public class Decision : ASTNode
    {
        protected Command command;

        public Command Command
        {
            get { return command; }
            set { command = value; }
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

        internal override Element Parse(XElement element)
        {
            base.ParseXml(element);

            if (element.HasElements)
            {
                List<Element> nodes = new List<Element>();

                element.Elements().ToList().ForEach(entry =>
                {
                    string nodeName = entry.Name.LocalName;
                    if (ElementCollection.Contains(nodeName))
                    {
                        nodes.Add(ElementCollection
                            .Resolve(nodeName)
                            .Parse(entry));
                    }
                });

                Element cmd = nodes.Where(entry => (entry is Command)).FirstOrDefault();
                this.command = cmd == null ? null : (cmd as Command);

                nodes
                   .Where(transition => (transition is Transition))
                   .ToList()
                   .ForEach(g =>
                   {
                       this.Transitions.Add(g as Transition);
                   });
            }
            return this;
        }
    }
}
