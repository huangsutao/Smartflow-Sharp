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
        private static Dictionary<string, Type> innerTypeMapper = new Dictionary<string, Type>();

        static ElementContainer()
        {
            innerTypeMapper.Add("start", typeof(Start));
            innerTypeMapper.Add("end", typeof(End));
            innerTypeMapper.Add("node", typeof(Node));
            innerTypeMapper.Add("decision", typeof(Decision));
            innerTypeMapper.Add("group", typeof(Group));
            innerTypeMapper.Add("command", typeof(Command));
            innerTypeMapper.Add("transition", typeof(Transition));
            innerTypeMapper.Add("actor", typeof(Actor));
        }

        public static Element Resolve(string name)
        {
            Type innerType = innerTypeMapper[name];

            return (Utils.CreateInstance(innerType) 
                as Element);
        }

        public static bool Contains(string name)
        {
            return innerTypeMapper.ContainsKey(name);
        }
    }
}
