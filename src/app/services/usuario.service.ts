import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { RegisterForm } from '../interfaces/register-form.interface';
import { LoginForm } from '../interfaces/login-form.interface';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';

import { Usuario } from '../models/usuario.model';
import { MultiDataSet } from 'ng2-charts';

const base_url = environment.base_url;

declare const gapi: any;


@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  public auth2: any;
  public usuario: Usuario;

  constructor(
    private http: HttpClient,
    private router: Router,
    private ngZone: NgZone) {

    this.googleInit();
  }

  get token(): string {
    return localStorage.getItem("token") || "";
  }

  get uid(): string {
    return this.usuario.uid;
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


    return this.http.get(`${base_url}/login/renew`, {
      headers: {
        "token": this.token
      }
    }).pipe(

      map((resp: any) => {

        const { email, google, nombre, role, img = "", _id } = resp.usuarioDB;
        this.usuario = new Usuario(nombre, email, "", img, role, google, _id);

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


  actualizarPefil(data: { email: string, nombre: string, role: string }) {

    data = {
      ...data,
      role: this.usuario.role
    }

    return this.http.put(`${base_url}/usuarios/${this.uid}`, data, {
      headers: {
        "token": this.token
      }
    })

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
