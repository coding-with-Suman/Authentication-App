using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AuthAPI.Dtos
{
    public class RoleResponseDto
    {
        public bool IsSuccess { get; set; }
        public string? Message { get; set; }
    }
}