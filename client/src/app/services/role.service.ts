import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../interfaces/role';
import { RoleCreateRequest } from '../interfaces/role-create-request';
import { RoleResponse } from '../interfaces/role-response';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  apiUrl = environment.apiUrl;

  constructor(private http:HttpClient) { }

  getRoles = () : Observable<Role[]> => {
    return this.http.get<Role[]>(`${this.apiUrl}Roles/Roles`);
  }

  createRole = (role : RoleCreateRequest) : Observable<RoleResponse> => {
    return this.http.post<RoleResponse>(`${this.apiUrl}Roles/Create`, role);
  }
  
  deleteRole = (id : string) : Observable<RoleResponse> => {
    return this.http.delete<RoleResponse>(`${this.apiUrl}Roles/${id}`);
  }

  assignRole = (userId : string, roleId : string) : Observable<RoleResponse> => {
    return this.http.post<RoleResponse>(`${this.apiUrl}Roles/Assign`, {userId, roleId});
  }
}
