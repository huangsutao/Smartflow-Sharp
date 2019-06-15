/********************************************************************
 License: https://github.com/chengderen/Smartflow/blob/master/LICENSE 
 Home page: https://www.smartflow-sharp.com
 ********************************************************************
 */
using System;
using System.Data;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml.Serialization;

using Smartflow.Dapper;
using Smartflow;
using System.Xml.Linq;
using Smartflow.Internals;

namespace Smartflow.Elements
{
    public class Node : ASTNode
    {
        protected List<Actor> actors = new List<Actor>();
        protected List<Group> groups = new List<Group>();

        public List<Group> Groups
        {
            get { return groups; }
            set { groups = value; }
        }

        public List<Actor> Actors
        {
            get { return actors; }
            set { actors = value; }
        }


        internal override void Persistent()
        {
            base.Persistent();

            if (Groups != null)
            {
                foreach (Group r in Groups)
                {
                    r.RelationshipID = this.NID;
                    r.InstanceID = InstanceID;
                    r.Persistent();
                }
            }

           
            if (Actors != null)
            {
                foreach (Actor a in Actors)
                {
                    a.RelationshipID = this.NID;
                    a.InstanceID = InstanceID;
                    a.Persistent();
                }
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

                nodes
                    .Where(group => (group is Group))
                    .ToList()
                    .ForEach(g =>
                    {
                        this.Groups.Add(g as Group);
                    });


                nodes
                   .Where(transition => (transition is Transition))
                   .ToList()
                   .ForEach(g =>
                   {
                       this.Transitions.Add(g as Transition);
                   });

                nodes
                 .Where(actor => (actor is Actor))
                 .ToList()
                 .ForEach(actor =>
                 {
                     this.actors.Add(actor as Actor);
                 });
            }
            return this;
        }
    }
}
