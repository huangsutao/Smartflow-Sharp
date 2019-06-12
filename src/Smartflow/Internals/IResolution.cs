using Smartflow.Elements;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Smartflow.Internals
{
    public interface IResolution
    {
        Workflow Parse(string resourceXml);
    }
}
