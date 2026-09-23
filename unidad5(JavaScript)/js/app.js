//js/app.js - importar
import Estudiantes,{calcularPromedio,VERSION} from "js/utils.js";

const ana=new Estudiantes('Ana',[8,9,7,5]);
console.log(ana.getPromedio());
console.log(calcularPromedio([5,6]));
console.log(VERSION);