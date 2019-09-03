/********************************************************************
 License: https://github.com/chengderen/Smartflow/blob/master/LICENSE 
 Home page: https://www.smartflow-sharp.com
 ********************************************************************
 */
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

using Smartflow.Dapper;
using Smartflow;
using System.Configuration;

namespace Smartflow.BussinessService.WorkflowService
{
    public class BaseBridgeService : AbstractBridgeService
    {
        private IDbConnection Connection = DBUtils.CreateConnection();

        /// <summary>
        /// 处理依据roleID查询少引号的情况
        /// </summary>
        /// <param name="roleIds"></param>
        /// <returns></returns>
        public string BindQueryConditionQuot(string roleIds)
        {
            string[] RArry = roleIds.Split(',');
            string[] NRArray = new string[RArry.Length];
            for (int i = 0; i < RArry.Length; i++)
            {
                NRArray[i] = string.Format("'{0}'", RArry[i]);
            }
            return string.Join(",", NRArray);
        }

        public override List<WorkflowGroup> GetGroup()
        {
            string query = " SELECT * FROM T_ROLE WHERE 1=1 ";
            List<WorkflowGroup> groupList = new List<WorkflowGroup>();
            using (IDataReader dr = Connection.ExecuteReader(query))
            {
                while (dr.Read())
                {
                    groupList.Add(new WorkflowGroup()
                    {
                        ID = dr["IDENTIFICATION"].ToString(),
                        Name = dr["Appellation"].ToString()
                    });
                }
            }
            return groupList;
        }

        public override List<WorkflowActor> GetActors(int pageIndex, int pageSize, out int total, string actorIDs, string searchKey)
        {
            string conditionStr = string.Empty;
            if (!String.IsNullOrEmpty(actorIDs))
            {
                conditionStr = string.Format("{0} AND IDENTIFICATION NOT IN ({1})", conditionStr, BindQueryConditionQuot(actorIDs));
            }
            if (!String.IsNullOrEmpty(searchKey))
            {
                conditionStr = string.Format("{0} AND USERNAME LIKE '%{1}%'", conditionStr, searchKey);
            }

            string query = String.Format("SELECT TOP {0} * FROM T_USER WHERE IDENTIFICATION NOT IN (SELECT TOP {1} IDENTIFICATION  FROM T_USER WHERE 1=1 {2} ORDER BY IDENTIFICATION ASC) {2}  ORDER BY IDENTIFICATION ASC ", pageSize, pageSize * (pageIndex - 1), conditionStr);
            total = Connection.ExecuteScalar<int>(String.Format("SELECT COUNT(1) FROM T_USER WHERE 1=1 {0}", conditionStr));
            List<WorkflowActor> actors = new List<WorkflowActor>();
            using (var dr = Connection.ExecuteReader(query))
            {
                while (dr.Read())
                {
                    actors.Add(new WorkflowActor()
                    {
                        ID = dr["IDENTIFICATION"].ToString(),
                        Name = string.Format("{0}", dr["USERNAME"]),
                        Data = new
                        {
                            OrgName = dr["ORGNAME"],
                            OrgCode = dr["OrgCode"]
                        }
                    });
                }
            }
            return actors;
        }
    }
}
