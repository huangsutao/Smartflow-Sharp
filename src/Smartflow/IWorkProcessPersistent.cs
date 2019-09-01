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
    /// 提供过程服务接口
    /// </summary>
    public interface IWorkProcessPersistent
    {
        void Persistent(WorkflowProcess process);

        WorkflowProcess GetRecord(string instanceID, string destinationID);

        IList<WorkflowProcess> GetLatestRecords(string instanceID, string NID,int Increment);
    }
}
