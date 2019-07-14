using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Smartflow.Elements;
using Smartflow.BussinessService.Models;
using Smartflow.BussinessService.Services;
using System.Reflection;

namespace Smartflow.BussinessService.WorkflowService
{
    public partial class BaseWorkflowService
    {
        public List<Group> GetCurrentActorGroup(string instanceID)
        {
            return WorkflowInstance.GetInstance(instanceID).Current.Groups;
        }

        protected List<User> GetUsersByGroup(List<Group> items, List<Actor> actors)
        {
            List<User> userList = new List<User>();
            List<string> gList = new List<string>();
            List<string> ids = new List<string>();
            foreach (Group g in items)
            {
                gList.Add(g.ID.ToString());
            }
            foreach (Actor item in actors)
            {
                ids.Add(item.ID);
            }
            var userService = new UserService();
            if (ids.Count > 0)
            {
                userList.AddRange(userService.GetUserListByActor(string.Join(",", ids)));
            }
            if (gList.Count > 0)
            {
                userList.AddRange(userService.GetUserList(string.Join(",", gList)));
            }
            return userList;
        }

        public void OnProcess(ExecutingContext executeContext)
        {
            if (executeContext.Instance.Current.NodeType == WorkflowNodeCategory.Decision)
            {
                DecisionJump(executeContext);
            }
            else
            {
                //写入审批记录
                WriteRecord(executeContext);
                string instanceID = executeContext.Instance.InstanceID;
                var current = GetCurrentNode(instanceID);
                if (current.Name == "结束")
                {
                    pendingService.Delete(p => p.INSTANCEID == instanceID);
                }
                else
                {
                    //流程跳转|流程撤销(重新指派人审批) 仅限演示
                    List<User> userList = GetUsersByGroup(current.Groups, current.Actors);
                    foreach (User user in userList)
                    {
                        WritePending(user.IDENTIFICATION.ToString(), executeContext);
                    }
                    string NID = executeContext.Instance.Current.NID;
                    pendingService.Delete(pending => pending.NODEID == NID && pending.INSTANCEID == instanceID);
                }
            }
        }

        /// <summary>
        /// 多条件跳转
        /// </summary>
        /// <param name="executeContext">执行上下文</param>
        private void DecisionJump(ExecutingContext executeContext)
        {
            string instanceID = executeContext.Instance.InstanceID;
            string NID = executeContext.Instance.Current.NID;
            var current = GetCurrentNode(executeContext.Instance.InstanceID);

            if (current.NodeType != WorkflowNodeCategory.Decision)
            {
                List<User> userList = GetUsersByGroup(current.Groups, current.Actors);
                foreach (var user in userList)
                {
                    WritePending(user.IDENTIFICATION.ToString(), executeContext);
                }
            }

            pendingService.Delete(pending =>
                 pending.NODEID == NID &&
                 pending.INSTANCEID == instanceID);
        }

        /// <summary>
        /// 写入审批记录
        /// </summary>
        /// <param name="executeContext"></param>
        public void WriteRecord(ExecutingContext executeContext)
        {
            //写入审批记录
            recordService.Insert(new Record()
            {
                INSTANCEID = executeContext.Instance.InstanceID,
                NODENAME = executeContext.From.Name,
                MESSAGE = executeContext.Data.Message
            });
        }

        /// <summary>
        /// 写待办信息
        /// </summary>
        /// <param name="actorID">参与者</param>
        /// <param name="executeContext"></param>
        public void WritePending(string actorID, ExecutingContext executeContext)
        {
            pendingService.Insert(new Pending()
            {
                ACTORID = actorID,
                INSTANCEID = executeContext.Instance.InstanceID,
                NODEID = GetCurrentNode(executeContext.Instance.InstanceID).NID,
                APPELLATION = executeContext.Data.Url
            });
        }
    }
}
