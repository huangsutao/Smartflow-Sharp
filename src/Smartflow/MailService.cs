﻿/********************************************************************
 License: https://github.com/chengderen/Smartflow/blob/master/LICENSE 
 Home page: https://www.smartflow-sharp.com
 ********************************************************************
 */
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Text.RegularExpressions;

namespace Smartflow
{
    public class MailService : IMailService
    {
        private static Lazy<MailConfiguration> mailConfigurationLazy = new
            Lazy<MailConfiguration>(() => (MailConfiguration.Configure()));

        private static
            Lazy<SmtpClient> smtpClientLazy = new Lazy<SmtpClient>(() => new SmtpClient());

        static MailService()
        {
            MailConfiguration mailConfiguration = mailConfigurationLazy.Value;
            if (mailConfiguration != null)
            {
                SmtpClient _smtp = smtpClientLazy.Value;
                _smtp.Host = mailConfiguration.Host;
                _smtp.Port = mailConfiguration.Port;
                _smtp.DeliveryMethod = SmtpDeliveryMethod.Network;
                _smtp.EnableSsl = mailConfiguration.EnableSsl==1;
                _smtp.UseDefaultCredentials = true;
                _smtp.Credentials =
                    new NetworkCredential(mailConfiguration.Account,
                        mailConfiguration.Password);
            }
        }

        public void Notification(string[] to, string body)
        {
            MailConfiguration mailConfiguration = mailConfigurationLazy.Value;
            List<MailMessage> msgList =
                GetSendMessageList(mailConfiguration.Account,
                mailConfiguration.Name, to, "待办通知", body);
            foreach (var message in msgList)
            {
                smtpClientLazy.Value.Send(message);
            }
        }

        /// <summary>
        /// 获取消息列表
        /// </summary>
        /// <param name="from">发件人邮件地址</param>
        /// <param name="sender">发件人显示名称</param>
        /// <param name="to">收件人地址</param>
        /// <param name="subject">邮件标题</param>
        /// <param name="body">邮件正文</param>
        protected List<MailMessage> GetSendMessageList(string from, string sender, string[] recvierArray, string subject, string body)
        {
            if (recvierArray.Any(MAddress => !Regex.IsMatch(MAddress, ResourceManage.GetString(ResourceManage.MAIL_URL_EXPRESSION))))
                return null;

            List<MailMessage> messageList = new List<MailMessage>();
            foreach (string recvier in recvierArray)
            {
                MailMessage message = new MailMessage(new MailAddress(from, sender), new MailAddress(recvier));
                message.Subject = subject;
                message.SubjectEncoding = Encoding.UTF8;
                message.Body = body;
                message.BodyEncoding = Encoding.UTF8;
                message.IsBodyHtml = true;
                message.Priority = MailPriority.Normal;
                messageList.Add(message);
            }
            return messageList;
        }
    }
}
