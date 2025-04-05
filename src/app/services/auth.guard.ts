import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot } from "@angular/router";
import { AuthService } from "./auth.service";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { RouterStateSnapshot } from "@angular/router";
import { CanActivate } from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean| Observable<boolean> | Promise<boolean> {
    const isAuth = this.authService.getIsAuth();
    if (!isAuth) {
      this.router.navigate(['/login']);
    }
    return isAuth;
  }
}

