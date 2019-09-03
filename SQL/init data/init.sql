--如果与当前数据库的关键字有冲突，请自行调整
USE Demo

GO
--T_USER
SET IDENTITY_INSERT T_USER ON 
INSERT INTO T_USER(IDENTIFICATION,USERNAME,USERPWD,EMPLOYEENAME,ORGCODE,ORGNAME) VALUES(1,'chengderen','123456','程德忍','001001','网络研发一组')
INSERT INTO T_USER(IDENTIFICATION,USERNAME,USERPWD,EMPLOYEENAME,ORGCODE,ORGNAME) VALUES(2,'xuq','123456','徐群','001001','网络研发一组')
INSERT INTO T_USER(IDENTIFICATION,USERNAME,USERPWD,EMPLOYEENAME,ORGCODE,ORGNAME) VALUES(3,'xyq','123456','徐焰群','001002','网络研发二组')
INSERT INTO T_USER(IDENTIFICATION,USERNAME,USERPWD,EMPLOYEENAME,ORGCODE,ORGNAME) VALUES(4,'zhangsan','123456','张三','002','市场部')
INSERT INTO T_USER(IDENTIFICATION,USERNAME,USERPWD,EMPLOYEENAME,ORGCODE,ORGNAME) VALUES(5,'wangwu','123456','王五','002','市场部')
INSERT INTO T_USER(IDENTIFICATION,USERNAME,USERPWD,EMPLOYEENAME,ORGCODE,ORGNAME) VALUES(6,'wanger','123456','王二','002','市场部')
INSERT INTO T_USER(IDENTIFICATION,USERNAME,USERPWD,EMPLOYEENAME,ORGCODE,ORGNAME) VALUES(7,'libin','123456','李斌','002','市场部')
INSERT INTO T_USER(IDENTIFICATION,USERNAME,USERPWD,EMPLOYEENAME,ORGCODE,ORGNAME) VALUES(8,'zhongsan','123456','钟三','002','市场部')
SET IDENTITY_INSERT T_USER OFF 




SET IDENTITY_INSERT T_ROLE ON 
INSERT INTO T_ROLE(Identification,Appellation)VALUES(1,'系统管理员')
INSERT INTO T_ROLE(Identification,Appellation)VALUES(2,'小组长')
INSERT INTO T_ROLE(Identification,Appellation)VALUES(3,'总经理')
INSERT INTO T_ROLE(Identification,Appellation)VALUES(4,'部门经理')
INSERT INTO T_ROLE(Identification,Appellation)VALUES(5,'部门助理')
INSERT INTO T_ROLE(Identification,Appellation)VALUES(6,'总经理秘书')
INSERT INTO T_ROLE(Identification,Appellation)VALUES(7,'项目经理')
INSERT INTO T_ROLE(Identification,Appellation)VALUES(8,'市场部经理')
SET IDENTITY_INSERT T_ROLE OFF 

--T_UMR
INSERT INTO T_UMR(RID,UUID)VALUES(1,1)
INSERT INTO T_UMR(RID,UUID)VALUES(1,2)
INSERT INTO T_UMR(RID,UUID)VALUES(1,3)
INSERT INTO T_UMR(RID,UUID)VALUES(2,4)
INSERT INTO T_UMR(RID,UUID)VALUES(2,8)
INSERT INTO T_UMR(RID,UUID)VALUES(3,1)
INSERT INTO T_UMR(RID,UUID)VALUES(4,2)
INSERT INTO T_UMR(RID,UUID)VALUES(4,5)
INSERT INTO T_UMR(RID,UUID)VALUES(5,7)
INSERT INTO T_UMR(RID,UUID)VALUES(6,6)
INSERT INTO T_UMR(RID,UUID)VALUES(7,3)
INSERT INTO T_UMR(RID,UUID)VALUES(7,8)
INSERT INTO T_UMR(RID,UUID)VALUES(8,4)


--T_ORG
INSERT INTO T_ORG(ORGNAME,ORGCODE,PARENTCODE,DESCRIPTION)VALUES('组织机构','000','0','')
INSERT INTO T_ORG(ORGNAME,ORGCODE,PARENTCODE,DESCRIPTION)VALUES('网络研发部','001','000','')
INSERT INTO T_ORG(ORGNAME,ORGCODE,PARENTCODE,DESCRIPTION)VALUES('市场部','002','000','')
INSERT INTO T_ORG(ORGNAME,ORGCODE,PARENTCODE,DESCRIPTION)VALUES('综合管理部','003','000','')
INSERT INTO T_ORG(ORGNAME,ORGCODE,PARENTCODE,DESCRIPTION)VALUES('后勤保障门','004','000','')
INSERT INTO T_ORG(ORGNAME,ORGCODE,PARENTCODE,DESCRIPTION)VALUES('网络研发一组','001001','001','')
INSERT INTO T_ORG(ORGNAME,ORGCODE,PARENTCODE,DESCRIPTION)VALUES('网络研发二组','001002','001','')

INSERT INTO [dbo].[t_structure] ([IDENTIFICATION], [APPELLATION], [STRUCTUREXML]) VALUES (N'07880c98-caf1-494c-9c32-b52e686f3084', N'简单流程', N'<workflow><start id="30" name="开始" layout="260 23 70 -18" category="start" cooperation="0"><transition name="提交部门助理审批" destination="32" layout="290,100 291,143"></transition></start><end id="31" name="结束" layout="266 23 346 -12" category="end" cooperation="0"><action id="Smartflow.BussinessService.WorkflowService.DefaultAction" name="DefaultAction"/></end><node id="32" name="部门助理" layout="201 71 143 17" category="node" cooperation="0"><transition name="提交部门经理审批" destination="33" layout="291,183 293,226"></transition><actor id="1" name="chengderen"/><actor id="2" name="xuq"/><actor id="4" name="zhangsan"/></node><node id="33" name="部门经理" layout="203 107 226 24" category="node" cooperation="0"><group id="3" name="总经理"/><action id="Smartflow.BussinessService.WorkflowService.TestAction" name="TestAction"/><transition name="结束" destination="31" layout="293,266 296,316"></transition><transition name="退回到部门助理" destination="32" layout="383,246 469,245 471,164 381,163"><marker x="464" y="240" length="43"/><marker x="466" y="159" length="61"/></transition></node></workflow>')
