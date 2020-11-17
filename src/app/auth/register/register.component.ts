import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import Swal from 'sweetalert2';

import { UsuarioService } from '../../services/usuario.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  public formSubmitted = false;

  public registerForm = this.fb.group({

    nombre: ["Jhon", [Validators.required, Validators.minLength(3)]],
    email: ["test1@gmail.com", [Validators.required, Validators.email, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]],
    password: ["123456", [Validators.required, Validators.minLength(3)]],
    password2: ["123456", Validators.required],
    terminos: [true, Validators.requiredTrue],

  }, {
    validators: this.passwordIguales("password", "password2")
  });


  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router
  ) { }


  crearUsuario() {

    this.formSubmitted = true;
    console.log(this.registerForm.value);


    if (this.registerForm.invalid) {
      return;
    }


    // Realizar el posteo
    this.usuarioService.crearUsuario(this.registerForm.value)
      .subscribe(resp => {
        // Navegar al dashboard
        this.router.navigateByUrl("/")
      }, (error) => {
        // Si sucede un error
        Swal.fire("Error", error.error.message, "error");
      });


  }


  campoNoValido(campo: string): boolean {

    if (this.registerForm.get(campo).invalid && this.formSubmitted) {
      return true;
    } else {
      return false;
    }

  }


  passwordsNoValidas(): boolean {

    const password_1 = this.registerForm.get("password").value;
    const password_2 = this.registerForm.get("password2").value;

    if ((password_1 !== password_2) && this.formSubmitted) {
      return true;
    } else {
      return false;
    }

  }


  aceptaTerminos(): boolean {
    return !this.registerForm.get("terminos").value && this.formSubmitted
  }


  
  passwordIguales(controlName: string, matchingControlName: string) {

    return (formGroup: FormGroup) => {

      const control = formGroup.get(controlName);
      const matchingControl = formGroup.get(matchingControlName);

      // set error on matchingControl if validation fails
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }

    }


  }






}
