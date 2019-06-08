/********************************************************************
 License: https://github.com/chengderen/Smartflow/blob/master/LICENSE 
 Home page: https://www.smartflow-sharp.com
 ********************************************************************
 */
using System;
using System.Collections.Generic;

namespace Smartflow
{
    /// <summary>
    /// 订阅审批过程事件
    /// </summary>
    /// <param name="executeContext"></param>
    public delegate void DelegatingProcessHandle(ExecutingContext executeContext);
}
