import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
import { RegisterForm } from '../interfaces/register-form.interface';
import { LoginForm } from '../interfaces/login-form.interface';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Usuario } from '../models/usuario.model';
import { CargarUsuario } from '../interfaces/cargar-usuarios.interface';



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

  get headers() {

    return {
      headers: {
        "token": this.token
      }
    }

  }


  


  googleInit() {

    return new Promise<void>(resolve => {

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

        const { email, google, nombre, role, img = "", uid } = resp.usuarioDB;
        this.usuario = new Usuario(nombre, email, "", img, role, google, uid);

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

    return this.http.put(`${base_url}/usuarios/${this.uid}`, data, this.headers)

  }

  guardarUsuario(usuario: Usuario) {

    return this.http.put(`${base_url}/usuarios/${usuario.uid}`, usuario, this.headers)

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


  cargarUsuarios(desde: number = 0) {

    const url = `${base_url}/usuarios?desde=${desde}`;

    return this.http.get<CargarUsuario>(url, this.headers)
      .pipe(
        map(resp => {

          const usuarios = resp.findUsers.map(
            user => new Usuario(user.nombre, user.email, "", user.img, user.role, user.google, user.uid)
          );

          return {
            total: resp.total,
            usuarios
          }


        })
      )

  }


  eliminarUsuario(usuario: Usuario) {
    const url = `${base_url}/usuarios/${usuario.uid}`;
    return this.http.delete(url, this.headers)
  }





}
