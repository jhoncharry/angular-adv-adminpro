import { Component, OnInit, OnDestroy } from '@angular/core';

import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';

import { Hospital } from 'src/app/models/hospital.model';
import { HospitalService } from '../../../services/hospital.service';
import { ModalImagenService } from '../../../services/modal-imagen.service';
import { BusquedasService } from '../../../services/busquedas.service';

import { delay } from 'rxjs/operators';


@Component({
  selector: 'app-hospitales',
  templateUrl: './hospitales.component.html',
  styles: [
  ]
})
export class HospitalesComponent implements OnInit, OnDestroy {


  public hospitales: Hospital[] = [];
  public cargando: boolean = true;

  private imgSubs: Subscription;


  constructor(private hospitalService: HospitalService,
    private modalImagenService: ModalImagenService,
    private busquedasService: BusquedasService) { }


  ngOnInit(): void {

    this.cargarHospitales();


    this.imgSubs = this.modalImagenService.nuevaImagen
      .pipe(delay(500))
      .subscribe(img => this.cargarHospitales());


  }

  ngOnDestroy(): void {
    console.log("se destruyó");
    this.imgSubs.unsubscribe();
  }



  cargarHospitales() {

    this.cargando = true;

    this.hospitalService.cargarHospitales()
      .subscribe(hospitales => {
        this.cargando = false;
        this.hospitales = hospitales;
      });


  }

  async abrirSweetAlert() {

    const { value = "" } = await Swal.fire<string>({
      title: "Crear hospital",
      text: "Ingrese el nombre del nuevo hospital",
      input: 'text',
      inputPlaceholder: 'Nombre del hospital',
      showCancelButton: true
    })

    if (value.trim().length > 0) {

      this.hospitalService.crearHospital(value)
        .subscribe((resp: any) => {
          this.hospitales.push(resp.hospitalDB);
        })

    }


  }


  guardarCambios(hospital: Hospital) {

    this.hospitalService.actualizarHospital(hospital._id, hospital.nombre).
      subscribe(resp => {
        Swal.fire("Actualzado", hospital.nombre, "success");
      });

  }


  eliminarHospital(hospital: Hospital) {

    this.hospitalService.borrarHospital(hospital._id).
      subscribe(resp => {
        this.cargarHospitales();
        Swal.fire("Borrado", hospital.nombre, "success");
      });

  }




  abrirModal(hospital: Hospital) {

    this.modalImagenService.abrirModal("hospitales", hospital._id, hospital.img);

  }


  buscar(termino: string) {

    if (termino.length === 0) {
      /*     return this.usuarios = this.usuariosTemp; */
      return this.cargarHospitales()
    }

    this.busquedasService.buscar("hospitales", termino)
      .subscribe(resultados => {
        this.hospitales = resultados;
      })

  }



}
