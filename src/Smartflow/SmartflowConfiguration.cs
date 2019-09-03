﻿/********************************************************************
 License: https://github.com/chengderen/Smartflow/blob/master/LICENSE 
 Home page: https://www.smartflow-sharp.com
 ********************************************************************
 */
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;

namespace Smartflow
{
    /// <summary>
    /// 定义工作流数据库配置节点
    /// </summary>
    public class SmartflowConfiguration : ConfigurationSection
    {
        /// <summary>
        /// 工作流数据库连接字符串
        /// </summary>
        [ConfigurationProperty("connectionString",IsRequired = true)]
        public string ConnectionString
        {
            get { return this["connectionString"].ToString(); }
        }

        /// <summary>
        /// 数据访问提供者
        /// </summary>
        [ConfigurationProperty("providerName",
            IsRequired = true,
            DefaultValue = "System.Data.SqlClient")]
        public string ProviderName
        {
            get { return this["providerName"].ToString(); }
        }
    }
}
