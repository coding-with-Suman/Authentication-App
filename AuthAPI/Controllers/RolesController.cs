using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AuthAPI.Dtos;
using AuthAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthAPI.Controllers
{
    [Authorize(Roles = "admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class RolesController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        public RolesController(UserManager<AppUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }

        [HttpPost("Create")]
        public async Task<ActionResult<RoleResponseDto>> CreateRole([FromBody] CreateRoleDto createRoleDto)
        {
            if (string.IsNullOrEmpty(createRoleDto.RoleName))
            {
                return BadRequest(new RoleResponseDto
                {
                    IsSuccess = false,
                    Message = "Role name is required"
                });
            }

            if (await _roleManager.RoleExistsAsync(createRoleDto.RoleName))
            {
                return BadRequest(new RoleResponseDto
                {
                    IsSuccess = false,
                    Message = "Role already exists"
                });
            }

            var roleResult = await _roleManager.CreateAsync(new IdentityRole(createRoleDto.RoleName));

            if (roleResult.Succeeded)
            {
                return Ok(new RoleResponseDto { IsSuccess = true, Message = "Role created successfully" });
            }

            return BadRequest(new RoleResponseDto
            {
                IsSuccess = false,
                Message = "Role creation failed"
            });
        }



        [HttpGet("Roles")]
        public async Task<ActionResult<IEnumerable<RoleDetailsDto>>> GetRoles()
        {
            var roles = new List<RoleDetailsDto>();

            foreach (var role in _roleManager.Roles)
            {
                var usersInRole = await _userManager.GetUsersInRoleAsync(role.Name!);
                roles.Add(new RoleDetailsDto
                {
                    Id = role.Id,
                    Name = role.Name,
                    TotalUser = usersInRole.Count
                });
            }

            return Ok(roles);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<RoleResponseDto>> DeleteRole(string id)
        {

            var role = await _roleManager.FindByIdAsync(id);

            if (role is null)
            {
                return NotFound(new RoleResponseDto
                {
                    IsSuccess = false,
                    Message = "Role not found"
                });
            }

            var result = await _roleManager.DeleteAsync(role);

            if (result.Succeeded)
            {
                return Ok(new RoleResponseDto { IsSuccess = true, Message = "Role deleted successfully" });
            }

            return BadRequest(new RoleResponseDto { IsSuccess = false, Message = "Role deletion failed" });

        }

        [HttpPost("Assign")]
        public async Task<ActionResult<RoleResponseDto>> AssignRoleToUser([FromBody] AssignRoleToUserDto assignRole)
        {
            var role = await _roleManager.FindByIdAsync(assignRole.RoleId);
            var user = await _userManager.FindByIdAsync(assignRole.UserId);

            if (role is null)
            {
                return NotFound(new RoleResponseDto
                {
                    IsSuccess = false,
                    Message = "Role not found"
                });
            }

            if (user is null)
            {
                return NotFound(new RoleResponseDto
                {
                    IsSuccess = false,
                    Message = "User not found"
                });
            }

            var result = await _userManager.AddToRoleAsync(user, role.Name!);

            if (result.Succeeded)
            {
                return Ok(new RoleResponseDto
                {
                    IsSuccess = true,
                    Message = "Role assigned successfully"
                });
            }

            var errors = result.Errors.FirstOrDefault();

            return BadRequest(new RoleResponseDto
            {
                IsSuccess = false,
                Message = errors!.Description
            });

        }




    }
}