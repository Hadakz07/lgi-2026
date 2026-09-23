//js/utils.js - exportar funciones
export function calcularPromedio(notas){
    return notas.reduce((a,b)=>a+b,0)/notas.length;
}

export function estaAprobado(nota, minima=6){
    return notas>=minima;
}

export const VERSION="1.0.0";

//exportacion por defecto(un solo archivo)
export default class Estudiantes{
    constructor(nombre,notas){
        this.nombre=nombre;
        this.notas=notas;
    }
    getPromedio(){
        return calcularPromedio(this.notas);
    }
}