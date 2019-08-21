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
        private static IList<IWorkflowAction> _partCollection = new List<IWorkflowAction>();

        static WorkflowGlobalServiceProvider()
        {
            _globalCollection.Add(new WorkflowService());
            _globalCollection.Add(new MailService());
            _globalCollection.Add(new DefaultActionService());
        }

        public static void RegisterGlobalService(object registerObject)
        {
            _globalCollection.Add(registerObject);
        }

        public static void RegisterPartService(IWorkflowAction action)
        {
            _partCollection.Add(action);
        }

        public static T Resolve<T>()
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

        /// <summary>
        /// 获取自定义的动作
        /// </summary>
        /// <returns></returns>
        public static IList<IWorkflowAction> QueryActions()
        {
            return WorkflowGlobalServiceProvider._partCollection;
        }
    }
}
