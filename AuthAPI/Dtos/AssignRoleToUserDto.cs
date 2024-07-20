using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AuthAPI.Dtos
{
    public class AssignRoleToUserDto
    {
        public string UserId { get; set; } = null!;
        public string RoleId { get; set; } = null!;
    }
}