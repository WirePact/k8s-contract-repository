using Google.Protobuf;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Wirepact.Contracts;

namespace ContractRepository.Pages;

public class New : PageModel
{
    private readonly ContractsService.ContractsServiceClient _client;

    public New(ContractsService.ContractsServiceClient client)
    {
        _client = client;
    }

    [BindProperty] public List<Pki> Pkis { get; set; } = new();

    public async Task<IActionResult> OnPostAsync()
    {
        // TODO: error handling
        await _client.CreateAsync(new()
        {
            Participants = {Pkis.ToDictionary(p => p.Name, p => ByteString.CopyFromUtf8(p.PublicCertificate))}
        });
        return RedirectToPage("/Index");
    }
}

public record Pki
{
    public string Name { get; set; } = string.Empty;
    public string PublicCertificate { get; set; } = string.Empty;
}
