/********************************************************************
 License: https://github.com/chengderen/Smartflow/blob/master/LICENSE 
 Home page: https://www.smartflow-sharp.com
 Github : https://github.com/chengderen/Smartflow-Sharp
 ********************************************************************
 */
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Smartflow
{
    public static class WorkflowGlobalServiceProvider
    {
        private static IList<object> _globalCollection = new List<object>();

        static WorkflowGlobalServiceProvider()
        {
            _globalCollection.Add(new WorkflowService());
            _globalCollection.Add(new MailService());
            _globalCollection.Add(new DefaultPluginService());
        }

        public static void Add(object registerObject)
        {
            _globalCollection.Add(registerObject);
        }

        public static T OfType<T>()
        {
            return (T)_globalCollection.Where(o => (o is T)).FirstOrDefault();
        }

       /// <summary>
       /// 查询注册到全局里面的
       /// </summary>
       /// <typeparam name="T"></typeparam>
       /// <returns></returns>
        public static List<T> Query<T>() where T : class
        {
            List<T> types = new List<T>();
            _globalCollection.Where(o => (o is T)).ToList().ForEach(t => types.Add((t as T)));
            return types;
        }

        public static IList<Type> QueryPluginType()
        {
            List<IPlugin> plugins = WorkflowGlobalServiceProvider.Query<IPlugin>();
            List<String> assemblyNames = new List<string>();
            plugins.ForEach(plugin => assemblyNames.Add(plugin.GetType().FullName));
            return WorkflowPluginFactory
                        .Plugins
                        .Where(e => !assemblyNames.Contains(e.FullName))
                        .ToList();
        }
    }
}
