﻿/********************************************************************
 License: https://github.com/chengderen/Smartflow/blob/master/LICENSE 
 Home page: https://www.smartflow-sharp.com
 ********************************************************************
 */
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using Smartflow.Dapper;

namespace Smartflow.BussinessService.WorkflowService
{
    public class WorkflowDesignService 
    {
        protected IDbConnection Connection
        {
            get { return DBUtils.CreateConnection(); }
        }

        public void Persistent(WorkflowStructure workflowStructure)
        {
            string sql = " INSERT INTO T_STRUCTURE(IDENTIFICATION,APPELLATION,STRUCTUREXML) VALUES(@IDENTIFICATION,@APPELLATION,@STRUCTUREXML) ";
            Connection.Execute(sql, workflowStructure);
        }

        public void Update(WorkflowStructure workflowStructure)
        {
            string sql = " UPDATE T_STRUCTURE SET APPELLATION=@APPELLATION,STRUCTUREXML=@STRUCTUREXML WHERE IDENTIFICATION=@IDENTIFICATION ";
            Connection.Execute(sql, workflowStructure);
        }

        public void Delete(string IDENTIFICATION)
        {
            string sql = " DELETE FROM T_STRUCTURE WHERE IDENTIFICATION=@IDENTIFICATION ";
            Connection.Execute(sql, new { IDENTIFICATION = IDENTIFICATION });
        }

        public List<WorkflowStructure> GetWorkflowStructureList()
        {
            string sql = " SELECT * FROM T_STRUCTURE ";
            return Connection.Query<WorkflowStructure>(sql).ToList();
        }

        public WorkflowStructure GetWorkflowStructure(string identification)
        {
            string sql = " SELECT * FROM T_STRUCTURE WHERE IDENTIFICATION=@IDENTIFICATION ";
            return Connection.Query<WorkflowStructure>(sql, new { IDENTIFICATION = identification }).FirstOrDefault<WorkflowStructure>();
        }
    }
}
