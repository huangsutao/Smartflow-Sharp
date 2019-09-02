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
        protected List<IWorkflowAction> Actions
        {
            get { return WorkflowGlobalServiceProvider.Query<IWorkflowAction>(); }
        }

        public static WorkflowEngine Instance
        {
            get { return singleton; }
        }

        /// <summary>
        /// 监控的过程服务
        /// </summary>
        protected IWorkProcessPersistent ProcessService
        {
            get
            {
                return WorkflowGlobalServiceProvider.Resolve<IWorkProcessPersistent>();
            }
        }

        /// <summary>
        /// 会签服务
        /// </summary>
        protected AbstractWorkflowCooperation WorkflowCooperationService
        {
            get
            {
                return WorkflowGlobalServiceProvider.Resolve<AbstractWorkflowCooperation>();
            }
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

                this.Invoke(context, to, transitionTo, (executeContext) => Processing(executeContext));

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
        protected void Processing(ExecutingContext executeContext)
        {
            ProcessService.Persistent(new WorkflowProcess()
            {
                RelationshipID = executeContext.From.NID,
                Origin = executeContext.From.ID,
                Destination = executeContext.To.ID,
                TransitionID = executeContext.TransitionID,
                InstanceID = executeContext.Instance.InstanceID,
                NodeType = executeContext.From.NodeType,
                Increment = executeContext.From.Increment
            });

            this.Actions.ForEach(pluin => pluin.ActionExecute(executeContext));
        }

        protected void Invoke(WorkflowContext context, ASTNode to, string selectTransition, System.Action<ExecutingContext> executeAction)
        {
            WorkflowNode current = context.Instance.Current;

            bool validation = true;

            if (WorkflowCooperationService != null && current.Cooperation > 0)
            {
                IList<WorkflowProcess> records = ProcessService.GetLatestRecords(current.InstanceID, current.NID, current.Increment);

                validation = WorkflowCooperationService.Check(current, records);

                selectTransition = WorkflowCooperationService
                    .SelectStrategy()
                    .Decide(records, to.ID,
                    (workflowProcess) => ProcessService.Persistent(workflowProcess));
            }

            if (validation)
            {
                context.Instance.Jump(to.ID);

                var next = WorkflowInstance
                   .GetInstance(current.InstanceID)
                   .Current;
                if (next.NodeType != WorkflowNodeCategory.End)
                {
                    next.DoIncrement();
                }
            }

            executeAction(new ExecutingContext()
            {
                From = current,
                To = to,
                TransitionID = context.TransitionID,
                Instance = context.Instance,
                Data = context.Data,
                ActorID = context.ActorID,
                ActorName = context.ActorName,
                IsValid = validation
            });
        }
    }
}
