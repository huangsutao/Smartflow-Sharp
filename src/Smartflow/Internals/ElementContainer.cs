/********************************************************************
 License: https://github.com/chengderen/Smartflow/blob/master/LICENSE 
 Home page: https://www.smartflow-sharp.com
 Github : https://github.com/chengderen/Smartflow-Sharp
 ********************************************************************
 */
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using Smartflow.Elements;
namespace Smartflow.Internals
{
    internal class ElementContainer
    {
        private static Dictionary<string, Type> innerHandleMap = new Dictionary<string, Type>();

        static ElementContainer()
        {
            innerHandleMap.Add("start", typeof(Start));
            innerHandleMap.Add("end", typeof(End));
            innerHandleMap.Add("node", typeof(Node));
            innerHandleMap.Add("decision", typeof(Decision));
            innerHandleMap.Add("group", typeof(Group));
            innerHandleMap.Add("command", typeof(Command));
            innerHandleMap.Add("transition", typeof(Transition));
            innerHandleMap.Add("actor", typeof(Actor));
            innerHandleMap.Add("action", typeof(Elements.Action)); 
        }

        public static Element Resolve(string name)
        {
            Type innerType = innerHandleMap[name];

            return (Utils.CreateInstance(innerType) 
                as Element);
        }

        public static bool Contains(string name)
        {
            return innerHandleMap.ContainsKey(name);
        }
    }
}
