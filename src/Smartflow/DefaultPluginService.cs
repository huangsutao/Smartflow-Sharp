using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Smartflow
{
    public class DefaultPluginService: IResolve
    {
        protected IList<Type> PluginTypes
        {
            get { return WorkflowPluginFactory.Plugins; }
        }

        public IPlugin Scan(string name)
        {
            var type = WorkflowPluginFactory
                      .Plugins
                      .FirstOrDefault(entry =>entry.FullName == name);

            return (System.Activator.CreateInstance(type) as IPlugin);
        }
    }
}
