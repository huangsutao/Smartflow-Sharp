using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;

namespace Smartflow
{
    internal class WorkflowPluginFactory
    {
        public  static IList<Type> Plugins
            = new List<Type>();

        static WorkflowPluginFactory()
        {
            Assembly assembly = System.Reflection.Assembly.GetExecutingAssembly();
            IList<Type> types = assembly.GetExportedTypes().ToList<Type>();
            foreach (Type type in types)
            {
                if (typeof(IPlugin).IsAssignableFrom(type))
                {
                    Plugins.Add(type);
                }
            }
        }
    }
}
