/********************************************************************
 License: https://github.com/chengderen/Smartflow/blob/master/LICENSE 
 Home page: https://www.smartflow-sharp.com
 ********************************************************************
 */
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Smartflow
{
    /// <summary>
    /// 定义工作流服务接口
    /// </summary>
    public interface IWorkflow
    {

        /// <summary>
        /// 启动工作流
        /// </summary>
        /// <param name="resourceXml">流程结构</param>
        /// <returns></returns>
        string Start(string resourceXml);
    }
}
