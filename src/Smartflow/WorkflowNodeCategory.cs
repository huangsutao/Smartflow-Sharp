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

namespace Smartflow
{
    /// <summary>
    /// 工作流节点类型
    /// </summary>
    public enum WorkflowNodeCategory
    {
        /// <summary>
        /// 开始节点
        /// </summary>
        Start,

        /// <summary>
        /// 普通节点
        /// </summary>
        Node,

        /// <summary>
        /// 决策节点
        /// </summary>
        Decision,

        /// <summary>
        /// 结束节点
        /// </summary>
        End,

        /// <summary>
        /// 跳转节点
        /// </summary>
        Transition
    }
}
