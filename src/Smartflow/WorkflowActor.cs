using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Smartflow
{
    public class WorkflowActor
    {
        public string ID
        {
            get;
            set;
        }

        public string Name
        {
            get;
            set;
        }

        /// <summary>
        /// 邮件地址
        /// </summary>
        public string MailAddress
        {
            get;
            set;
        }

        public dynamic Data
        {
            get;
            set;
        }
    }
}
