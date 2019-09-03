/********************************************************************
 License: https://github.com/chengderen/Smartflow/blob/master/LICENSE 
 Home page: https://www.smartflow-sharp.com
 Github : https://github.com/chengderen/Smartflow-Sharp
 ********************************************************************
 */
using System;
using Smartflow.Elements;

namespace Smartflow.Internals
{
    internal class XMLServiceFactory
    {
        public static Workflow Create(string resouceXml)
        {
            return new ResolutionContext(new Manual())
                .Parse(resouceXml);
        }
    }
}
