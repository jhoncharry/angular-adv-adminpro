import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  constructor() { }


  async actualizarFoto(
    archivo: File,
    tipo: "usuarios" | "medicos" | "hospitales",
    id: string
  ) {

    try {

      const url = `${base_url}/upload/${tipo}/${id}`;
      const formaData = new FormData();

      formaData.append("imagen", archivo);

      const resp = await fetch(url, {

        method: "PUT",
        headers: {
          "token": localStorage.getItem("token") || ""
        },
        body: formaData


      });

      const data = await resp.json();

      if (data.ok) {
        return data.nombreArchivo
      } else {
        console.log(data.message);
        return false;
      }


    } catch (error) {
      console.log(error);
      return false;
    }

  }




}
