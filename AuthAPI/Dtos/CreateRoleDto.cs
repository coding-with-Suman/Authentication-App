using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace AuthAPI.Dtos
{
    public class CreateRoleDto
    {
        [Required(ErrorMessage = "Role name is required")]
        public string RoleName { get; set; } = string.Empty;
    }
}