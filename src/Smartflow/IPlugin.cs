using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Smartflow
{
    public interface IPlugin
    {
        /// <summary>
        /// 执行跳转前的操作
        /// </summary>
        void ActionExecute(WorkflowContext context);


        /// <summary>
        /// 执行跳转后的操作
        /// </summary>
        void ActionExecuted(ExecutingContext executingContext);
    }
}
