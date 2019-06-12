using Smartflow.Elements;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Smartflow.Internals
{
    internal class ResolutionContext
    {
        private IResolution resolution;

        public ResolutionContext(IResolution resolution)
        {
            this.resolution = resolution;
        }

        public Workflow Parse(string resourceXml)
        {
            return this.resolution.Parse(resourceXml);
        }
    }
}
