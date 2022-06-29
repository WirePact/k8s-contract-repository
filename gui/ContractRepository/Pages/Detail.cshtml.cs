using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Wirepact.Contracts;

namespace ContractRepository.Pages;

public class Detail : PageModel
{
    private readonly ContractsService.ContractsServiceClient _client;

    public Detail(ContractsService.ContractsServiceClient client)
    {
        _client = client;
    }

    public Contract Contract { get; set; } = new();

    public async Task OnGetAsync(string contractId)
    {
        Contract = await _client.GetAsync(new() {Id = contractId});
    }

    public async Task<IActionResult> OnPostDeleteContractAsync(string id)
    {
        await _client.DeleteAsync(new() {Id = id});
        return RedirectToPage("/Index");
    }
}
