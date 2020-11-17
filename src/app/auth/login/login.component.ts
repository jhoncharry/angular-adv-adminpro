import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import Swal from 'sweetalert2';

declare const gapi: any;

import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public email: string;
  public auth2: any;

  public formSubmitted = false;
  public loginForm = this.fb.group({

    email: ["test1@gmail.com", [Validators.required, Validators.email, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]],
    password: ["123456", [Validators.required, Validators.minLength(3)]],
    remember: [false]
  });

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private ngZone: NgZone

  ) { }


  ngOnInit(): void {

    this.email = localStorage.getItem("email") || "";

    if (this.email.length > 1) {
      this.loginForm.get("email").setValue(this.email);
      this.loginForm.get("remember").setValue(true);
    }

    this.renderButton();
  }


  login() {

    this.usuarioService.login(this.loginForm.value)
      .subscribe(resp => {
        // Navegar al dashboard
        this.router.navigateByUrl("/")
      },
        (error) => {
          // Si sucede un error
          Swal.fire("Error", error.error.message, "error");
        });


  }




  renderButton() {
    gapi.signin2.render('my-signin2', {
      'scope': 'profile email',
      'width': 240,
      'height': 50,
      'longtitle': true,
      'theme': 'dark'
    });

    this.startApp();

  }



  async startApp() {

    await this.usuarioService.googleInit();
    this.auth2 = this.usuarioService.auth2;

    this.attachSignin(document.getElementById('my-signin2'));

  }



  attachSignin(element) {

    this.auth2.attachClickHandler(element, {},
      (googleUser) => {

        const id_token = googleUser.getAuthResponse().id_token;
        // console.log(id_token);

        this.usuarioService.loginGoogle(id_token)
          .subscribe(resp => {

            // Navegar al dashboard
            this.ngZone.run(() => {
              this.router.navigateByUrl("/")
            });

          },
            (error) => {
              // Si sucede un error
              this.usuarioService.logout();
              Swal.fire("Error", error.error.message, "error");
            });


      }, (error) => {
        alert(JSON.stringify(error, undefined, 2));
      });

  }





}
