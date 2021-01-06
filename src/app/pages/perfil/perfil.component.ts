import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

import { UsuarioService } from '../../services/usuario.service';
import { FileUploadService } from '../../services/file-upload.service';

import { Usuario } from '../../models/usuario.model';
import { error } from 'protractor';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styles: [
  ]
})
export class PerfilComponent implements OnInit {


  public perfilForm: FormGroup;
  public usuario: Usuario;
  public imagenSubir: File;
  public imgTemp: any = null;


  constructor(private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private fileUploadService: FileUploadService) {

    this.usuario = usuarioService.usuario;
  }

  ngOnInit(): void {

    this.perfilForm = this.fb.group({
      nombre: [this.usuario.nombre, [Validators.required, Validators.minLength(3)]],
      email: [this.usuario.email, [Validators.required, Validators.email, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]],

    });

  }



  actualizarPerfil() {

    this.usuarioService.actualizarPefil(this.perfilForm.value)
      .subscribe(resp => {

        const { nombre, email } = this.perfilForm.value
        this.usuario.nombre = nombre;
        this.usuario.email = email;

        Swal.fire("Guardado", "Cambios fueron guardados", "success")

      }, (error) => {

        console.log(error);
        Swal.fire("Error", error.error.message, "error")
      });

  }


  cambiarImagen(file: File) {

    this.imagenSubir = file;

    console.log(file);

    if (!file) {
      return this.imgTemp = null;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = () => {
      this.imgTemp = reader.result;
    }

  }



  subirImagen() {
    this.fileUploadService.actualizarFoto(this.imagenSubir, "usuarios", this.usuario.uid)
      .then(img => {

        this.usuario.img = img

        Swal.fire("Guardado", "Imagen de usuario actualizada", "success")
      }).catch(error => {
        console.log(error);
        Swal.fire("Error", "No se pudo subir la imagen", "error")

      });
  }



}
