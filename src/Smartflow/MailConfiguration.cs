/********************************************************************
 License: https://github.com/chengderen/Smartflow/blob/master/LICENSE 
 Home page: https://www.smartflow-sharp.com
 ********************************************************************
 */
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using Smartflow.Dapper;

namespace Smartflow
{
    public sealed class MailConfiguration
    {
        /// <summary>
        /// 账户名
        /// </summary>
        public string Account
        {
            get;
            set;
        }

        /// <summary>
        /// 密码（授权码）
        /// </summary>
        public string Password
        {
            get;
            set;
        }

        /// <summary>
        /// 发送邮件显示的名称
        /// </summary>
        public string Name
        {
            get;
            set;
        }

        /// <summary>
        /// 服务器smtp.163.com
        /// </summary>
        public string Host
        {
            get;
            set;
        }

        /// <summary>
        /// 端口(25)
        /// </summary>
        public int Port
        {
            get;
            set;
        }

        /// <summary>
        /// 启用HTTPS
        /// </summary>
        public int EnableSsl
        {
            get;
            set;
        }

        public static MailConfiguration Configure()
        {
            string sql = "SELECT * FROM T_MAIL";
            return DapperFactory.CreateWorkflowConnection()
                .Query<MailConfiguration>(sql).FirstOrDefault();
        }
    }
}
