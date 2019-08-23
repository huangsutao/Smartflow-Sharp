/********************************************************************
 License: https://github.com/chengderen/Smartflow/blob/master/LICENSE 
 Home page: https://www.smartflow-sharp.com
 Github : https://github.com/chengderen/Smartflow-Sharp
 ********************************************************************
 */
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using Smartflow.Elements;


namespace Smartflow
{
    public class WorkflowEngine
    {
        private readonly static WorkflowEngine singleton = new WorkflowEngine();
        private IWorkflow workflowService = WorkflowGlobalServiceProvider.Resolve<IWorkflow>();

        protected WorkflowEngine()
        {
        }

        /// <summary>
        /// 全局 自定义动作
        /// </summary>
        protected IList<IWorkflowAction> Actions
        {
            get { return WorkflowGlobalServiceProvider.Query<IWorkflowAction>(); }
        }

        /// <summary>
        /// 默认的动作解析服务
        /// </summary>
        protected IResolve Resolve
        {
            get { return WorkflowGlobalServiceProvider.Resolve<IResolve>(); }
        }

        public static WorkflowEngine Instance
        {
            get { return singleton; }
        }

        /// <summary>
        /// 根据传递的流程XML字符串,启动工作流
        /// </summary>
        /// <param name="resourceXml"></param>
        /// <returns></returns>
        public string Start(string resourceXml)
        {
            return workflowService.Start(resourceXml);
        }

        /// <summary>
        /// 进行流程跳转
        /// </summary>
        /// <param name="context"></param>
        public void Jump(WorkflowContext context)
        {
            WorkflowInstance instance = context.Instance;
            if (instance.State == WorkflowInstanceState.Running)
            {
                WorkflowNode current = instance.Current;
                string transitionTo = current.Transitions
                                  .FirstOrDefault(e => e.NID == context.TransitionID).Destination;

                ASTNode to = current.GetNode(transitionTo);
                List<IWorkflowAction> partAction = this.GetWorkflowActions(to);

                Process(context, partAction);
                instance.Jump(transitionTo);

                Processing(new ExecutingContext()
                {
                    From = current,
                    To = to,
                    TransitionID = context.TransitionID,
                    Instance = instance,
                    Data = context.Data,
                    ActorID = context.ActorID,
                    ActorName = context.ActorName
                }, partAction);

                if (to.NodeType == WorkflowNodeCategory.End)
                {
                    instance.Transfer(WorkflowInstanceState.End);
                }
                else if (to.NodeType == WorkflowNodeCategory.Decision)
                {
                    WorkflowDecision wfDecision = WorkflowDecision.ConvertToReallyType(to);
                    Transition transition = wfDecision.GetTransition();
                    if (transition == null) return;
                    Jump(new WorkflowContext()
                    {
                        Instance = WorkflowInstance.GetInstance(instance.InstanceID),
                        TransitionID = transition.NID,
                        ActorID = context.ActorID,
                        Data = context.Data
                    });
                }
            }
        }

        /// <summary>
        /// 跳转过程处理入库
        /// </summary>
        /// <param name="executeContext">执行上下文</param>
        protected void Processing(ExecutingContext executeContext, List<IWorkflowAction> partAction)
        {
            workflowService.Processing(new WorkflowProcess()
            {
                RelationshipID = executeContext.To.NID,
                Origin = executeContext.From.ID,
                Destination = executeContext.To.ID,
                TransitionID = executeContext.TransitionID,
                InstanceID = executeContext.Instance.InstanceID,
                NodeType = executeContext.From.NodeType
            });
            partAction.ForEach(pluin => pluin.ActionExecuted(executeContext));
        }

        /// <summary>
        ///  跳转前
        /// </summary>
        /// <param name="context"></param>
        /// <param name="to"></param>
        protected void Process(WorkflowContext context, List<IWorkflowAction> partAction)
        {
            partAction.ForEach(pluin => pluin.ActionExecute(context));
        }

        private List<IWorkflowAction> GetWorkflowActions(ASTNode to)
        {
            List<IWorkflowAction> partAction = new List<IWorkflowAction>();
            partAction.AddRange(this.Actions);
            WorkflowNode nodes = WorkflowNode.ConvertToReallyType(to);
            nodes.Actions.ForEach(el =>
            {
                IWorkflowAction defaultAction = Resolve.Scan(el.ID);
                if (defaultAction != null)
                {
                    partAction.Add(defaultAction);
                }
            });
            return partAction;
        }
    }
}
