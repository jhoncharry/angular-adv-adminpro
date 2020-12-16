import { Usuario } from 'src/app/models/usuario.model';

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ModalImagenService } from '../../services/modal-imagen.service';
import { FileUploadService } from '../../services/file-upload.service';

import { UsuarioService } from 'src/app/services/usuario.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-imagen',
  templateUrl: './modal-imagen.component.html',
  styles: [
  ]
})
export class ModalImagenComponent implements OnInit {

  @ViewChild('modalImagen') myInputModalVariable: ElementRef;

  public imagenSubir: File;
  public imgTemp: any = null;

  public id_usuario_connect: any;
  public usuario: Usuario;



  constructor(public modalImagenService: ModalImagenService,
    private fileUploadService: FileUploadService,
    private usuarioService: UsuarioService,) {

    this.usuarioService.validarUsuarioSesion().subscribe(resp => {
      this.id_usuario_connect = resp;
    });

    this.usuario = usuarioService.usuario;

  }

  ngOnInit(): void {
  }


  cerrarModal() {
    this.imgTemp = null;
    this.myInputModalVariable.nativeElement.value = null;
    this.modalImagenService.cerrarModal();
  }


  cambiarImagen(file: File) {

    this.imagenSubir = file;

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

    const id = this.modalImagenService.id;
    const tipo = this.modalImagenService.tipo;


    this.fileUploadService.actualizarFoto(this.imagenSubir, tipo, id)
      .then(img => {
        Swal.fire("Guardado", "Imagen de usuario actualizada", "success");
        this.modalImagenService.nuevaImagen.emit(img);

        if (this.id_usuario_connect === id) {
          this.usuario.img = img
        }


        this.cerrarModal();
      }).catch(error => {
        console.log(error);
        Swal.fire("Error", "No se pudo subir la imagen", "error")

      });
  }


}
