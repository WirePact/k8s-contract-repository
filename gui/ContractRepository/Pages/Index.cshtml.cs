using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace ContractRepository.Pages;

[Authorize("web-gui-auth")]
public class Index : PageModel
{
    public void OnGet()
    {
    }
}
