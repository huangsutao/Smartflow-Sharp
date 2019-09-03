﻿/********************************************************************
 License: https://github.com/chengderen/Smartflow/blob/master/LICENSE 
 Home page: https://www.smartflow-sharp.com
 ********************************************************************
 */
using System;


namespace Smartflow
{
    public class WorkflowContext
    {
        public WorkflowInstance Instance
        {
            get;
            set;
        }

        public string ActorID
        {
            get;
            set;
        }

        public string ActorName
        {
            get;
            set;
        }

        public dynamic Data
        {
            get;
            set;
        }

        public string TransitionID
        {
            get;
            set;
        }
    }
}
