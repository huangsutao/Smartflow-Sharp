using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using Dapper;
using Smartflow.BussinessService.Models;

namespace Smartflow.BussinessService.Services
{
    public class FileApplyService : RepositoryService<FileApply>
    {
        public void Persistent(FileApply model)
        {
            Insert(model);
        }

        public FileApply GetByInstanceID(string instanceID)
        {
            return
                base
                .Query(e => e.INSTANCEID == instanceID)
                .FirstOrDefault();
        }
    }
}