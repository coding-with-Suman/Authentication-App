using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using AuthAPI.Dtos;
using AuthAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing.Template;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RestSharp;

namespace AuthAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
       private readonly UserManager<AppUser> _userManager;
       private readonly RoleManager<IdentityRole> _roleManager;
       private readonly IConfiguration _configuration;
       public AccountController(UserManager<AppUser> userManager, RoleManager<IdentityRole> roleManager, IConfiguration configuration)
       {
        _userManager = userManager;
        _roleManager = roleManager;
        _configuration = configuration;
       }

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto registerDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = new AppUser 
            {
                UserName = registerDto.Email,
                Email = registerDto.Email,
                FullName = registerDto.FullName
            };

            var result = await _userManager.CreateAsync(user, registerDto.Password);

            if(!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            if (registerDto.Roles is null)
            {
                await _userManager.AddToRoleAsync(user, "User");
            }
            else
            {
                foreach(var role in registerDto. Roles)
                {
                    await _userManager.AddToRoleAsync(user, role);
                }
            }

            return Ok(new AuthResponseDto{
                IsSuccess = true,
                Message = "User created successfully",
            });
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginDto loginDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userManager.FindByEmailAsync(loginDto.Email);

            if(user is null)
            {
                return Unauthorized(new AuthResponseDto{
                    IsSuccess = false,
                    Message = "User not found"
                });
            }

            var result = await _userManager.CheckPasswordAsync(user, loginDto.Password);

            if(!result)
            {
                return Unauthorized(new AuthResponseDto{
                    IsSuccess = false,
                    Message = "Password is incorrect"
                });
            }

            var token = GenerateToken(user);

            return Ok(new AuthResponseDto{
                IsSuccess = true,
                Message = "User logged in successfully",
                Token = token
            });

        }

        private string GenerateToken(AppUser user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            
            var key = Encoding.ASCII.GetBytes(_configuration.GetSection("JWTSettings").GetSection("securityKey").Value!);
            var roles = _userManager.GetRolesAsync(user).Result;
            List<Claim> claims = 
            [
                new (JwtRegisteredClaimNames.Email, user.Email ?? ""),
                new (JwtRegisteredClaimNames.Name, user.FullName ?? ""),
                new (JwtRegisteredClaimNames.NameId, user.Id ?? ""),
                new (JwtRegisteredClaimNames.Aud, _configuration.GetSection("JWTSettings").GetSection("validAudience").Value!),
                new (JwtRegisteredClaimNames.Iss, _configuration.GetSection("JWTSettings").GetSection("validIssuer").Value!)
            ];

            foreach(var role in roles){
                claims.Add(new (ClaimTypes.Role, role));
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256)

            };

            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);

        }

        [Authorize]
        [HttpGet("Details")]
        public async Task<ActionResult<UserDetailsDto>> GetUserDetails()
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userManager.FindByIdAsync(currentUserId!);

            if(user is null)
            {
                return NotFound(new AuthResponseDto{
                    IsSuccess = false,
                    Message = "User not found"
                });
            }

            return Ok(new UserDetailsDto{
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Roles = [.. await _userManager.GetRolesAsync(user)],
                PhoneNumber = user.PhoneNumber,
                PhoneNumberConfirmed = user.PhoneNumberConfirmed,
                AccessFailedCount = user.AccessFailedCount

            });

        }

        [HttpGet("Users")]
        public async Task<ActionResult<IEnumerable<UserDetailsDto>>> GetUsers()
        {
            var users = await _userManager.Users.Select(u => new UserDetailsDto{
                Id = u.Id,
                Email = u.Email,
                FullName = u.FullName,
                Roles =  _userManager.GetRolesAsync(u).Result.ToArray(),
                PhoneNumber = u.PhoneNumber,
                PhoneNumberConfirmed = u.PhoneNumberConfirmed,
                AccessFailedCount = u.AccessFailedCount
            }).ToListAsync();

            if(users is null)
            {
                return NotFound(new AuthResponseDto{
                    IsSuccess = false,
                    Message = "Users not found"
                });
            }
            
            return Ok(users);

        }

        [AllowAnonymous]
        [HttpPost("ForgotPassword")]
        public async Task<ActionResult> ForgotPassword (ForgotPasswordDto forgotPasswordDto){
            var user = await _userManager.FindByEmailAsync(forgotPasswordDto.Email);

            if(user is null){
                return NotFound(new AuthResponseDto{
                    IsSuccess = false,
                    Message = "User not found with this email"
                });
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var resetLink = $"http://localhost:4200/reset-password?email={user.Email}&token={WebUtility.UrlEncode(token)}";

            var client = new RestClient("https://sandbox.api.mailtrap.io/api/send/3052899");

            var request = new RestRequest{
                Method = Method.Post,
                RequestFormat = DataFormat.Json
            };

            request.AddHeader("Authorization", "Bearer 98c6730db467a873b9bed61fa18479bb");
            request.AddJsonBody(new{
                from = new {email = "mailtrap@demomailtrap.com" },
                to = new[] { new {email = user.Email } },
                template_uuid = "6112b602-0a1e-49f1-8b97-3b801053bb82",
                template_variables = new {email = user.Email, resetLink = resetLink}
            });

            var response = client.Execute(request);

            if(response.IsSuccessful){
                return Ok(new AuthResponseDto{
                    IsSuccess = true,
                    Message = $"Reset link sent to {user.Email}"
                });
            }
            else{
                return BadRequest(new AuthResponseDto{
                    IsSuccess = false,
                    Message = "Failed to send reset link"
                });
            }

        }

        [AllowAnonymous]
        [HttpPost("ResetPassword")]
        public async Task<ActionResult> ResetPassword (ResetPasswordDto resetPasswordDto){
            var user = await _userManager.FindByEmailAsync(resetPasswordDto.Email);
            // resetPasswordDto.Token = WebUtility.UrlDecode(resetPasswordDto.Token);

            if(user is null){
                return BadRequest(new AuthResponseDto{
                    IsSuccess = false,
                    Message = "User does not exits."
                });
            }

            var result = await _userManager.ResetPasswordAsync(user, resetPasswordDto.Token, resetPasswordDto.NewPassword);

            if(result.Succeeded){
                return Ok(new AuthResponseDto{
                    IsSuccess = true,
                    Message = "Password Reset Successfully"
                });
            }

            return BadRequest(new AuthResponseDto{
                IsSuccess = false,
                Message = result.Errors.FirstOrDefault()!.Description
            });

        }

    }
}