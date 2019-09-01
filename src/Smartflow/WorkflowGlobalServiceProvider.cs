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
            _globalCollection.Add(new WorkflowProcessService());
            _globalCollection.Add(new DefaultWorkflowCooperationService());
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
        /// 移除全局服务
        /// </summary>
        /// <typeparam name="T"></typeparam>
        public static void Remove<T>() where T : class
        {
             _globalCollection.Where(o => (o is T))
                .Cast<T>()
                .ToList()
                .ForEach((entry)=> _globalCollection.Remove(entry));
        }


        /// <summary>
        /// 查询注册到全局里面的
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <returns></returns>
        public static List<T> Query<T>() where T : class
        {
            return _globalCollection.Where(o => (o is T)).Cast<T>().ToList();
        }

        public static IList<IWorkflowAction> QueryActions()
        {
            return WorkflowGlobalServiceProvider._partCollection;
        }
    }
}
