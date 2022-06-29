using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Wirepact.Contracts;

namespace ContractRepository.Pages;

[Authorize]
public class Index : PageModel
{
    private readonly ContractsService.ContractsServiceClient _client;

    public Index(ContractsService.ContractsServiceClient client)
    {
        _client = client;
    }

    public List<Contract> Contracts { get; set; } = new();

    public async Task OnGetAsync()
    {
        Contracts = (await _client.ListAsync(new())).Contracts.OrderBy(c => c.Id).ToList();
    }
}
