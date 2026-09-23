function calcularPromedio(notas){
    return notas.reduce((a,b)=>a+b,0)/notas.length;
}

function estaAprobado(nota, minima=6){
    return nota>=minima;
}

export const estudiantes=[
    {nombre: "Ana", notas:[8,9,7.5]},
    {nombre: "Juan", notas:[4,5,5]},
    {nombre: "Maria", notas:[10,9,8]},
    {nombre: "Pedro", notas:[6,6,7]},
    {nombre: "Lucia", notas:[3,4,5]}
];

export const estudiantesConPromedio= estudiantes.map(est=>{
    const promedio=calcularPromedio(est.notas);
    return{
        ...est,
        promedio: promedio,
        aprobado: estaAprobado(promedio)
    };
});

const aprobados=estudiantesConPromedio.filter(est=>est.aprobado);

console.log("Todos los estudiantes con su promedio: ",estudiantesConPromedio);
console.log("Estudiantes aprobados: ",aprobados)