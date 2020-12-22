import { Component, OnInit, OnDestroy } from '@angular/core';
import Swal from 'sweetalert2';

import { Usuario } from 'src/app/models/usuario.model';

import { UsuarioService } from '../../../services/usuario.service';
import { BusquedasService } from '../../../services/busquedas.service';
import { ModalImagenService } from '../../../services/modal-imagen.service';
import { delay } from 'rxjs/operators';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styles: [
  ]
})
export class UsuariosComponent implements OnInit, OnDestroy {


  public totalUsuarios: number = 0;
  public usuarios: Usuario[] = [];
  public usuariosTemp: Usuario[] = [];
  public desde: number = 0;
  public cargando: boolean = true;

  public imgSubs: Subscription;

  constructor(private usuarioService: UsuarioService,
    private busquedasService: BusquedasService,
    private modalImagenService: ModalImagenService) { }





  ngOnInit(): void {

    console.log("se construyó");

    this.CargarUsuario();

    this.imgSubs = this.modalImagenService.nuevaImagen
      .pipe(delay(500))
      .subscribe(img => this.CargarUsuario());

  }

  ngOnDestroy(): void {
    console.log("se destruyó");
    this.imgSubs.unsubscribe();
  }

  CargarUsuario() {

    this.cargando = true;

    this.usuarioService.cargarUsuarios(this.desde)
      .subscribe(({ total, usuarios }) => {
        this.totalUsuarios = total;
        this.usuarios = usuarios;
        this.usuariosTemp = usuarios;
        this.cargando = false;
      })

  }


  cambiarPagina(valor: number) {

    this.desde += valor;

    if (this.desde < 0) {
      this.desde = 0;
    } else if (this.desde >= this.totalUsuarios) {
      this.desde -= valor;
    } else {
      this.CargarUsuario();
    }



  }


  buscar(termino: string) {

    if (termino.length === 0) {
      return this.usuarios = this.usuariosTemp;
    }

    this.busquedasService.buscar("usuarios", termino)
      .subscribe((resultados: Usuario[]) => {
        this.usuarios = resultados;
      })

  }



  eliminarUsuario(usuario: Usuario) {

    if (usuario.uid === this.usuarioService.uid) {
      return Swal.fire("Error", "No puede borrarse a si mismo", "error");
    }

    Swal.fire({
      title: 'Are you sure?',
      text: `Estas a punto de borrar ${usuario.nombre}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {

      if (result.isConfirmed) {

        this.usuarioService.eliminarUsuario(usuario)
          .subscribe(resp => {

            Swal.fire(
              'Usuario Borrado!',
              `${usuario.nombre} fue elimninado correctamente`,
              'success'
            );

            this.CargarUsuario();

          })
      }


    })


  }


  cambiarRole(usuario: Usuario) {

    this.usuarioService.guardarUsuario(usuario)
      .subscribe(resp => {
        console.log(resp);
      })

  }


  abrirModal(usuario: Usuario) {
    this.modalImagenService.abrirModal("usuarios", usuario.uid, usuario.img);
  }



}
