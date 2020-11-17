import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { RegisterForm } from '../interfaces/register-form.interface';
import { LoginForm } from '../interfaces/login-form.interface';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';

const base_url = environment.base_url;

declare const gapi: any;


@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  public auth2: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private ngZone: NgZone) {

    this.googleInit();
  }


  googleInit() {

    return new Promise(resolve => {

      gapi.load('auth2', () => {
        this.auth2 = gapi.auth2.init({
          client_id: '121367807648-c3rs01brkb7n4s558ap6da5uvoj3q7pi.apps.googleusercontent.com',
          cookiepolicy: 'single_host_origin',
        });

        resolve();
      });

    })


  }



  // Base del auth.guard
  validarToken(): Observable<boolean> {

    const token = localStorage.getItem("token") || "";

    return this.http.get(`${base_url}/login/renew`, {
      headers: {
        "token": token
      }
    }).pipe(

      map((resp: any) => {
        localStorage.setItem("token", resp.token);
        return true;
      }),
      catchError(error => of(false))

    );

  }



  crearUsuario(formData: RegisterForm) {

    return this.http.post(`${base_url}/usuarios`, formData)
      .pipe(

        tap((resp: any) => {
          localStorage.setItem('token', resp.token)
        })

      );

  }




  login(formData: LoginForm) {


    if (formData.remember) {
      localStorage.setItem("email", formData.email);
    } else {
      localStorage.removeItem("email");
    }

    return this.http.post(`${base_url}/login`, formData)
      .pipe(

        tap((resp: any) => {
          localStorage.setItem("token", resp.token);
        })

      );

  }




  loginGoogle(token) {

    return this.http.post(`${base_url}/login/google`, { token })
      .pipe(

        tap((resp: any) => {
          localStorage.setItem("token", resp.token);
        })

      );

  }




  logout() {

    localStorage.removeItem("token");

    this.auth2.signOut().then(() => {

      this.ngZone.run(() => {
        this.router.navigateByUrl("/login");
      });

    });

  }





}
