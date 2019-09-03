﻿using Smartflow.BussinessService.Models;
using Smartflow.BussinessService.Services;
using Smartflow.Elements;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Smartflow.BussinessService.WorkflowService
{
    public class PendingAction : IWorkflowAction
    {
        private PendingService pendingService = new PendingService();

        public void ActionExecute(ExecutingContext executeContext)
        {
            if (executeContext.Instance.Current.NodeType == WorkflowNodeCategory.Decision)
            {
                DecisionJump(executeContext);
            }
            else
            {
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

                    /****************************************************
                     * 发送邮件的示例代码
                     * 此处仅仅演示如何调用发送邮件的方法
                    System.Threading.Tasks.Task.Factory.StartNew(() => {
                        List<string> recList = new List<string>();
                        foreach (User item in userList)
                        {
                            //接收邮箱地址
                            recList.Add(item.mail);
                        }
                        //发送邮件
                        WorkflowGlobalServiceProvider.Resolve<IMailService>()
                            .Notification(recList.ToArray<string>(), "您有新待办信息，请及时审批。");
                    });
                    ********************************************************/
                    foreach (User user in userList)
                    {
                        WritePending(user.IDENTIFICATION.ToString(), executeContext);
                    }

                    if (executeContext.IsValid)
                    {
                        string NID = executeContext.Instance.Current.NID;
                        pendingService.Delete(pending => pending.NODEID == NID && pending.INSTANCEID == instanceID);
                    }
                 }
             }
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

            //去重了
            return userList
                .ToLookup(p => p.IDENTIFICATION)
                .Select(c => c.First())
                .ToList();
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

        public WorkflowNode GetCurrentNode(string instanceID)
        {
            return WorkflowInstance.GetInstance(instanceID).Current;
        }
    }
}
