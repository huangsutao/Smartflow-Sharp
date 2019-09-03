﻿/********************************************************************
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
    /// 流程实例状态
    /// </summary>
    public enum WorkflowInstanceState
    {
        /// <summary>
        /// 运行中
        /// </summary>
        Running,

        /// <summary>
        /// 流程完结
        /// </summary>
        End,

        /// <summary>
        /// 流程终止
        /// </summary>
        Termination,

        /// <summary>
        /// 杀死流程
        /// </summary>
        Kill
    }
}
