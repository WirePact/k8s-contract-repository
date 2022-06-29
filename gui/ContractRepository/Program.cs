using AspNetCore.Authentication.Basic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Wirepact.Contracts;

if (!EnvSet("AUTH_USER"))
{
    throw new Exception("AUTH_USER environment variable must be set");
}

if (!EnvSet("AUTH_PASS"))
{
    throw new Exception("AUTH_PASS environment variable must be set");
}

if (!EnvSet("REPO_URI"))
{
    throw new Exception("REPO_URI environment variable must be set");
}

if (!short.TryParse(Environment.GetEnvironmentVariable("PORT") ?? "8080", out var port))
{
    port = 8080;
}

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.ConfigureKestrel(s =>
{
    s.ListenAnyIP(port, o =>
    {
        o.Protocols = HttpProtocols.Http1AndHttp2;
#if DEBUG
        o.UseHttps();
#endif
    });
});

var services = builder.Services;
services.AddHealthChecks();
services.AddRouting(o => o.LowercaseUrls = true);
services.AddRazorPages()
#if DEBUG
    .AddRazorRuntimeCompilation()
#endif
    ;
services.AddSingleton<IActionContextAccessor, ActionContextAccessor>();
services.AddScoped<IUrlHelper>(factory =>
{
    var actionContext = factory
        .GetRequiredService<IActionContextAccessor>()
        .ActionContext;
    return new UrlHelper(actionContext ?? new ActionContext());
});
services.AddServerSideBlazor();
services.AddSignalR(e => e.MaximumReceiveMessageSize = 1024 * 1024);
services
    .AddAuthorization()
    .AddAuthentication(BasicDefaults.AuthenticationScheme)
    .AddBasic<BasicUserValidation>(o => o.Realm = "WirePact Contract Repository");
services.AddGrpcClient<ContractsService.ContractsServiceClient>(o =>
    o.Address = new Uri(Environment.GetEnvironmentVariable("REPO_URI") ?? ""));

var webapp = builder.Build();
webapp.UseStaticFiles();
webapp.UseRouting();
webapp.UseAuthentication();
webapp.UseAuthorization();
webapp.MapRazorPages();
webapp.MapBlazorHub(
    o =>
    {
        o.ApplicationMaxBufferSize = 1024 * 1024;
        o.TransportMaxBufferSize = 1024 * 1024;
    });
await webapp.RunAsync();

bool EnvSet(string name) => !string.IsNullOrEmpty(Environment.GetEnvironmentVariable(name));

internal class BasicUserValidation : IBasicUserValidationService
{
    public Task<bool> IsValidAsync(string username, string password) => Task.FromResult(
        username == Environment.GetEnvironmentVariable("AUTH_USER") &&
        password == Environment.GetEnvironmentVariable("AUTH_PASS"));
}
