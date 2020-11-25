import { ThrowStmt } from '@angular/compiler';
import { Injectable, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';



const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class ModalImagenService {

  private _ocultarModal: boolean = true;
  public tipo: "usuarios" | "medicos" | "hospitales";
  public id: string;
  public img: string;

  public nuevaImagen: EventEmitter<string> = new EventEmitter<string>();

  constructor() { }

  get ocultarModal() {
    return this._ocultarModal;
  }

  
  abrirModal(
    tipo: "usuarios" | "medicos" | "hospitales",
    id: string,
    img: string = "no-img"
  ) {
    this._ocultarModal = false;
    this.tipo = tipo;
    this.id = id;

    if (img.includes("https")) {
      this.img = img;
    } else {
      this.img = `${base_url}/upload/${tipo}/${img}`;
    }

  }

  cerrarModal() {
    this._ocultarModal = true;
  }


}
