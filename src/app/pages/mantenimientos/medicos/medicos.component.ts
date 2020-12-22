import { Component, OnInit, OnDestroy } from '@angular/core';

import * as $ from "jquery";

import Swal from 'sweetalert2';
import { delay } from 'rxjs/operators';
import { Subscription } from 'rxjs';


import { Medico } from '../../../models/medico.model';

import { MedicoService } from '../../../services/medico.service';
import { BusquedasService } from '../../../services/busquedas.service';
import { ModalImagenService } from '../../../services/modal-imagen.service';


@Component({
  selector: 'app-medicos',
  templateUrl: './medicos.component.html',
  styles: [
  ]
})
export class MedicosComponent implements OnInit, OnDestroy {

  public medicos: Medico[] = [];
  public cargando: boolean = true;

  private imgSubs: Subscription;

  constructor(private medicoService: MedicoService,
    private modalImagenService: ModalImagenService,
    private busquedasService: BusquedasService) { }




  ngOnInit(): void {

    this.cargarMedicos();

    this.imgSubs = this.modalImagenService.nuevaImagen
      .pipe(delay(500))
      .subscribe(img => this.cargarMedicos());

  }

  ngOnDestroy(): void {
    console.log("se destruyó");
    this.imgSubs.unsubscribe();

    $('.tooltip').remove();

  }



  cargarMedicos() {

    this.cargando = true;

    this.medicoService.cargarMedicos()
      .subscribe(medicos => {
        this.cargando = false;
        this.medicos = medicos;
      });


  }



  eliminarMedico(medico: Medico) {



    Swal.fire({
      title: 'Are you sure?',
      text: `Estas a punto de borrar ${medico.nombre}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {

      if (result.isConfirmed) {

        this.medicoService.borrarMedico(medico._id)
          .subscribe(resp => {

            Swal.fire(
              'Usuario Borrado!',
              `${medico.nombre} fue eliminado correctamente`,
              'success'
            );

            this.cargarMedicos();

          })
      }


    });



  }



  abrirModal(medico: Medico) {

    this.modalImagenService.abrirModal("medicos", medico._id, medico.img);

  }


  buscar(termino: string) {

    if (termino.length === 0) {
      /*     return this.usuarios = this.usuariosTemp; */
      return this.cargarMedicos()
    }

    this.busquedasService.buscar("medicos", termino)
      .subscribe(resultados => {
        this.medicos = resultados;
      })

  }


}
