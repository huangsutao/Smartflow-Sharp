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
        private static Dictionary<string, Type> innerHandleMapper = new Dictionary<string, Type>();

        static ElementContainer()
        {
            innerHandleMapper.Add("start", typeof(Start));
            innerHandleMapper.Add("end", typeof(End));
            innerHandleMapper.Add("node", typeof(Node));
            innerHandleMapper.Add("decision", typeof(Decision));
            innerHandleMapper.Add("group", typeof(Group));
            innerHandleMapper.Add("command", typeof(Command));
            innerHandleMapper.Add("transition", typeof(Transition));
            innerHandleMapper.Add("actor", typeof(Actor));
        }

        public static Element Resolve(string name)
        {
            Type innerType = innerHandleMapper[name];

            return (Utils.CreateInstance(innerType) 
                as Element);
        }

        public static bool Contains(string name)
        {
            return innerHandleMapper.ContainsKey(name);
        }
    }
}
