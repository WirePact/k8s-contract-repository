using McMaster.Extensions.CommandLineUtils;
using Microsoft.AspNetCore.Server.Kestrel.Core;

var cmdApp = new CommandLineApplication();

cmdApp.HelpOption();
var auth = cmdApp.Option<Authentication>("-a|--auth <METHOD>", "Authentication method for web GUI",
    CommandOptionType.SingleValue);
auth.DefaultValue = Authentication.None;
var port = cmdApp.Option<short>("-p|--port <PORT>", "Port for web GUI",
    CommandOptionType.SingleValue);
port.DefaultValue = 8080;

cmdApp.OnExecuteAsync(async _ =>
{
    switch (auth.ParsedValue)
    {
        // Check for authentication and the required env vars.
        case Authentication.Basic when !EnvSet("BASIC_USER") || !EnvSet("BASIC_PASS"):
            throw new Exception(
                "Basic authentication is enabled but the required env vars (BASIC_USER, BASIC_PASS) are not set.");
        case Authentication.Oidc when !EnvSet("OIDC_CLIENT_ID") || !EnvSet("OIDC_ISSUER"):
            throw new Exception(
                "OIDC authentication is enabled but the required env vars (OIDC_CLIENT_ID, OIDC_ISSUER) are not set.");
    }

    var builder = WebApplication.CreateBuilder(args);
    builder.WebHost.ConfigureKestrel(s =>
    {
        s.ListenAnyIP(port.ParsedValue, o =>
        {
            o.Protocols = HttpProtocols.Http1AndHttp2;
#if DEBUG
            o.UseHttps();
#endif
        });
    });

    var services = builder.Services;
    services.AddHealthChecks();
    services.AddRazorPages()
#if DEBUG
        .AddRazorRuntimeCompilation()
#endif
        ;
    services
        .AddAuthorization(o =>
        {
            // o.AddPolicy("web-gui-auth", b =>
            // {
            //     if (auth.ParsedValue == Authentication.None)
            //     {
            //         return;
            //     }
            // });
        })
        .AddAuthentication();

    var webapp = builder.Build();
    webapp.MapRazorPages();
    webapp.UseStaticFiles();
    await webapp.RunAsync();
});

return await cmdApp.ExecuteAsync(args);

bool EnvSet(string name) => !string.IsNullOrEmpty(Environment.GetEnvironmentVariable(name));

internal enum Authentication
{
    None,
    Basic,
    Oidc,
}
