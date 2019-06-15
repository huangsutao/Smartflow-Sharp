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
