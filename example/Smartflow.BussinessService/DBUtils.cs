using System;
using System.Configuration;
using System.Data;
using System.Data.Common;
using System.Data.SqlClient;
using System.Text;

namespace Smartflow.BussinessService
{
    public class DBUtils
    {
        public static IDbConnection CreateConnection()
        {
            ConnectionStringSettings connectionStringSettings = ConfigurationManager.ConnectionStrings["demoConnection"];
            IDbConnection connection = 
                DbProviderFactories.GetFactory(connectionStringSettings.ProviderName).CreateConnection();
            connection.ConnectionString = connectionStringSettings.ConnectionString;
            return connection;
        }
    }
}
