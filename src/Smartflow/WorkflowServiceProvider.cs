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
    public static class WorkflowServiceProvider
    {
        private static IList<object> _collection = new List<object>();

        static WorkflowServiceProvider()
        {
            _collection.Add(new WorkflowService());
            _collection.Add(new MailService());
        }

        public static void Add(object registerObject)
        {
            _collection.Add(registerObject);
        }

        public static T OfType<T>()
        {
            return (T)_collection.Where(o => (o is T)).FirstOrDefault();
        }
    }
}
