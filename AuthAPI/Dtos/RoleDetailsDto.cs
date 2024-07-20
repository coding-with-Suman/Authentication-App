using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AuthAPI.Dtos
{
    public class RoleDetailsDto
    {
        public string? Id { get; set; }
        public string? Name { get; set; }
        public int TotalUser { get; set; }
    }
}