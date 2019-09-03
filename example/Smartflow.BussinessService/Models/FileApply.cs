﻿using Dapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Smartflow.BussinessService.Models
{
    [Table("T_APPLY")]
    public class FileApply 
    {
        [Key]
        public long IDENTIFICATION
        {
            get;
            set;
        }

        public string FNAME
        {
            get;
            set;
        }

        public string DESCRIPTION
        {
            get;
            set;
        }

        public string STRUCTUREID
        {
            get;
            set;
        }

        public string INSTANCEID
        {
            get;
            set;
        }

        public string SECRETGRADE
        {
            get;
            set;
        }
    }
}